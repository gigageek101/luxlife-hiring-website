'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const expiry = localStorage.getItem('admin_expiry')
    
    if (!token || !expiry) {
      router.push('/admin/auth')
      setIsChecking(false)
      return
    }

    // Check if token has expired
    const expiryTime = parseInt(expiry)
    if (Date.now() > expiryTime) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_expiry')
      router.push('/admin/auth')
      setIsChecking(false)
      return
    }

    setIsAuthenticated(true)
    setIsChecking(false)
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
