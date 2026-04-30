import { requireAdminOrResponsable } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdminOrResponsable(event)
  const users = await prisma.user.findMany({
    include: { pole: true },
    omit: { password: true, inviteToken: true, inviteExpiry: true, resetToken: true, resetExpiry: true },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  })

  const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Pôle', 'Créé le']
  const rows = users.map(u => [
    u.id,
    u.nom,
    u.prenom,
    u.email,
    u.telephone ?? '',
    u.role,
    u.status,
    u.pole?.name ?? '',
    new Date(u.createdAt).toLocaleDateString('fr-FR'),
  ])

  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')

  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="benevoles.csv"')
  return csv
})
