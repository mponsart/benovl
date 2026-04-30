import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
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

  const user = await prisma.user.findUnique({ where: { inviteToken: token } })
  if (!user || !user.inviteExpiry || user.inviteExpiry < new Date()) {
    throw createError({ statusCode: 400, message: "Lien d'invitation invalide ou expiré" })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, inviteToken: null, inviteExpiry: null, status: 'actif' },
  })

  await logAudit({ actorId: user.id, action: 'invite', entity: 'User', entityId: user.id })

  const tokenPayload = { sub: String(updatedUser.id), email: updatedUser.email, role: updatedUser.role }
  const accessToken = await signAccessToken(tokenPayload)
  const refreshToken = await signRefreshToken(tokenPayload)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: updatedUser.id, expiresAt } })

  setCookie(event, 'access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return { message: 'Compte activé avec succès', accessToken }
})
