import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const updateSchema = z.object({
  status: z.enum(['new', 'reviewing', 'interview', 'accepted', 'rejected']).optional(),
  notes: z.string().optional().nullable(),
  assignedToId: z.number().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const existing = await prisma.application.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, message: 'Candidature introuvable' })

  const application = await prisma.application.update({ where: { id }, data: result.data })

  if (result.data.status && result.data.status !== existing.status) {
    await prisma.applicationHistory.create({
      data: {
        applicationId: id,
        userId: Number(actor.sub),
        fromStatus: existing.status,
        toStatus: result.data.status,
      },
    })
  }

  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'Application', entityId: id })
  return application
})
