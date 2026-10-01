'use client'

import { useEffect, useState } from 'react'

// Role of the person logged into /admin. 'qa' sees Simulations + Accountability + user analytics only.
export type AdminRole = 'admin' | 'qa'

export const QA_TABS = ['simulations', 'accountability'] as const

export function getAdminRole(): AdminRole {
  try {
    return localStorage.getItem('admin_role') === 'qa' ? 'qa' : 'admin'
  } catch {
    return 'admin'
  }
}

/** null until read from localStorage (avoids flashing admin-only UI to a QA user). */
export function useAdminRole(): AdminRole | null {
  const [role, setRole] = useState<AdminRole | null>(null)
  useEffect(() => {
    setRole(getAdminRole())
  }, [])
  return role
}

export function clearAdminSession() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_expiry')
  localStorage.removeItem('admin_role')
}
