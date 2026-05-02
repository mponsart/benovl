import { z } from 'zod'
import { requireAdmin, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const updateSchema = z.object({
  clockIn: z.string().datetime().optional(),
  clockOut: z.string().datetime().optional().nullable(),
  breakMinutes: z.number().int().min(0).optional(),
  note: z.string().optional().nullable(),
  status: z.enum(['pending', 'validated', 'anomaly']).optional(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { clockIn, clockOut, ...rest } = result.data
  const entry = await prisma.timeEntry.update({
    where: { id },
    data: {
      ...rest,
      ...(clockIn ? { clockIn: new Date(clockIn) } : {}),
      ...(clockOut !== undefined ? { clockOut: clockOut ? new Date(clockOut) : null } : {}),
    },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'TimeEntry', entityId: id, details: { correction: true } })
  return entry
})
