import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const query = getQuery(event)
  const status = query.status ? String(query.status) : undefined
  const priority = query.priority ? String(query.priority) : undefined
  const assignedToId = query.assignedToId ? Number(query.assignedToId) : undefined
  const poleId = query.poleId ? Number(query.poleId) : undefined
  const isCollective = query.isCollective !== undefined ? query.isCollective === 'true' : undefined

  const tasks = await prisma.task.findMany({
    where: {
      AND: [
        status ? { status } : {},
        priority ? { priority } : {},
        assignedToId ? { assignedToId } : {},
        poleId ? { poleId } : {},
        isCollective !== undefined ? { isCollective } : {},
      ],
    },
    include: {
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      assignedTo: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      pole: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  return tasks
})
