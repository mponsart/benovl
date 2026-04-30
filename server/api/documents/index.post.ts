import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const docSchema = z.object({
  name: z.string().min(1),
  filename: z.string().min(1),
  type: z.enum(['attestation', 'convention', 'autre']).default('autre'),
  userId: z.number().optional().nullable(),
  size: z.number().optional().nullable(),
  mimeType: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const body = await readBody(event)
  const result = docSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const doc = await prisma.document.create({ data: result.data, include: { user: { select: { id: true, nom: true, prenom: true } } } })
  await logAudit({ actorId: Number(actor.sub), action: 'create', entity: 'Document', entityId: doc.id, details: { name: doc.name } })
  return doc
})
