import { z } from 'zod'
import { requireAuth, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const regSchema = z.object({
  slotId: z.number().int(),
  userId: z.number().int().optional(),
  status: z.enum(['inscrit', 'confirme', 'absent']).default('inscrit'),
})

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const body = await readBody(event)
  const result = regSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const isAdminOrResp = ['admin', 'responsable'].includes(payload.role)
  const targetUserId = isAdminOrResp && result.data.userId ? result.data.userId : Number(payload.sub)

  const slot = await prisma.planningSlot.findUnique({ where: { id: result.data.slotId }, include: { _count: { select: { registrations: true } } } })
  if (!slot) throw createError({ statusCode: 404, message: 'Créneau introuvable' })
  if (!slot.openForSelfRegistration && !isAdminOrResp) throw createError({ statusCode: 403, message: 'Inscription non ouverte' })
  if (slot._count.registrations >= slot.maxCapacity) throw createError({ statusCode: 400, message: 'Créneau complet' })

  const existing = await prisma.planningRegistration.findUnique({ where: { userId_slotId: { userId: targetUserId, slotId: result.data.slotId } } })
  if (existing) throw createError({ statusCode: 409, message: 'Déjà inscrit à ce créneau' })

  const reg = await prisma.planningRegistration.create({
    data: { userId: targetUserId, slotId: result.data.slotId, status: isAdminOrResp ? result.data.status : 'inscrit' },
    include: { user: { select: { id: true, nom: true, prenom: true, email: true } }, slot: true },
  })
  await logAudit({ actorId: Number(payload.sub), targetId: targetUserId, action: 'create', entity: 'PlanningRegistration', entityId: reg.id })
  return reg
})
