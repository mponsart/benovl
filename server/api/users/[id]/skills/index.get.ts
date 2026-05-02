import { requireAuth } from '../../../../utils/auth'
import prisma from '../../../../db/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const userId = Number(getRouterParam(event, 'id'))

  const skills = await prisma.skill.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  })
  return skills
})
