import { requireAuth } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))
  const doc = await prisma.document.findUnique({ where: { id }, include: { user: { select: { id: true, nom: true, prenom: true } } } })
  if (!doc) throw createError({ statusCode: 404, message: 'Document introuvable' })

  const isAdminOrResp = ['admin', 'responsable'].includes(payload.role)
  if (!isAdminOrResp && doc.userId !== Number(payload.sub)) throw createError({ statusCode: 403, message: 'Accès refusé' })
  return doc
})
