import { requireAdmin } from '../../../utils/auth'
import prisma from '../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  await prisma.pole.delete({ where: { id } })
  return { message: 'Pôle supprimé' }
})
