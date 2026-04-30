import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../utils/jwt'
import prisma from '../../db/client'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token') ?? getHeader(event, 'x-refresh-token')
  if (!refreshToken) {
    throw createError({ statusCode: 401, message: 'Refresh token manquant' })
  }

  let payload: Awaited<ReturnType<typeof verifyRefreshToken>>
  try {
    payload = await verifyRefreshToken(refreshToken)
  } catch {
    throw createError({ statusCode: 401, message: 'Refresh token invalide ou expiré' })
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.expiresAt < new Date()) {
    throw createError({ statusCode: 401, message: 'Session expirée' })
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } })
  if (!user || user.status === 'suspendu') {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }

  const tokenPayload = { sub: String(user.id), email: user.email, role: user.role }
  const newAccessToken = await signAccessToken(tokenPayload)
  const newRefreshToken = await signRefreshToken(tokenPayload)

  await prisma.refreshToken.delete({ where: { id: stored.id } })
  await prisma.refreshToken.create({
    data: { token: newRefreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  })

  setCookie(event, 'access_token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60, path: '/' })
  setCookie(event, 'refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })

  return { accessToken: newAccessToken }
})
