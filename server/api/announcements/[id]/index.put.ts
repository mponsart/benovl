import { z } from 'zod'
import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['global', 'pole']).optional(),
  poleId: z.number().optional().nullable(),
  isPinned: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const a = await prisma.announcement.update({ where: { id }, data: result.data, include: { pole: true } })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'Announcement', entityId: id })
  return a
})
