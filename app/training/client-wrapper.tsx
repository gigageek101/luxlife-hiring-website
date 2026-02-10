'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TrainingClientWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('training_token')
    const expiry = localStorage.getItem('training_token_expiry')
    
    if (!token || !expiry) {
      router.push('/training/auth')
      setIsChecking(false)
      return
    }

    // Check if token has expired
    const expiryTime = parseInt(expiry)
    if (Date.now() > expiryTime) {
      // Token expired, clear and redirect
      localStorage.removeItem('training_token')
      localStorage.removeItem('training_user')
      localStorage.removeItem('training_token_expiry')
      router.push('/training/auth')
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
          <p style={{ color: 'var(--text-secondary-on-white)' }}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
