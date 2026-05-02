import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const userId = Number(actor.sub)

  const threads = await prisma.messageThread.findMany({
    where: {
      participants: { some: { userId } },
    },
    include: {
      participants: {
        include: { user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const threadIds = threads.map(t => t.id)
  const unreadRows = await prisma.message.groupBy({
    by: ['threadId'],
    where: { threadId: { in: threadIds }, senderId: { not: userId }, isRead: false },
    _count: { _all: true },
  })
  const unreadMap = new Map(unreadRows.map(r => [r.threadId, r._count._all]))

  return threads.map(thread => ({ ...thread, unreadCount: unreadMap.get(thread.id) ?? 0 }))
})
