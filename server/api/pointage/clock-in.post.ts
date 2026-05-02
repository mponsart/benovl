import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const userId = Number(actor.sub)

  const openEntry = await prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
  })
  if (openEntry) {
    throw createError({ statusCode: 400, message: 'Vous êtes déjà pointé. Effectuez d\'abord un pointage de sortie.' })
  }

  const entry = await prisma.timeEntry.create({
    data: { userId, clockIn: new Date() },
  })
  await logAudit({ actorId: userId, action: 'create', entity: 'TimeEntry', entityId: entry.id, details: { type: 'clock-in' } })
  return entry
})
