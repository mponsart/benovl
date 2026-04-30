import { requireAuth } from '../../../../utils/auth'
import prisma from '../../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const slot = await prisma.planningSlot.findUnique({
    where: { id },
    include: { pole: true, registrations: { include: { user: { select: { id: true, nom: true, prenom: true, email: true } } } }, _count: { select: { registrations: true } } },
  })
  if (!slot) throw createError({ statusCode: 404, message: 'Créneau introuvable' })
  return slot
})
