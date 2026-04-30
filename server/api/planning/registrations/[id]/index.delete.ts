import { requireAuth, logAudit } from '../../../../utils/auth'
import prisma from '../../../../db/client'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const reg = await prisma.planningRegistration.findUnique({ where: { id } })
  if (!reg) throw createError({ statusCode: 404, message: 'Inscription introuvable' })

  const isAdminOrResp = ['admin', 'responsable'].includes(payload.role)
  if (!isAdminOrResp && reg.userId !== Number(payload.sub)) throw createError({ statusCode: 403, message: 'Accès refusé' })

  await prisma.planningRegistration.delete({ where: { id } })
  await logAudit({ actorId: Number(payload.sub), action: 'delete', entity: 'PlanningRegistration', entityId: id })
  return { message: 'Inscription supprimée' }
})
