import { requireAdminOrResponsable } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdminOrResponsable(event)
  const query = getQuery(event)
  const search = String(query.search || '')
  const role = query.role ? String(query.role) : undefined
  const status = query.status ? String(query.status) : undefined
  const poleId = query.poleId ? Number(query.poleId) : undefined

  const users = await prisma.user.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { nom: { contains: search } },
            { prenom: { contains: search } },
            { email: { contains: search } },
          ],
        } : {},
        role ? { role: role as any } : {},
        status ? { status: status as any } : {},
        poleId ? { poleId } : {},
      ],
    },
    include: { pole: true },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  })
  return users
})
