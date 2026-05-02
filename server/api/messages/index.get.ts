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

  return threads.map(thread => {
    const unreadCount = thread.messages.filter(m => !m.isRead && m.senderId !== userId).length
    return { ...thread, unreadCount }
  })
})
