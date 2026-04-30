import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../../utils/auth'
import prisma from '../../../../db/client'

const updateSlotSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  location: z.string().optional().nullable(),
  maxCapacity: z.number().int().min(1).optional(),
  poleId: z.number().optional().nullable(),
  openForSelfRegistration: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSlotSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const data: Record<string, unknown> = { ...result.data }
  if (result.data.startAt) data.startAt = new Date(result.data.startAt)
  if (result.data.endAt) data.endAt = new Date(result.data.endAt)

  const slot = await prisma.planningSlot.update({ where: { id }, data, include: { pole: true } })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'PlanningSlot', entityId: id })
  return slot
})
