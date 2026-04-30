import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const slotSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().optional().nullable(),
  maxCapacity: z.number().int().min(1).default(10),
  poleId: z.number().optional().nullable(),
  openForSelfRegistration: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const body = await readBody(event)
  const result = slotSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const slot = await prisma.planningSlot.create({
    data: { ...result.data, startAt: new Date(result.data.startAt), endAt: new Date(result.data.endAt) },
    include: { pole: true },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'create', entity: 'PlanningSlot', entityId: slot.id, details: { title: slot.title } })
  return slot
})
