import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['draft', 'published', 'closed']).optional(),
  poleId: z.number().optional().nullable(),
  slots: z.number().int().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const posting = await prisma.jobPosting.update({
    where: { id },
    data: result.data,
    include: { pole: true },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'JobPosting', entityId: id })
  return posting
})
