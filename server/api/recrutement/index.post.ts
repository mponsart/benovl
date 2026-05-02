import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const postingSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
  poleId: z.number().optional().nullable(),
  slots: z.number().int().min(1).default(1),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const body = await readBody(event)
  const result = postingSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const posting = await prisma.jobPosting.create({
    data: { ...result.data, createdById: Number(actor.sub) },
    include: { pole: true },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'create', entity: 'JobPosting', entityId: posting.id, details: { title: posting.title } })
  return posting
})
