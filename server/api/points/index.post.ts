import { z } from 'zod'
import { requireAdmin, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const transactionSchema = z.object({
  userId: z.number().int(),
  amount: z.number().int().min(1),
  type: z.enum(['credit', 'debit']),
  reason: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format YYYY-MM requis'),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const body = await readBody(event)
  const result = transactionSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const transaction = await prisma.pointTransaction.create({ data: result.data })
  await logAudit({ actorId: Number(actor.sub), targetId: result.data.userId, action: 'create', entity: 'PointTransaction', entityId: transaction.id, details: { type: result.data.type, amount: result.data.amount } })
  return transaction
})
