import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const schema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { token, password } = result.data

  const user = await prisma.user.findUnique({ where: { resetToken: token } })
  if (!user || !user.resetExpiry || user.resetExpiry < new Date()) {
    throw createError({ statusCode: 400, message: 'Lien de réinitialisation invalide ou expiré' })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetExpiry: null },
  })

  // Invalidate all active sessions for security
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } })

  await logAudit({ actorId: user.id, action: 'password_reset', entity: 'User', entityId: user.id })

  return { message: 'Mot de passe réinitialisé avec succès' }
})
