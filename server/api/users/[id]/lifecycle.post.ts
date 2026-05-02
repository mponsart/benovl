import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const lifecycleSchema = z.object({
  toStatus: z.enum(['actif', 'pause', 'suspendu', 'sorti']),
  reason: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = lifecycleSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw createError({ statusCode: 404, message: 'Utilisateur introuvable' })

  const fromStatus = user.lifecycle

  await prisma.user.update({ where: { id: userId }, data: { lifecycle: result.data.toStatus } })

  const event_ = await prisma.lifecycleEvent.create({
    data: {
      userId,
      fromStatus,
      toStatus: result.data.toStatus,
      reason: result.data.reason,
      changedById: Number(actor.sub),
    },
  })
  await logAudit({ actorId: Number(actor.sub), targetId: userId, action: 'update', entity: 'LifecycleEvent', entityId: event_.id, details: { from: fromStatus, to: result.data.toStatus } })
  return event_
})
