import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const isAdmin = ['admin', 'responsable'].includes(actor.role)

  const query = getQuery(event)
  const userId = query.userId ? Number(query.userId) : undefined

  const entries = await prisma.timeEntry.findMany({
    where: isAdmin
      ? userId ? { userId } : {}
      : { userId: Number(actor.sub) },
    include: {
      user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
    },
    orderBy: { clockIn: 'desc' },
    take: 50,
  })
  return entries
})
