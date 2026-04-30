import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import prisma from '../../../db/client'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })
  return await prisma.pole.update({ where: { id }, data: result.data })
})
