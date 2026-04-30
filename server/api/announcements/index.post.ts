import { z } from 'zod'
import { requireAdmin, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['global', 'pole']).default('global'),
  poleId: z.number().optional().nullable(),
  isPinned: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const body = await readBody(event)
  const result = announcementSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const announcement = await prisma.announcement.create({ data: result.data, include: { pole: true } })
  await logAudit({ actorId: Number(actor.sub), action: 'create', entity: 'Announcement', entityId: announcement.id, details: { title: announcement.title } })
  return announcement
})
