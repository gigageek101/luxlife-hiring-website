'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Home } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <CheckCircle className="w-24 h-24 mx-auto" style={{ color: 'var(--success)' }} />
          </motion.div>

          <motion.h1
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Thank You!
          </motion.h1>

          <motion.p
            className="text-xl mb-8"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Your message has been received successfully.
            <br />
            We'll get back to you within 24 hours.
          </motion.p>

          <motion.div
            className="card glass-card mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 className="mb-4">What happens next?</h3>
            <ul className="text-left space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
                <span>Our team will review your inquiry</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
                <span>We'll analyze your goals and requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
                <span>You'll receive a personalized strategy proposal</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/" className="btn-primary btn-shine hover-lift">
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <Link href="/services" className="btn-secondary hover-lift">
              Explore Services
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.p
            className="text-sm mt-8"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Redirecting to homepage in 10 seconds...
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
