import { z } from 'zod'
import { requireAdminOrResponsable, logAudit } from '../../../../utils/auth'
import prisma from '../../../../db/client'

const skillSchema = z.object({
  name: z.string().min(1),
  level: z.enum(['debutant', 'intermediaire', 'avance', 'expert']),
  category: z.string().optional().nullable(),
  obtainedAt: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdminOrResponsable(event)
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = skillSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const { obtainedAt, ...rest } = result.data
  const skill = await prisma.skill.create({
    data: {
      ...rest,
      userId,
      obtainedAt: obtainedAt ? new Date(obtainedAt) : null,
    },
  })
  await logAudit({ actorId: Number(actor.sub), targetId: userId, action: 'create', entity: 'Skill', entityId: skill.id, details: { name: skill.name } })
  return skill
})
