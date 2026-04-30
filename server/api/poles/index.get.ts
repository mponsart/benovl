import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const poles = await prisma.pole.findMany({
    include: { _count: { select: { users: true, slots: true } } },
    orderBy: { name: 'asc' },
  })
  return poles
})
