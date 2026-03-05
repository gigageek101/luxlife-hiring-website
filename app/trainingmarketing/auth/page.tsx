'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Loader2 } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import { useRouter } from 'next/navigation'

export default function MarketingTrainingAuth() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [email, setEmail] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const endpoint = isLogin ? '/api/auth/marketing-login' : '/api/auth/marketing-signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUsername, email, masterPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      const expiryTime = rememberMe 
        ? Date.now() + (24 * 60 * 60 * 1000)
        : Date.now() + (2 * 60 * 60 * 1000)
      
      localStorage.setItem('marketing_training_token', data.token)
      localStorage.setItem('marketing_training_user', JSON.stringify(data.user))
      localStorage.setItem('marketing_training_token_expiry', expiryTime.toString())

      router.push('/trainingmarketing')
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
                Marketing Training Portal
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
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => { setIsLogin(true); setError('') }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <LogIn className="w-5 h-5 inline mr-2" />
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError('') }}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  !isLogin
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Sign Up
              </button>
            </div>

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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter master password"
                  required
                />
              </div>

              {isLogin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    Remember me for 24 hours
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded-lg font-semibold text-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all inline-flex items-center justify-center gap-3 disabled:opacity-50"
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
