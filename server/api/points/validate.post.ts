import { z } from 'zod'
import { requireAdmin, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const validateSchema = z.object({
  transactionId: z.number().int(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const body = await readBody(event)
  const result = validateSchema.safeParse(body)
  if (!result.success) throw createError({ statusCode: 400, message: result.error.errors[0].message })

  const transaction = await prisma.pointTransaction.update({
    where: { id: result.data.transactionId },
    data: { validatedById: Number(actor.sub), validatedAt: new Date() },
  })
  await logAudit({ actorId: Number(actor.sub), action: 'update', entity: 'PointTransaction', entityId: transaction.id, details: { validated: true } })
  return transaction
})
