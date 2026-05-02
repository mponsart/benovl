import { requireAdminOrResponsable } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdminOrResponsable(event)
  const userId = Number(getRouterParam(event, 'id'))

  const events = await prisma.lifecycleEvent.findMany({
    where: { userId },
    include: {
      changedBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return events
})
