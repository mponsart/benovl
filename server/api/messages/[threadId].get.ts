import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const threadId = Number(getRouterParam(event, 'threadId'))
  const userId = Number(actor.sub)

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      participants: {
        include: { user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
      messages: {
        include: { sender: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!thread) throw createError({ statusCode: 404, message: 'Thread introuvable' })

  const isParticipant = thread.participants.some(p => p.userId === userId)
  if (!isParticipant) throw createError({ statusCode: 403, message: 'Accès refusé' })

  // Mark messages as read
  await prisma.message.updateMany({
    where: { threadId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  })

  // Update lastReadAt
  await prisma.messageParticipant.updateMany({
    where: { threadId, userId },
    data: { lastReadAt: new Date() },
  })

  return thread
})
