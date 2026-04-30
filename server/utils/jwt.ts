import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtRefreshSecret)
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtSecret)
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JwtPayload
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.jwtRefreshSecret)
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as JwtPayload
}
