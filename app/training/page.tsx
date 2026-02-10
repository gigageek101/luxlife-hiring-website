'use client'

import { motion } from 'framer-motion'
import { ArrowRight, LogOut } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import TrainingClientWrapper from './client-wrapper'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const trainingDays = [
  {
    day: 1,
    emoji: '📚',
    title: 'Day 1',
    description: 'Introduction to subscriber relationships and chatting fundamentals',
    path: '/training/day1',
    hasAssessment: false
  },
  {
    day: 2,
    emoji: '💬',
    title: 'Day 2',
    description: 'Building relationships, LTV, and the mirror effect',
    path: '/training/day2',
    hasAssessment: true
  },
  {
    day: 3,
    emoji: '🎯',
    title: 'Day 3',
    description: 'Personalization, teasing content, and scripting',
    path: '/training/day3',
    hasAssessment: true
  },
  {
    day: 4,
    emoji: '💰',
    title: 'Day 4',
    description: 'Upselling, escalation, and aftercare',
    path: '/training/day4',
    hasAssessment: true
  },
  {
    day: 5,
    emoji: '🎓',
    title: 'Day 5',
    description: 'Conversation handling and emotional connection mastery',
    path: '/training/day5',
    hasAssessment: true
  }
]

function TrainingDashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('training_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('training_token')
    localStorage.removeItem('training_user')
    router.push('/training/auth')
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      {/* User info and logout */}
      {user && (
        <div className="fixed top-20 right-4 z-50">
          <div className="card bg-white shadow-lg p-3 flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.telegramUsername}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary-on-white)' }}>{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-6xl">
          <Reveal>
            <div className="text-center mb-16">
              <h1 className="mb-4">
                Training Dashboard
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                Complete all training days to become a certified chatter
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingDays.map((training, index) => (
              <motion.div
                key={training.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={training.path}
                  className="card hover-lift hover-glow block h-full group"
                >
                  <div className="flex flex-col h-full">
                    {/* Emoji Icon */}
                    <div 
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
                    >
                      {training.emoji}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-center group-hover:text-[var(--accent)] transition-colors">
                      {training.title}
                    </h3>

                    {/* Description */}
                    <p className="text-center mb-4 flex-grow" style={{ color: 'var(--text-secondary-on-white)' }}>
                      {training.description}
                    </p>

                    {/* Assessment Badge */}
                    {training.hasAssessment && (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--accent)' }}>
                          ✓ Includes Assessment
                        </span>
                      </div>
                    )}
                    {!training.hasAssessment && (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          ℹ No Assessment
                        </span>
                      </div>
                    )}

                    {/* Arrow */}
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent)' }}>
                        Start Training
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Progress Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 card glass-card text-center"
          >
            <h3 className="text-xl font-semibold mb-3">📋 Training Requirements</h3>
            <div className="space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
              <p>• Complete each day in order</p>
              <p>• Watch all videos and take detailed notes</p>
              <p>• Pass all assessments (Day 2-5) to continue</p>
              <p>• Check Telegram for updates between days</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default function TrainingDashboard() {
  return (
    <TrainingClientWrapper>
      <TrainingDashboardContent />
    </TrainingClientWrapper>
  )
}
