import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

// Server-side admin tokens: base64url(JSON payload) + "." + HMAC-SHA256 signature.
// A QA account cannot forge a super-admin token because it does not know the secret.

export const ADMIN_EMAIL = 'luxlife.agentur@gmail.com'
export type AdminRole = 'admin' | 'qa'
export type AdminPlatform = 'admin' | 'marketing'

export interface AdminTokenPayload {
  email: string
  role: AdminRole
  platform: AdminPlatform
  ts: number
}

const SECRET = process.env.JWT_SECRET || process.env.ADMIN_TOKEN_SECRET || 'luxlife-admin-token-fallback-2026'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

const sign = (body: string) => createHmac('sha256', SECRET).update(body).digest('base64url')

export function signAdminToken(payload: Omit<AdminTokenPayload, 'ts'>): string {
  const body = Buffer.from(JSON.stringify({ ...payload, ts: Date.now() })).toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifyAdminToken(token: string | null | undefined, maxAgeMs = THIRTY_DAYS): AdminTokenPayload | null {
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = sign(body)
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AdminTokenPayload
    if (!payload.email || (payload.role !== 'admin' && payload.role !== 'qa') || !payload.platform) return null
    if (!Number.isFinite(payload.ts) || Date.now() - payload.ts > maxAgeMs) return null
    return payload
  } catch {
    return null
  }
}

export function bearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') || ''
  const match = auth.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

export function adminFromRequest(request: NextRequest): AdminTokenPayload | null {
  return verifyAdminToken(bearerToken(request))
}

export function isSuperAdmin(payload: AdminTokenPayload | null): payload is AdminTokenPayload {
  return !!payload && payload.role === 'admin' && payload.email === ADMIN_EMAIL
}
