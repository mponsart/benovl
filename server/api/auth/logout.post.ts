import { requireAuth, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  try {
    const payload = await requireAuth(event)
    const refreshToken = getCookie(event, 'refresh_token')
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    await logAudit({ actorId: Number(payload.sub), action: 'logout', entity: 'User', entityId: Number(payload.sub) })
  } catch {
    // ignore auth errors on logout
  }

  deleteCookie(event, 'access_token', { path: '/' })
  deleteCookie(event, 'refresh_token', { path: '/' })
  return { message: 'Déconnecté avec succès' }
})
