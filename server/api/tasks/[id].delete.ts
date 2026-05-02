import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const actor = await requireAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) throw createError({ statusCode: 404, message: 'Tâche introuvable' })

  const isAdminOrResponsable = ['admin', 'responsable'].includes(actor.role)
  if (!isAdminOrResponsable && task.createdById !== Number(actor.sub)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  await prisma.task.delete({ where: { id } })
  await logAudit({ actorId: Number(actor.sub), action: 'delete', entity: 'Task', entityId: id, details: { title: task.title } })
  return { success: true }
})
