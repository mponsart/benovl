import { requireAuth } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const pole = await prisma.pole.findUnique({ where: { id }, include: { users: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true }, orderBy: { nom: 'asc' } } } })
  if (!pole) throw createError({ statusCode: 404, message: 'Pôle introuvable' })
  return pole
})
