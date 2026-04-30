import { verifyAccessToken } from '../utils/jwt'

export default defineEventHandler(async (event) => {
  // Only protect /api routes except auth
  const path = event.path
  if (!path.startsWith('/api/') || path.startsWith('/api/auth/')) return

  const authHeader = getHeader(event, 'authorization')
  const tokenFromCookie = getCookie(event, 'access_token')
  let token = tokenFromCookie

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  if (!token) {
    // Let individual routes handle auth errors
    return
  }

  try {
    const payload = await verifyAccessToken(token)
    event.context.auth = payload
  } catch {
    // Token invalid - let individual routes decide
  }
})
