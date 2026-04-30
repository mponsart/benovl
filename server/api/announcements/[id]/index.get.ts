import { requireAuth } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const a = await prisma.announcement.findUnique({ where: { id }, include: { pole: true } })
  if (!a) throw createError({ statusCode: 404, message: 'Annonce introuvable' })
  return a
})
