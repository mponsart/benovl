import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (Number(actor.sub) === id) throw createError({ statusCode: 400, message: 'Vous ne pouvez pas supprimer votre propre compte' })

  await prisma.user.delete({ where: { id } })
  await logAudit({ actorId: Number(actor.sub), targetId: id, action: 'delete', entity: 'User', entityId: id })
  return { message: 'Utilisateur supprimé' }
})
