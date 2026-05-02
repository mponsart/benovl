import { z } from 'zod'
import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

const threadSchema = z.object({
  participantIds: z.array(z.number().int()).min(1),
  subject: z.string().optional().nullable(),
  message: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const body = await readBody(event)
  const result = threadSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const senderId = Number(actor.sub)
  const allParticipantIds = [...new Set([senderId, ...result.data.participantIds])]

  const thread = await prisma.messageThread.create({
    data: {
      subject: result.data.subject,
      participants: {
        create: allParticipantIds.map(uid => ({ userId: uid })),
      },
      messages: {
        create: { senderId, content: result.data.message },
      },
    },
    include: {
      participants: {
        include: { user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
      messages: {
        include: { sender: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
    },
  })
  return thread
})
