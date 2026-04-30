import { H3Event, getCookie, getHeader } from 'h3'
import { verifyAccessToken, type JwtPayload } from './jwt'
import prisma from '../db/client'

export async function requireAuth(event: H3Event): Promise<JwtPayload> {
  const authHeader = getHeader(event, 'authorization')
  let token: string | undefined

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  } else {
    token = getCookie(event, 'access_token') ?? undefined
  }

  if (!token) {
    throw createError({ statusCode: 401, message: 'Non authentifié' })
  }

  try {
    const payload = await verifyAccessToken(token)
    return payload
  } catch {
    throw createError({ statusCode: 401, message: 'Token invalide ou expiré' })
  }
}

export async function requireRole(event: H3Event, roles: string[]): Promise<JwtPayload> {
  const payload = await requireAuth(event)
  if (!roles.includes(payload.role)) {
    throw createError({ statusCode: 403, message: 'Accès refusé' })
  }
  return payload
}

export async function requireAdmin(event: H3Event): Promise<JwtPayload> {
  return requireRole(event, ['admin'])
}

export async function requireAdminOrResponsable(event: H3Event): Promise<JwtPayload> {
  return requireRole(event, ['admin', 'responsable'])
}

export async function logAudit(params: {
  actorId?: number
  targetId?: number
  action: string
  entity: string
  entityId?: number
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId ?? null,
        targetId: params.targetId ?? null,
        action: params.action as any,
        entity: params.entity,
        entityId: params.entityId ?? null,
        details: params.details != null ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress ?? null,
      },
    })
  } catch (e) {
    console.error('Audit log error:', e)
  }
}

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(ip: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): void {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)

  if (attempts) {
    if (now - attempts.lastAttempt > windowMs) {
      loginAttempts.set(ip, { count: 1, lastAttempt: now })
    } else {
      attempts.count++
      attempts.lastAttempt = now
      if (attempts.count > maxAttempts) {
        throw createError({
          statusCode: 429,
          message: 'Trop de tentatives. Réessayez dans 15 minutes.',
        })
      }
    }
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
  }
}

export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip)
}
