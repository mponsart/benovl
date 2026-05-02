import { z } from 'zod'
import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignedToId: z.number().optional().nullable(),
  poleId: z.number().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  isCollective: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const body = await readBody(event)
  const result = taskSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { dueDate, ...rest } = result.data
  const task = await prisma.task.create({
    data: {
      ...rest,
      createdById: Number(actor.sub),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      assignedTo: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      pole: true,
    },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'create', entity: 'Task', entityId: task.id, details: { title: task.title } })
  return task
})
