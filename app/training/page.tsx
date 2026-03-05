'use client'

import { motion } from 'framer-motion'
import { ArrowRight, LogOut, BarChart3, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'
import TrainingClientWrapper from './client-wrapper'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SimCategory {
  name: string
  score: number
  feedback: string
  examples: { good: string[]; needsWork: string[] }
  advice: string
}

interface OverallFeedback {
  strengths: string[]
  weaknesses: string[]
  missedOpportunities: string[]
  practiceScenarios: string[]
  summary: string
}

interface SimReport {
  id: number
  overallScore: number
  categories: SimCategory[]
  overallFeedback: OverallFeedback | string
  simulationType: string
  completedAt: string
}

const CHATTING_WEIGHTS: Record<string, number> = {
  'Giving Him What He Wants to Hear': 25,
  'Making the Subscriber Feel Special': 20,
  'Caring About the Subscriber': 15,
  'Asking the Right Questions': 15,
  'American Accent & Texting Style': 10,
  'Grammar & Natural Flow': 10,
  'Note-Taking & Information Tracking': 5,
}
const SEXTING_WEIGHTS: Record<string, number> = {
  'Correct Framework Order': 30,
  'Language Mirroring': 25,
  'Tension Building Between PPVs': 20,
  'Follow-up on Non-Purchased Content': 15,
  'Response Speed & Engagement': 10,
}
const AFTERCARE_WEIGHTS: Record<string, number> = {
  'Emotional Authenticity & Vulnerability': 25,
  'Personalization Using His Notes': 22,
  'Name Usage & Intimacy Anchoring': 18,
  'Re-engagement Seed Planting': 15,
  'Texting Style & Casual American Flow': 10,
  'Pacing & Message Timing': 7,
  'No Hard-Sell / No Desperation': 3,
}

function calcWeightedScore(cats: SimCategory[], simType?: string): number {
  const w = (simType === 'sexting' || simType === 'sexting-teacher') ? SEXTING_WEIGHTS : simType === 'aftercare' ? AFTERCARE_WEIGHTS : CHATTING_WEIGHTS
  let t = 0
  for (const c of cats) { t += (c.score / 10) * (w[c.name] || 0) }
  return Math.round(t * 10) / 10
}

function getScoreColor(s: number) {
  if (s >= 85) return '#10b981'
  if (s >= 70) return '#f59e0b'
  if (s >= 55) return '#f97316'
  if (s >= 40) return '#ef4444'
  return '#dc2626'
}

function getCatScoreColor(s: number) {
  if (s >= 8) return '#10b981'
  if (s >= 6) return '#f59e0b'
  if (s >= 4) return '#f97316'
  return '#ef4444'
}

function getScoreLabel(s: number) {
  if (s >= 85) return 'Elite'
  if (s >= 70) return 'Strong'
  if (s >= 55) return 'Developing'
  if (s >= 40) return 'Below Average'
  return 'Needs Coaching'
}

function getSimTypeLabel(type: string) {
  if (type === 'chatting') return 'Relationship Building'
  if (type === 'sexting') return 'Sexting'
  if (type === 'aftercare') return 'Aftercare'
  return type
}

interface UserAnalysis {
  topStrengths: { category: string; avgScore: number; simType: string }[]
  weaknesses: { category: string; avgScore: number; simType: string }[]
  overallAvg: number
  totalSims: number
  improvementAreas: string[]
}

function computeUserAnalysis(simulations: SimReport[]): UserAnalysis | null {
  if (simulations.length === 0) return null

  const byType: Record<string, SimReport[]> = {
    chatting: simulations.filter(s => s.simulationType === 'chatting' || s.simulationType === 'chat-teacher'),
    sexting: simulations.filter(s => s.simulationType === 'sexting' || s.simulationType === 'sexting-teacher'),
    aftercare: simulations.filter(s => s.simulationType === 'aftercare' || s.simulationType === 'aftercare-teacher'),
  }

  const categoryAvgs: { category: string; avgScore: number; simType: string }[] = []
  for (const [type, sims] of Object.entries(byType)) {
    if (sims.length === 0) continue
    const catScores: Record<string, number[]> = {}
    for (const sim of sims) {
      for (const cat of sim.categories) {
        if (!catScores[cat.name]) catScores[cat.name] = []
        catScores[cat.name].push(cat.score)
      }
    }
    for (const [name, scores] of Object.entries(catScores)) {
      categoryAvgs.push({ category: name, avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10, simType: type })
    }
  }

  const sorted = [...categoryAvgs].sort((a, b) => b.avgScore - a.avgScore)
  const improvementAreas: string[] = []
  for (const sim of simulations) {
    if (typeof sim.overallFeedback === 'object' && sim.overallFeedback !== null) {
      const fb = sim.overallFeedback as OverallFeedback
      if (fb.weaknesses) improvementAreas.push(...fb.weaknesses)
    }
  }

  return {
    topStrengths: sorted.slice(0, 3),
    weaknesses: sorted.filter(c => c.avgScore < 6),
    overallAvg: Math.round(simulations.reduce((s, r) => s + calcWeightedScore(r.categories, r.simulationType), 0) / simulations.length * 10) / 10,
    totalSims: simulations.length,
    improvementAreas: Array.from(new Set(improvementAreas)).slice(0, 8),
  }
}

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
  },
  {
    day: 6,
    emoji: '🎮',
    title: 'Simulation Portal',
    description: 'Practice your skills with AI-powered chatting simulations',
    path: '/simulations',
    hasAssessment: false,
    isSimulation: true
  }
]

function TrainingDashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('training_user')
    if (userData) {
      const u = JSON.parse(userData)
      setUser(u)
      fetchAnalysis(u.telegramUsername, u.email)
    } else {
      setAnalysisLoading(false)
    }
  }, [])

  const fetchAnalysis = async (username: string, email: string) => {
    try {
      const res = await fetch(`/api/my-results?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await res.json()
      if (data.success && data.reports) {
        setAnalysis(computeUserAnalysis(data.reports))
      }
    } catch (err) {
      console.error('Error fetching analysis:', err)
    } finally {
      setAnalysisLoading(false)
    }
  }

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
          <div className="card bg-white shadow-lg p-2 md:p-3 flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{user.telegramUsername}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary-on-white)' }}>{user.email}</p>
            </div>
            <Link
              href="/my-results"
              className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
              title="My Results"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
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

                    {/* Badge */}
                    {'isSimulation' in training && training.isSimulation ? (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                          🎯 Practice Simulations
                        </span>
                      </div>
                    ) : training.hasAssessment ? (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(255, 107, 53, 0.1)', color: 'var(--accent)' }}>
                          ✓ Includes Assessment
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          ℹ No Assessment
                        </span>
                      </div>
                    )}

                    {/* Arrow */}
                    <div className="flex justify-center mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all duration-300" style={{ color: 'var(--accent)' }}>
                        {'isSimulation' in training && training.isSimulation ? 'Enter Portal' : 'Start Training'}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Performance Analysis */}
          {!analysisLoading && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '2px solid #e2e8f0' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Your Performance Analysis</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      Based on {analysis.totalSims} simulation{analysis.totalSims !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-xl md:text-2xl font-black" style={{ color: getScoreColor(analysis.overallAvg) }}>{analysis.overallAvg}</div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-xl md:text-2xl font-black text-blue-700">{analysis.totalSims}</div>
                    <div className="text-xs text-gray-500">Total Sims</div>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-lg md:text-xl font-black" style={{ color: getScoreColor(analysis.overallAvg) }}>{getScoreLabel(analysis.overallAvg)}</div>
                    <div className="text-xs text-gray-500">Level</div>
                  </div>
                </div>

                {analysis.topStrengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>
                      <TrendingUp className="w-4 h-4" /> Your Top 3 Strengths
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.topStrengths.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <span className="text-base font-black" style={{ color: getCatScoreColor(s.avgScore) }}>{s.avgScore}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{s.category}</p>
                            <p className="text-xs text-gray-500">{getSimTypeLabel(s.simType)}</p>
                          </div>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">#{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.weaknesses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#ef4444' }}>
                      <AlertTriangle className="w-4 h-4" /> Areas to Improve
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <span className="text-base font-black" style={{ color: getCatScoreColor(w.avgScore) }}>{w.avgScore}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{w.category}</p>
                            <p className="text-xs text-gray-500">{getSimTypeLabel(w.simType)}</p>
                          </div>
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{w.avgScore}/10</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.improvementAreas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                      Key Feedback
                    </h4>
                    <div className="space-y-1">
                      {analysis.improvementAreas.slice(0, 5).map((area, i) => (
                        <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', color: '#92400e' }}>
                          <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* My Results Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="mt-8"
          >
            <Link href="/my-results" className="block card hover-lift group" style={{ background: 'linear-gradient(135deg, #7c3aed08, #6d28d908)', border: '2px solid #7c3aed20' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    📊
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold group-hover:text-purple-600 transition-colors">My Simulation Results</h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      View all your simulation scores, reports, and session recordings
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
          </motion.div>

          {/* Progress Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 card glass-card text-center"
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
