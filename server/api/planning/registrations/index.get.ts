import { requireAuth } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const query = getQuery(event)
  const slotId = query.slotId ? Number(query.slotId) : undefined
  const userId = query.userId ? Number(query.userId) : undefined

  const isAdminOrResp = ['admin', 'responsable'].includes(payload.role)

  const registrations = await prisma.planningRegistration.findMany({
    where: {
      ...(slotId ? { slotId } : {}),
      ...(userId ? { userId } : !isAdminOrResp ? { userId: Number(payload.sub) } : {}),
    },
    include: {
      user: { select: { id: true, nom: true, prenom: true, email: true } },
      slot: { include: { pole: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return registrations
})
