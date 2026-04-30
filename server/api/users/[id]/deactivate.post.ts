import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (Number(actor.sub) === id) throw createError({ statusCode: 400, message: 'Vous ne pouvez pas désactiver votre propre compte' })

  const user = await prisma.user.update({
    where: { id },
    data: { status: 'suspendu' },
    select: { id: true, email: true, status: true },
  })
  await prisma.refreshToken.deleteMany({ where: { userId: id } })
  await logAudit({ actorId: Number(actor.sub), targetId: id, action: 'update', entity: 'User', entityId: id, details: { status: 'suspendu' } })
  return user
})
