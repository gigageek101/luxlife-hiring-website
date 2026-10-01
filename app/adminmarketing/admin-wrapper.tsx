'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearAdminSession } from '@/lib/admin-role'

export default function MarketingAdminWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_marketing_token')
    const expiry = localStorage.getItem('admin_marketing_expiry')
    
    if (!token || !expiry) {
      router.push('/adminmarketing/auth')
      setIsChecking(false)
      return
    }

    const expiryTime = parseInt(expiry)
    if (Date.now() > expiryTime) {
      localStorage.removeItem('admin_marketing_token')
      localStorage.removeItem('admin_marketing_expiry')
      router.push('/adminmarketing/auth')
      setIsChecking(false)
      return
    }

    fetch('/api/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      .then(async (res) => {
        const data = await res.json().catch(() => ({ ok: false }))
        if (!res.ok || !data.ok || data.platform !== 'marketing') {
          clearAdminSession('marketing')
          router.push('/adminmarketing/auth')
          return
        }
        localStorage.setItem('admin_marketing_role', data.role === 'qa' ? 'qa' : 'admin')
        setIsAuthenticated(true)
      })
      .catch(() => setIsAuthenticated(true))
      .finally(() => setIsChecking(false))
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary-on-white)' }}>Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
