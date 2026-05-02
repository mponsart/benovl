import { z } from 'zod'
import prisma from '../../../db/client'

const appSchema = z.object({
  jobPostingId: z.number().int(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  coverLetter: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = appSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const posting = await prisma.jobPosting.findUnique({ where: { id: result.data.jobPostingId } })
  if (!posting || posting.status !== 'published') {
    throw createError({ statusCode: 400, message: 'Offre non disponible' })
  }

  const application = await prisma.application.create({
    data: result.data,
  })
  return application
})
