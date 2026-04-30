import { z } from 'zod'
import { requireAdmin } from '../../utils/auth'
import prisma from '../../db/client'

const poleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const result = poleSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const existing = await prisma.pole.findUnique({ where: { name: result.data.name } })
  if (existing) throw createError({ statusCode: 409, message: 'Pôle déjà existant' })

  return await prisma.pole.create({ data: result.data })
})
