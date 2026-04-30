import { requireAdminOrResponsable } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  const user = await prisma.user.findUnique({
    where: { id },
    include: { pole: true, registrations: { include: { slot: true }, orderBy: { createdAt: 'desc' }, take: 10 }, documents: { orderBy: { createdAt: 'desc' }, take: 10 } },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
  })
  if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })
  return user
})
