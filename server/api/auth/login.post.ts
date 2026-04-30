import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken } from '../../utils/jwt'
import { checkRateLimit, clearRateLimit, logAudit } from '../../utils/auth'
import prisma from '../../db/client'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) ?? 'unknown'
  checkRateLimit(ip)

  const body = await readBody(event)
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0].message })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { pole: true },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError({ statusCode: 401, message: 'Email ou mot de passe incorrect' })
  }

  if (user.status === 'suspendu') {
    throw createError({ statusCode: 403, message: 'Compte suspendu. Contactez un administrateur.' })
  }

  clearRateLimit(ip)

  const tokenPayload = { sub: String(user.id), email: user.email, role: user.role }
  const accessToken = await signAccessToken(tokenPayload)
  const refreshToken = await signRefreshToken(tokenPayload)

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } })
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  await logAudit({ actorId: user.id, action: 'login', entity: 'User', entityId: user.id, ipAddress: ip })

  setCookie(event, 'access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })
  setCookie(event, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      status: user.status,
      poleId: user.poleId,
      pole: user.pole,
    },
    accessToken,
  }
})
