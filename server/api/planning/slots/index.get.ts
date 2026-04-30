import { requireAuth } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const from = query.from ? new Date(String(query.from)) : undefined
  const to = query.to ? new Date(String(query.to)) : undefined
  const poleId = query.poleId ? Number(query.poleId) : undefined

  const slots = await prisma.planningSlot.findMany({
    where: {
      ...(from || to ? { startAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
      ...(poleId ? { poleId } : {}),
    },
    include: {
      pole: true,
      registrations: { include: { user: { select: { id: true, nom: true, prenom: true, email: true } } } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startAt: 'asc' },
  })
  return slots
})
