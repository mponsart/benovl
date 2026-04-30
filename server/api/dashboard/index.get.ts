import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'
import { parseAuditDetails } from '../../utils/json'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const now = new Date()
  const [totalUsers, activeUsers, totalSlots, upcomingSlots, totalRegistrations, confirmedRegistrations, absentRegistrations, recentAuditLogs, announcements] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'actif' } }),
    prisma.planningSlot.count(),
    prisma.planningSlot.count({ where: { startAt: { gte: now } } }),
    prisma.planningRegistration.count(),
    prisma.planningRegistration.count({ where: { status: 'confirme' } }),
    prisma.planningRegistration.count({ where: { status: 'absent' } }),
    prisma.auditLog.findMany({
      take: 10,
      include: { actor: { select: { id: true, nom: true, prenom: true } }, target: { select: { id: true, nom: true, prenom: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.announcement.findMany({
      take: 5,
      include: { pole: true },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    }),
  ])

  return {
    totalUsers, activeUsers, totalSlots, upcomingSlots, totalRegistrations,
    confirmedRegistrations, absentRegistrations,
    recentAuditLogs: recentAuditLogs.map(l => ({ ...l, details: parseAuditDetails(l.details) })),
    announcements,
  }
})
