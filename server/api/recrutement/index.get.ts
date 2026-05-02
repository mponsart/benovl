import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const status = query.status ? String(query.status) : undefined

  const postings = await prisma.jobPosting.findMany({
    where: status ? { status } : {},
    include: {
      pole: true,
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return postings
})
