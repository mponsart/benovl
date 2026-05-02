import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const userId = Number(actor.sub)

  const openEntry = await prisma.timeEntry.findFirst({
    where: { userId, clockOut: null },
    orderBy: { clockIn: 'desc' },
  })
  if (!openEntry) {
    throw createError({ statusCode: 400, message: 'Aucun pointage d\'entrée actif trouvé.' })
  }

  const clockOut = new Date()
  const durationMs = clockOut.getTime() - openEntry.clockIn.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  const MAX_HOURS_WITHOUT_BREAK = 6
  const status = durationHours > MAX_HOURS_WITHOUT_BREAK && openEntry.breakMinutes === 0 ? 'anomaly' : 'validated'

  const entry = await prisma.timeEntry.update({
    where: { id: openEntry.id },
    data: { clockOut, status },
  })
  await logAudit({ actorId: userId, action: 'update', entity: 'TimeEntry', entityId: entry.id, details: { type: 'clock-out', status } })
  return entry
})
