'use client'

import { motion } from 'framer-motion'
import { LogOut, BookOpen, ClipboardCheck, CheckCircle, Lock, Megaphone } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import MarketingClientWrapper from './client-wrapper'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface UserData {
  telegramUsername: string
  email: string
}

function MarketingTrainingDashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('marketing_training_user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch { /* ignore */ }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('marketing_training_token')
    localStorage.removeItem('marketing_training_user')
    localStorage.removeItem('marketing_training_token_expiry')
    router.push('/trainingmarketing/auth')
  }

  const trainingDays = [
    {
      day: 1,
      title: 'Day 1 — Mindset & A-Player Blueprint',
      description: 'Growth mindset, A-player traits, feedback handling, and learning strategies',
      hasAssessment: true,
      link: '/trainingmarketing/day1',
      unlocked: true,
    },
    {
      day: 2,
      title: 'Day 2 — Advanced Marketing',
      description: 'Advanced marketing strategies and techniques',
      hasAssessment: false,
      link: '/trainingmarketing/day2',
      unlocked: true,
    },
  ]

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-4xl">
          <Reveal>
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600">
                <Megaphone className="w-10 h-10 text-white" />
              </div>
              <h1 className="mb-4">Marketing Training</h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Welcome back{user ? `, ${user.telegramUsername}` : ''}! Continue your marketing training journey.
              </p>
            </div>
          </Reveal>

          <div className="flex justify-end mb-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="space-y-4">
            {trainingDays.map((td, index) => (
              <motion.div
                key={td.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {td.unlocked ? (
                  <Link href={td.link}>
                    <div className="card glass-card p-6 hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl flex-shrink-0">
                          {td.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                            {td.title}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary-on-white)' }}>
                            {td.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {td.hasAssessment && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                              Assessment
                            </span>
                          )}
                          <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="card glass-card p-6 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-300 text-gray-500 font-bold text-xl flex-shrink-0">
                        {td.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-400">{td.title}</h3>
                        <p className="text-sm mt-1 text-gray-400">{td.description}</p>
                      </div>
                      <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function MarketingTrainingDashboard() {
  return (
    <MarketingClientWrapper>
      <MarketingTrainingDashboardContent />
    </MarketingClientWrapper>
  )
}
