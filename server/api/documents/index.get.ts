import { requireAuth } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  const isAdminOrResp = ['admin', 'responsable'].includes(payload.role)

  const docs = await prisma.document.findMany({
    where: isAdminOrResp ? {} : { userId: Number(payload.sub) },
    include: { user: { select: { id: true, nom: true, prenom: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return docs
})
