import { z } from 'zod'
import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

const messageSchema = z.object({
  content: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const threadId = Number(getRouterParam(event, 'threadId'))
  const userId = Number(actor.sub)

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: { participants: true },
  })
  if (!thread) throw createError({ statusCode: 404, message: 'Thread introuvable' })

  const isParticipant = thread.participants.some(p => p.userId === userId)
  if (!isParticipant) throw createError({ statusCode: 403, message: 'Accès refusé' })

  const body = await readBody(event)
  const result = messageSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const message = await prisma.message.create({
    data: { threadId, senderId: userId, content: result.data.content },
    include: { sender: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
  })

  await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } })

  return message
})
