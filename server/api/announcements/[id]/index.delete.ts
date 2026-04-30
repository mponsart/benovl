import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.announcement.delete({ where: { id } })
  await logAudit({ actorId: Number(actor.sub), action: 'delete', entity: 'Announcement', entityId: id })
  return { message: 'Annonce supprimée' }
})
