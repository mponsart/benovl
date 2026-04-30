import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireAdmin, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Minimum 8 caractères'),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  telephone: z.string().optional(),
  role: z.enum(['admin', 'responsable', 'benevole']).default('benevole'),
  status: z.enum(['actif', 'suspendu']).default('actif'),
  poleId: z.number().optional().nullable(),
  notesInternes: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const body = await readBody(event)
  const result = createUserSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0].message })
  }

  const { password, ...data } = result.data
  const hashedPassword = await bcrypt.hash(password, 12)

  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
  if (existing) throw createError({ statusCode: 409, message: 'Email déjà utilisé' })

  const user = await prisma.user.create({
    data: {
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
    },
    include: { pole: true },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
  })

  await logAudit({ actorId: Number(actor.sub), targetId: user.id, action: 'create', entity: 'User', entityId: user.id, details: { email: user.email, role: user.role } })
  return user
})
