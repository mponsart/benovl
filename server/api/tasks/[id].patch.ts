import { z } from 'zod'
import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.number().optional().nullable(),
  poleId: z.number().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isCollective: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { dueDate, ...rest } = result.data
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
    include: {
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      assignedTo: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      pole: true,
    },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'Task', entityId: id })
  return task
})
