'use client'

import { useEffect, useState } from 'react'

// Client-side view of the admin session (role + token live in localStorage).
// 'qa' sees Simulations + Accountability + Analytics only. The server re-verifies the token on every admin page load.
export type AdminRole = 'admin' | 'qa'
export type AdminPlatform = 'admin' | 'marketing'

export const QA_TABS = ['simulations', 'accountability', 'analytics'] as const

const KEYS: Record<AdminPlatform, { token: string; expiry: string; role: string }> = {
  admin: { token: 'admin_token', expiry: 'admin_expiry', role: 'admin_role' },
  marketing: { token: 'admin_marketing_token', expiry: 'admin_marketing_expiry', role: 'admin_marketing_role' },
}

export function sessionKeys(platform: AdminPlatform = 'admin') {
  return KEYS[platform]
}

export function getAdminRole(platform: AdminPlatform = 'admin'): AdminRole {
  try {
    return localStorage.getItem(KEYS[platform].role) === 'qa' ? 'qa' : 'admin'
  } catch {
    return 'admin'
  }
}

export function getAdminToken(platform: AdminPlatform = 'admin'): string | null {
  try {
    return localStorage.getItem(KEYS[platform].token)
  } catch {
    return null
  }
}

/** null until read from localStorage (avoids flashing admin-only UI to a QA user). */
export function useAdminRole(platform: AdminPlatform = 'admin'): AdminRole | null {
  const [role, setRole] = useState<AdminRole | null>(null)
  useEffect(() => {
    setRole(getAdminRole(platform))
  }, [platform])
  return role
}

export function clearAdminSession(platform: AdminPlatform = 'admin') {
  const k = KEYS[platform]
  localStorage.removeItem(k.token)
  localStorage.removeItem(k.expiry)
  localStorage.removeItem(k.role)
}

export interface DecodedToken { email: string; role: AdminRole; platform: AdminPlatform; ts: number }

/** Reads the token payload without verifying it (verification happens on the server). */
export function decodeAdminToken(token: string | null): DecodedToken | null {
  if (!token) return null
  try {
    const body = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')
    const parsed = JSON.parse(atob(body)) as DecodedToken
    return parsed && parsed.email && parsed.role ? parsed : null
  } catch {
    return null
  }
}

/** The active QA session on either platform, if any. Used by the activity tracker. */
export function qaSession(): { token: string; platform: AdminPlatform; email: string } | null {
  for (const platform of ['admin', 'marketing'] as AdminPlatform[]) {
    if (getAdminRole(platform) !== 'qa') continue
    const token = getAdminToken(platform)
    const decoded = decodeAdminToken(token)
    if (token && decoded && decoded.role === 'qa') return { token, platform, email: decoded.email }
  }
  return null
}
