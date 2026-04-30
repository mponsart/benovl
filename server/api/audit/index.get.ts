import { requireAdmin } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page || 1))
  const perPage = Math.min(100, Number(query.perPage || 20))
  const skip = (page - 1) * perPage

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip,
      take: perPage,
      include: {
        actor: { select: { id: true, nom: true, prenom: true, email: true } },
        target: { select: { id: true, nom: true, prenom: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count(),
  ])

  return { logs, total, page, perPage, totalPages: Math.ceil(total / perPage) }
})
