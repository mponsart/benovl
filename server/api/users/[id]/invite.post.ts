import crypto from 'node:crypto'
import { requireAdmin, logAudit } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h

  const user = await prisma.user.update({
    where: { id },
    data: { inviteToken: token, inviteExpiry: expiry },
    select: { id: true, email: true, nom: true, prenom: true },
  })

  await logAudit({ actorId: Number(actor.sub), targetId: id, action: 'invite', entity: 'User', entityId: id })

  const inviteUrl = `${getHeader(event, 'origin') || 'http://localhost:3000'}/invite?token=${token}`
  return { inviteUrl, token, expiresAt: expiry, user }
})
