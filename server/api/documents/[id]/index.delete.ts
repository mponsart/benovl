import { requireAdminOrResponsable, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.document.delete({ where: { id } })
  await logAudit({ actorId: Number(actor.sub), action: 'delete', entity: 'Document', entityId: id })
  return { message: 'Document supprimé' }
})
