'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketingClientWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('marketing_training_token')
    const expiry = localStorage.getItem('marketing_training_token_expiry')
    
    if (!token || !expiry) {
      router.push('/trainingmarketing/auth')
      setIsChecking(false)
      return
    }

    const expiryTime = parseInt(expiry)
    if (Date.now() > expiryTime) {
      localStorage.removeItem('marketing_training_token')
      localStorage.removeItem('marketing_training_user')
      localStorage.removeItem('marketing_training_token_expiry')
      router.push('/trainingmarketing/auth')
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
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
