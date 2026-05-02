import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const posting = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      pole: true,
      createdBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
      applications: {
        include: { assignedTo: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!posting) throw createError({ statusCode: 404, message: 'Offre introuvable' })
  return posting
})
