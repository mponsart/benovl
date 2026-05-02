import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const userId = Number(actor.sub)

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId },
    include: {
      validatedBy: { omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const balance = transactions.reduce((sum, t) => t.type === 'credit' ? sum + t.amount : sum - t.amount, 0)

  return { balance, transactions }
})
