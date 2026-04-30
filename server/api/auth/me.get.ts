import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    include: { pole: true },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
  })
  if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })
  return user
})
