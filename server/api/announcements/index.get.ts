import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const type = query.type ? String(query.type) : undefined
  const poleId = query.poleId ? Number(query.poleId) : undefined

  const announcements = await prisma.announcement.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(poleId ? { poleId } : {}),
    },
    include: { pole: true },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  })
  return announcements
})
