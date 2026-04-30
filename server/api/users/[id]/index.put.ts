import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  telephone: z.string().optional().nullable(),
  role: z.enum(['admin', 'responsable', 'benevole']).optional(),
  status: z.enum(['actif', 'suspendu']).optional(),
  poleId: z.number().optional().nullable(),
  notesInternes: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const result = updateUserSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0].message })
  }

  const { password, ...data } = result.data
  const updateData: Record<string, unknown> = { ...data }
  if (password) updateData.password = await bcrypt.hash(password, 12)
  if (data.email) updateData.email = data.email.toLowerCase()

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: { pole: true },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
  })

  await logAudit({ actorId: Number(actor.sub), targetId: id, action: 'update', entity: 'User', entityId: id, details: data as Record<string, unknown> })
  return user
})
