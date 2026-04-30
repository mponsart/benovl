import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../../utils/auth'
import prisma from '../../../../db/client'

const updateRegSchema = z.object({
  status: z.enum(['inscrit', 'confirme', 'absent']),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateRegSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const reg = await prisma.planningRegistration.update({
    where: { id },
    data: result.data,
    include: { user: { select: { id: true, nom: true, prenom: true } }, slot: true },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'PlanningRegistration', entityId: id, details: result.data })
  return reg
})
