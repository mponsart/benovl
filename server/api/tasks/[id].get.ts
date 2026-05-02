import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      assignedTo: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      pole: true,
      comments: {
        include: { user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
        orderBy: { createdAt: 'asc' },
      },
      attachments: {
        include: { user: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
      },
    },
  })
  if (!task) throw createError({ statusCode: 404, message: 'Tâche introuvable' })
  return task
})
