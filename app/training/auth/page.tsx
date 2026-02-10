'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import { useRouter } from 'next/navigation'

export default function TrainingAuth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [email, setEmail] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramUsername,
          email,
          masterPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Store token in localStorage
      localStorage.setItem('training_token', data.token)
      localStorage.setItem('training_user', JSON.stringify(data.user))

      // Redirect to training dashboard
      router.push('/training')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
              <h1 className="mb-4">
                Training Portal
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                {isLogin ? 'Login to continue your training' : 'Create an account to start training'}
              </p>
            </div>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card glass-card"
          >
            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => {
                  setIsLogin(true)
                  setError('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-5 h-5 inline mr-2" />
                Login
              </button>
              <button
                onClick={() => {
                  setIsLogin(false)
                  setError('')
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="telegram" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Telegram Username *
                </label>
                <input
                  type="text"
                  id="telegram"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="@username"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Master Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter master password"
                  required
                />
                <p className="text-xs mt-1 text-gray-500">
                  {isLogin ? 'Use: MasterChatter123' : 'Master Password: MasterChatter123'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary hover-lift text-lg px-8 py-4 w-full inline-flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                    {isLogin ? 'Login' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {isLogin
                  ? "Don't have an account? Click Sign Up to create one."
                  : 'Already have an account? Click Login to sign in.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
