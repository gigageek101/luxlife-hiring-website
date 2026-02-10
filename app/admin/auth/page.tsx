'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Loader2 } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import { useRouter } from 'next/navigation'

export default function AdminAuth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token with expiry
      const expiryTime = rememberMe 
        ? Date.now() + (365 * 24 * 60 * 60 * 1000) // Forever (1 year)
        : Date.now() + (24 * 60 * 60 * 1000)  // 24 hours
      
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_expiry', expiryTime.toString())

      // Redirect to admin panel
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-md">
          <Reveal>
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h1 className="mb-4">
                Admin Login
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Secure access to admin panel
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Admin Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="rememberMe" className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Remember me forever
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary hover-lift text-lg px-8 py-4 w-full inline-flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
