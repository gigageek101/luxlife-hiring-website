'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp, Sparkles, Keyboard, ClipboardPaste, AlertTriangle, Flame, Zap, Play, Pause, X, Video, RefreshCw, Loader2, CheckCircle, GraduationCap, TrendingUp } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import TrainingClientWrapper from '../training/client-wrapper'
import Link from 'next/link'

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
  telegramUsername: string
  email: string
  overallScore: number
  categories: SimCategory[]
  overallFeedback: OverallFeedback | string
  notes: string
  conversation: { role: string; content: string; contentType?: string; price?: number; unlocked?: boolean }[]
  durationMode: string
  messageCount: number
  typedCount: number
  pasteCount: number
  simulationType: 'chatting' | 'sexting' | 'aftercare' | 'sexting-teacher' | 'chat-teacher' | 'aftercare-teacher' | 'combined'
  hasRecording?: boolean
  wpm: number
  completedAt: string
}

const CHATTING_CATEGORY_WEIGHTS: Record<string, number> = {
  'Giving Him What He Wants to Hear': 25,
  'Making the Subscriber Feel Special': 20,
  'Caring About the Subscriber': 15,
  'Asking the Right Questions': 15,
  'American Accent & Texting Style': 10,
  'Grammar & Natural Flow': 10,
  'Note-Taking & Information Tracking': 5,
}

const SEXTING_CATEGORY_WEIGHTS: Record<string, number> = {
  'Correct Framework Order': 35,
  'Language Mirroring': 30,
  'Tension Building Between PPVs': 25,
  'Response Speed & Engagement': 10,
}

const AFTERCARE_CATEGORY_WEIGHTS: Record<string, number> = {
  'Emotional Authenticity & Vulnerability': 25,
  'Personalization Using His Notes': 22,
  'Name Usage & Intimacy Anchoring': 18,
  'Re-engagement Seed Planting': 15,
  'Texting Style & Casual American Flow': 10,
  'Pacing & Message Timing': 7,
  'No Hard-Sell / No Desperation': 3,
}

const COMBINED_CATEGORY_WEIGHTS: Record<string, number> = {
  'Giving Him What He Wants to Hear': 7,
  'Making the Subscriber Feel Special': 6,
  'Caring About the Subscriber': 5,
  'Asking the Right Questions': 4,
  'American Texting Style': 4,
  'Grammar & Natural Flow': 2,
  'Note-Taking & Information Tracking': 2,
  'Correct Framework Order': 10,
  'Language Mirroring': 8,
  'Tension Building Between PPVs': 7,
  'Response Speed & Engagement': 3,
  'Emotional Authenticity & Vulnerability': 7,
  'Personalization Using His Notes': 5,
  'Name Usage & Intimacy Anchoring': 4,
  'Re-engagement Seed Planting': 4,
  'Pacing & Message Timing': 2,
  'No Hard-Sell / No Desperation': 2,
  'Objection Handling': 10,
  'Stage Transitions': 5,
  'Cross-Stage Consistency': 3,
}

function getWeightsForReport(report: SimReport): Record<string, number> {
  if (report.simulationType === 'sexting' || report.simulationType === 'sexting-teacher') return SEXTING_CATEGORY_WEIGHTS
  if (report.simulationType === 'aftercare') return AFTERCARE_CATEGORY_WEIGHTS
  if (report.simulationType === 'combined') return COMBINED_CATEGORY_WEIGHTS
  return CHATTING_CATEGORY_WEIGHTS
}

function calculateWeightedScore(categories: SimCategory[], simType?: string): number {
  const weights = (simType === 'sexting' || simType === 'sexting-teacher') ? SEXTING_CATEGORY_WEIGHTS : simType === 'aftercare' ? AFTERCARE_CATEGORY_WEIGHTS : simType === 'combined' ? COMBINED_CATEGORY_WEIGHTS : CHATTING_CATEGORY_WEIGHTS
  let total = 0
  for (const cat of categories) {
    const weight = weights[cat.name] || 0
    total += (cat.score / 10) * weight
  }
  return Math.round(total * 10) / 10
}

function getCategoryScoreColor(score: number): string {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#f97316'
  return '#ef4444'
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#f59e0b'
  if (score >= 55) return '#f97316'
  if (score >= 40) return '#ef4444'
  return '#dc2626'
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Elite'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Developing'
  if (score >= 40) return 'Below Average'
  return 'Needs Immediate Coaching'
}

interface CategoryDetail {
  category: string
  simType: string
  simTypeLabel: string
  avgScore: number
  bestScore: number
  count: number
  trend: 'improving' | 'declining' | 'stable' | 'new'
  goodExamples: string[]
  badExamples: string[]
  topAdvice: string
}

interface SimTypeBreakdown {
  type: string
  label: string
  avgScore: number
  simCount: number
}

interface UserAnalysis {
  overallAvg: number
  totalSims: number
  simTypeBreakdowns: SimTypeBreakdown[]
  topStrengths: CategoryDetail[]
  weaknesses: CategoryDetail[]
  topOverallStrengths: string[]
  topOverallWeaknesses: string[]
  topPracticeScenarios: string[]
}

function computeAnalysis(simulations: SimReport[]): UserAnalysis | null {
  if (simulations.length === 0) return null

  const byType: Record<string, SimReport[]> = {
    chatting: simulations.filter(s => s.simulationType === 'chatting' || s.simulationType === 'chat-teacher'),
    sexting: simulations.filter(s => s.simulationType === 'sexting' || s.simulationType === 'sexting-teacher'),
    aftercare: simulations.filter(s => s.simulationType === 'aftercare' || s.simulationType === 'aftercare-teacher'),
  }

  const simTypeBreakdowns: SimTypeBreakdown[] = []
  for (const [type, sims] of Object.entries(byType)) {
    if (sims.length === 0) continue
    const scores = sims.map(s => calculateWeightedScore(s.categories, s.simulationType))
    simTypeBreakdowns.push({
      type, label: getSimTypeLabel(type),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
      simCount: sims.length,
    })
  }

  const allCategories: CategoryDetail[] = []
  for (const [type, sims] of Object.entries(byType)) {
    if (sims.length === 0) continue
    const catData: Record<string, { scores: number[]; goods: string[]; bads: string[]; advices: string[] }> = {}
    const sortedSims = [...sims].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    for (const sim of sortedSims) {
      for (const cat of sim.categories) {
        if (!catData[cat.name]) catData[cat.name] = { scores: [], goods: [], bads: [], advices: [] }
        catData[cat.name].scores.push(cat.score)
        if (cat.examples?.good) catData[cat.name].goods.push(...cat.examples.good.filter((e: string) => e.trim()))
        if (cat.examples?.needsWork) catData[cat.name].bads.push(...cat.examples.needsWork.filter((e: string) => e.trim()))
        if (cat.advice?.trim()) catData[cat.name].advices.push(cat.advice.trim())
      }
    }
    for (const [name, data] of Object.entries(catData)) {
      const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 10) / 10
      let trend: 'improving' | 'declining' | 'stable' | 'new' = 'new'
      if (data.scores.length >= 3) {
        const half = Math.floor(data.scores.length / 2)
        const firstHalf = data.scores.slice(0, half).reduce((a, b) => a + b, 0) / half
        const secondHalf = data.scores.slice(half).reduce((a, b) => a + b, 0) / (data.scores.length - half)
        if (secondHalf - firstHalf >= 1) trend = 'improving'
        else if (firstHalf - secondHalf >= 1) trend = 'declining'
        else trend = 'stable'
      }
      allCategories.push({
        category: name, simType: type, simTypeLabel: getSimTypeLabel(type),
        avgScore: avg, bestScore: Math.max(...data.scores), count: data.scores.length, trend,
        goodExamples: Array.from(new Set(data.goods)).slice(0, 2),
        badExamples: Array.from(new Set(data.bads)).slice(0, 2),
        topAdvice: data.advices[data.advices.length - 1] || '',
      })
    }
  }

  const sorted = [...allCategories].sort((a, b) => b.avgScore - a.avgScore)
  const overallStrengths: string[] = []
  const overallWeaknesses: string[] = []
  const practiceScens: string[] = []
  for (const sim of simulations) {
    if (typeof sim.overallFeedback === 'object' && sim.overallFeedback !== null) {
      const fb = sim.overallFeedback as OverallFeedback
      if (fb.strengths) overallStrengths.push(...fb.strengths)
      if (fb.weaknesses) overallWeaknesses.push(...fb.weaknesses)
      if (fb.practiceScenarios) practiceScens.push(...fb.practiceScenarios)
    }
  }

  return {
    overallAvg: Math.round(simulations.reduce((s, r) => s + calculateWeightedScore(r.categories, r.simulationType), 0) / simulations.length * 10) / 10,
    totalSims: simulations.length, simTypeBreakdowns,
    topStrengths: sorted.filter(c => c.avgScore >= 7).slice(0, 4),
    weaknesses: sorted.filter(c => c.avgScore < 6).sort((a, b) => a.avgScore - b.avgScore).slice(0, 5),
    topOverallStrengths: Array.from(new Set(overallStrengths)).slice(0, 4),
    topOverallWeaknesses: Array.from(new Set(overallWeaknesses)).slice(0, 4),
    topPracticeScenarios: Array.from(new Set(practiceScens)).slice(0, 3),
  }
}

function getSimTypeLabel(type: string) {
  if (type === 'chatting') return 'Relationship Building'
  if (type === 'sexting') return 'Sexting'
  if (type === 'aftercare') return 'Aftercare'
  return type
}

function MyResultsContent() {
  const [reports, setReports] = useState<SimReport[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedReport, setExpandedReport] = useState<number | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'chatting' | 'sexting' | 'aftercare' | 'sexting-teacher' | 'chat-teacher' | 'aftercare-teacher'>('all')
  const [replayReport, setReplayReport] = useState<SimReport | null>(null)
  const [replayRecording, setReplayRecording] = useState<{t:number;e:string;d:string}[] | null>(null)
  const [replayLoading, setReplayLoading] = useState(false)
  const [user, setUser] = useState<{ telegramUsername: string; email: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('training_user')
    if (userData) {
      const u = JSON.parse(userData)
      setUser(u)
      fetchReports(u.telegramUsername, u.email)
    }
  }, [])

  const fetchReports = async (username: string, email: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/my-results?username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await res.json()
      if (data.success) setReports(data.reports)
    } catch (err) {
      console.error('Error fetching results:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (reportId: number, catIdx: number) => {
    const key = `${reportId}-${catIdx}`
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openReplay = async (report: SimReport) => {
    setReplayReport(report)
    setReplayLoading(true)
    setReplayRecording(null)
    try {
      const res = await fetch(`/api/admin/simulation-reports/${report.id}/recording`)
      const data = await res.json()
      if (data.success && data.recording) setReplayRecording(data.recording)
    } catch (err) {
      console.error('Failed to fetch recording:', err)
    } finally {
      setReplayLoading(false)
    }
  }

  const filtered = simTypeFilter === 'all' ? reports : reports.filter(r => r.simulationType === simTypeFilter)
  const chattingCount = reports.filter(r => r.simulationType === 'chatting').length
  const sextingCount = reports.filter(r => r.simulationType === 'sexting').length
  const aftercareCount = reports.filter(r => r.simulationType === 'aftercare').length
  const teacherCount = reports.filter(r => r.simulationType === 'sexting-teacher' || r.simulationType === 'chat-teacher' || r.simulationType === 'aftercare-teacher').length
  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((s, r) => s + calculateWeightedScore(r.categories, r.simulationType), 0) / filtered.length * 10) / 10
    : null
  const bestScore = filtered.length > 0
    ? Math.max(...filtered.map(r => calculateWeightedScore(r.categories, r.simulationType)))
    : null

  const analysis = useMemo(() => computeAnalysis(reports), [reports])

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      <section className="section pt-24 md:pt-40 px-3 md:px-6 relative z-10">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Link href="/training" className="inline-flex items-center gap-2 text-sm font-medium mb-4 md:mb-6 hover:opacity-80 transition-opacity" style={{ color: 'var(--accent)' }}>
              <ArrowLeft className="w-4 h-4" /> Back to Training
            </Link>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">My Simulation Results</h1>
            {user && (
              <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary-on-white)' }}>
                {user.telegramUsername} &middot; {user.email}
              </p>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex gap-1.5 md:gap-2 mb-6 max-w-3xl overflow-x-auto pb-1">
            {([['all', 'All', null], ['chatting', 'Chatting', MessageCircle], ['sexting', 'Sexting', Flame], ['aftercare', 'Aftercare', Zap], ['sexting-teacher', 'Sexting Teacher', GraduationCap], ['chat-teacher', 'Chat Teacher', GraduationCap], ['aftercare-teacher', 'AC Teacher', GraduationCap]] as const).map(([key, label, Icon]) => {
              const count = key === 'all' ? reports.length : reports.filter(r => r.simulationType === key).length
              return (
                <button key={key} onClick={() => setSimTypeFilter(key as typeof simTypeFilter)}
                  className={`flex-1 min-w-0 py-2 md:py-2.5 px-2 md:px-3 rounded-lg font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-1 md:gap-1.5 ${
                    simTypeFilter === key
                      ? key === 'sexting' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white' : key === 'aftercare' ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' : key === 'sexting-teacher' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : key === 'chat-teacher' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' : key === 'aftercare-teacher' ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {Icon && <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />}
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{key === 'all' ? 'All' : label.slice(0, 5)}</span>
                  <span className={`text-xs px-1 md:px-1.5 py-0.5 rounded-full ${simTypeFilter === key ? 'bg-white/20' : 'bg-gray-200'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="card bg-blue-50 border-2 border-blue-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-blue-900">{filtered.length}</div>
                <div className="text-xs md:text-sm text-blue-700">Sessions</div>
              </div>
            </div>
            <div className="card bg-green-50 border-2 border-green-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-900">{avgScore ?? '—'}</div>
                <div className="text-xs md:text-sm text-green-700">Avg Score</div>
              </div>
            </div>
            <div className="card bg-purple-50 border-2 border-purple-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-900">{bestScore ?? '—'}</div>
                <div className="text-xs md:text-sm text-purple-700">Best Score</div>
              </div>
            </div>
            <div className="card bg-orange-50 border-2 border-orange-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-orange-900">
                  {chattingCount > 0 || sextingCount > 0 || aftercareCount > 0 || teacherCount > 0
                    ? `${chattingCount}/${sextingCount}/${aftercareCount}/${teacherCount}`
                    : '—'}
                </div>
                <div className="text-xs md:text-sm text-orange-700">Chat/Sext/After/Teach</div>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          {!loading && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6 md:mb-8"
            >
              <div className="card" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '2px solid #e2e8f0' }}>
                <h3 className="text-lg md:text-xl font-bold mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Your Performance Analysis
                </h3>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-xl md:text-2xl font-black" style={{ color: getScoreColor(analysis.overallAvg) }}>{analysis.overallAvg}</div>
                    <div className="text-xs text-gray-500">Avg Score</div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: getScoreColor(analysis.overallAvg) }}>{getScoreLabel(analysis.overallAvg)}</div>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-xl md:text-2xl font-black text-blue-700">{analysis.totalSims}</div>
                    <div className="text-xs text-gray-500">Total Sims</div>
                  </div>
                  <div className="rounded-xl p-3 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="text-xl md:text-2xl font-black text-violet-700">{analysis.simTypeBreakdowns.length}</div>
                    <div className="text-xs text-gray-500">Categories</div>
                  </div>
                </div>

                {analysis.simTypeBreakdowns.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Score by Type</h4>
                    <div className="space-y-2">
                      {analysis.simTypeBreakdowns.map(tb => (
                        <div key={tb.type} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white" style={{ border: '1px solid #e5e7eb' }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: `${getScoreColor(tb.avgScore)}12`, color: getScoreColor(tb.avgScore) }}>{tb.avgScore}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold">{tb.label}</p>
                            <p className="text-xs text-gray-500">{tb.simCount} sim{tb.simCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-5">
                  {analysis.topStrengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: '#10b981' }}>
                        <TrendingUp className="w-4 h-4" /> Top Strengths
                      </h4>
                      <div className="space-y-2">
                        {analysis.topStrengths.map((s, i) => (
                          <div key={i} className="rounded-xl p-3 bg-white" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <div className="flex items-center gap-3">
                              <span className="text-base font-black" style={{ color: getCategoryScoreColor(s.avgScore) }}>{s.avgScore}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{s.category}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs text-gray-500">{s.simTypeLabel}</span>
                                  <span className="text-xs px-1 py-0.5 rounded font-semibold" style={{
                                    background: s.trend === 'improving' ? '#dcfce7' : s.trend === 'declining' ? '#fee2e2' : '#f3f4f6',
                                    color: s.trend === 'improving' ? '#16a34a' : s.trend === 'declining' ? '#dc2626' : '#6b7280',
                                  }}>{s.trend === 'improving' ? '↑' : s.trend === 'declining' ? '↓' : '→'}</span>
                                </div>
                              </div>
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">#{i + 1}</span>
                            </div>
                            {s.goodExamples.length > 0 && (
                              <div className="mt-2 text-xs px-3 py-1.5 rounded-lg leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', color: '#065f46' }}>
                                &ldquo;{s.goodExamples[0]}&rdquo;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: '#ef4444' }}>
                        <AlertTriangle className="w-4 h-4" /> Areas to Improve
                      </h4>
                      <div className="space-y-2">
                        {analysis.weaknesses.map((w, i) => (
                          <div key={i} className="rounded-xl p-3 bg-white" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div className="flex items-center gap-3">
                              <span className="text-base font-black" style={{ color: getCategoryScoreColor(w.avgScore) }}>{w.avgScore}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{w.category}</p>
                                <span className="text-xs text-gray-500">{w.simTypeLabel}</span>
                              </div>
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">{w.avgScore}/10</span>
                            </div>
                            {w.topAdvice && (
                              <div className="mt-2 text-xs px-3 py-1.5 rounded-lg leading-relaxed" style={{ background: 'rgba(249, 115, 22, 0.06)', color: '#7c2d12' }}>
                                <span className="font-bold" style={{ color: '#ea580c' }}>Tip: </span>{w.topAdvice.length > 200 ? w.topAdvice.slice(0, 200) + '...' : w.topAdvice}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {analysis.topOverallWeaknesses.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                      Key Feedback
                    </h4>
                    <div className="space-y-1">
                      {analysis.topOverallWeaknesses.map((area, i) => (
                        <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', color: '#92400e' }}>
                          <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.topPracticeScenarios.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2" style={{ color: '#7c3aed' }}>
                      <Sparkles className="w-3.5 h-3.5" /> Practice This
                    </h4>
                    <div className="space-y-1">
                      {analysis.topPracticeScenarios.map((p, i) => (
                        <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(124, 58, 237, 0.15)', color: '#4c1d95' }}>
                          <span className="font-bold flex-shrink-0" style={{ color: '#7c3aed' }}>{i + 1}.</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Refresh */}
          {user && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => fetchReports(user.telegramUsername, user.email)}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          )}

          {/* Loading / Empty / Reports */}
          {loading ? (
            <div className="card glass-card text-center py-12">
              <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ color: 'var(--text-secondary-on-white)' }}>Loading your results...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card glass-card text-center py-12">
              <p className="text-lg md:text-xl mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                {reports.length === 0 ? 'No simulation results yet' : `No ${simTypeFilter} results found`}
              </p>
              {reports.length === 0 && (
                <Link href="/simulations" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                  <MessageCircle className="w-4 h-4" /> Start a Simulation
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((report, index) => {
                const isExpanded = expandedReport === report.id
                const weightedScore = calculateWeightedScore(report.categories, report.simulationType)
                const reportWeights = getWeightsForReport(report)

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="card glass-card"
                  >
                    {/* Report Header */}
                    <div
                      className="flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer"
                      onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                    >
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div
                          className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-black text-sm md:text-lg flex-shrink-0"
                          style={{ background: `${getScoreColor(weightedScore)}15`, color: getScoreColor(weightedScore) }}
                        >
                          {weightedScore}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1 md:gap-2">
                            <span className={`text-xs font-bold px-1.5 md:px-2 py-0.5 rounded-full ${report.simulationType === 'sexting-teacher' ? 'bg-purple-100 text-purple-700' : report.simulationType === 'chat-teacher' ? 'bg-indigo-100 text-indigo-700' : report.simulationType === 'aftercare-teacher' ? 'bg-violet-100 text-violet-700' : report.simulationType === 'sexting' ? 'bg-rose-100 text-rose-700' : report.simulationType === 'aftercare' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                              {report.simulationType === 'sexting-teacher' ? '🎓 Teacher Demo' : report.simulationType === 'chat-teacher' ? '🎓 Chat Teacher' : report.simulationType === 'aftercare-teacher' ? '🎓 AC Teacher' : report.simulationType === 'sexting' ? '🔥 Sexting' : report.simulationType === 'aftercare' ? '💗 Aftercare' : '💬 Chatting'}
                            </span>
                            <span className="text-xs px-1.5 md:px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{report.durationMode}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>{report.messageCount} msgs</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                            <span className="text-xs inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              <Keyboard className="w-3 h-3" /> {report.typedCount}
                            </span>
                            {report.pasteCount > 0 ? (
                              <span className="text-xs inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                                <ClipboardPaste className="w-3 h-3" /> {report.pasteCount} pasted
                              </span>
                            ) : (
                              <span className="text-xs inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                <Keyboard className="w-3 h-3" /> all typed
                              </span>
                            )}
                            {report.wpm > 0 && (
                              <span className="text-xs inline-flex items-center gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold">
                                <Zap className="w-3 h-3" /> {report.wpm} WPM
                              </span>
                            )}
                            <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted-on-white)' }}>
                              {new Date(report.completedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="sm:hidden mt-1">
                            <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                              {new Date(report.completedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
                        <div className="text-right hidden md:block">
                          <div className="text-2xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}/100</div>
                          <div className="text-xs font-semibold" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</div>
                        </div>
                        {report.hasRecording && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openReplay(report) }}
                            className="p-2 rounded-lg hover:bg-purple-50 transition-colors group flex-shrink-0"
                            title="Watch session replay"
                          >
                            <Video className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                          </button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                        ) : (
                          <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                        )}
                      </div>
                    </div>

                    {/* Expanded Report */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {/* Score Circle */}
                        <div className="text-center mb-6 md:mb-10">
                          <div
                            className="inline-flex items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-full mb-4 md:mb-6 relative"
                            style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}
                          >
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center bg-white">
                              <span className="text-3xl md:text-4xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
                              <span className="text-xs font-semibold text-gray-400">/100</span>
                            </div>
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold mb-2">Score: {weightedScore}/100</h2>
                          <p className="text-base md:text-lg font-semibold mb-3" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
                          <div className="inline-flex flex-wrap gap-1.5 md:gap-3 justify-center text-xs font-medium">
                            <span className="px-2 md:px-2.5 py-1 rounded-full" style={{ background: '#10b98115', color: '#10b981' }}>85-100 Elite</span>
                            <span className="px-2 md:px-2.5 py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>70-84 Strong</span>
                            <span className="px-2 md:px-2.5 py-1 rounded-full" style={{ background: '#f9731615', color: '#f97316' }}>55-69 Dev</span>
                            <span className="px-2 md:px-2.5 py-1 rounded-full" style={{ background: '#ef444415', color: '#ef4444' }}>40-54 Below</span>
                            <span className="px-2 md:px-2.5 py-1 rounded-full" style={{ background: '#dc262615', color: '#dc2626' }}>0-39 Coach</span>
                          </div>
                        </div>

                        {/* Copy/Paste Banner */}
                        {(report.typedCount > 0 || report.pasteCount > 0) && (
                          <div className="mb-6 md:mb-8">
                            <div className="rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-wrap items-center gap-3 md:gap-6" style={{ background: report.pasteCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${report.pasteCount > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                              <div className="flex items-center gap-2">
                                <Keyboard className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                                <div>
                                  <span className="text-base md:text-lg font-black text-blue-700">{report.typedCount}</span>
                                  <span className="text-xs text-blue-600 ml-1">typed</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ClipboardPaste className={`w-4 h-4 md:w-5 md:h-5 ${report.pasteCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                                <div>
                                  <span className={`text-base md:text-lg font-black ${report.pasteCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{report.pasteCount}</span>
                                  <span className={`text-xs ml-1 ${report.pasteCount > 0 ? 'text-red-600' : 'text-green-600'}`}>pasted</span>
                                </div>
                              </div>
                              {report.pasteCount > 0 ? (
                                <div className="flex items-center gap-1.5 ml-auto px-2 md:px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {Math.round((report.pasteCount / (report.typedCount + report.pasteCount)) * 100)}% copy-pasted
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 ml-auto px-2 md:px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-bold">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  100% typed
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Score Table */}
                        <div className="rounded-xl md:rounded-2xl overflow-x-auto mb-6 md:mb-10" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                          <table className="w-full text-xs md:text-sm min-w-[420px]">
                            <thead>
                              <tr style={{ background: '#f8fafc' }}>
                                <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">#</th>
                                <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Category</th>
                                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Weight</th>
                                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Raw</th>
                                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.categories.map((cat, catIdx) => {
                                const tw = reportWeights[cat.name] || 0
                                const te = Math.round(((cat.score / 10) * tw) * 10) / 10
                                return (
                                  <tr key={catIdx} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td className="px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-400">{catIdx + 1}</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-500">{tw}</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}/10</td>
                                    <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{te}</td>
                                  </tr>
                                )
                              })}
                              <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f8fafc' }}>
                                <td colSpan={2} className="px-2 md:px-4 py-2 md:py-3 font-bold text-gray-900">TOTAL</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center font-bold text-gray-500">100</td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center"></td>
                                <td className="px-2 md:px-4 py-2 md:py-3 text-center font-black text-base md:text-lg" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}/100</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
                          {report.categories.map((cat, catIdx) => {
                            const weight = reportWeights[cat.name] || 0
                            const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                            return (
                              <div
                                key={catIdx}
                                className="rounded-xl md:rounded-2xl p-3 md:p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                  background: '#ffffff',
                                  border: `2px solid ${expandedCategories.has(`${report.id}-${catIdx}`) ? getCategoryScoreColor(cat.score) : '#e5e7eb'}`,
                                  boxShadow: expandedCategories.has(`${report.id}-${catIdx}`) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : '0 1px 3px rgba(0,0,0,0.06)',
                                }}
                                onClick={(e) => { e.stopPropagation(); toggleCategory(report.id, catIdx) }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-2xl md:text-3xl font-black" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}</span>
                                  <span className="text-xs text-gray-400">/10</span>
                                </div>
                                <p className="text-xs md:text-sm font-semibold leading-tight mb-1">{cat.name}</p>
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                  <span>{earned}/{weight}</span>
                                  <span className="font-semibold" style={{ color: getCategoryScoreColor(cat.score) }}>&times;{weight}</span>
                                </div>
                                <div className="w-full rounded-full h-1.5" style={{ background: '#e5e7eb' }}>
                                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${cat.score * 10}%`, background: getCategoryScoreColor(cat.score) }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Detailed Breakdown */}
                        <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
                          <h3 className="text-lg md:text-xl font-bold">Detailed Breakdown</h3>
                          {report.categories.map((cat, catIdx) => {
                            const catKey = `${report.id}-${catIdx}`
                            const isCatExpanded = expandedCategories.has(catKey)
                            const catWeight = reportWeights[cat.name] || 0
                            const catEarned = Math.round(((cat.score / 10) * catWeight) * 10) / 10

                            return (
                              <div key={catIdx} className="rounded-xl md:rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleCategory(report.id, catIdx) }}
                                  className="w-full px-3 md:px-6 py-3 md:py-4 flex items-center justify-between text-left transition-colors duration-200"
                                  style={{ background: isCatExpanded ? '#f8fafc' : 'transparent' }}
                                >
                                  <div className="flex items-center gap-2.5 md:gap-4 min-w-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-base md:text-lg flex-shrink-0" style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                                      {cat.score}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm md:text-base truncate">{cat.name}</p>
                                      <p className="text-xs md:text-sm" style={{ color: getCategoryScoreColor(cat.score) }}>{catEarned}/{catWeight} pts (&times;{catWeight})</p>
                                    </div>
                                  </div>
                                  {isCatExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                                </button>

                                {isCatExpanded && (
                                  <div className="px-3 md:px-6 pb-4 md:pb-6 space-y-3 md:space-y-4">
                                    <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{cat.feedback}</p>

                                    {cat.examples.good.length > 0 && (
                                      <div>
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>What was done well:</p>
                                        <div className="space-y-2">
                                          {cat.examples.good.map((ex, i) => (
                                            <div key={i} className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                              &ldquo;{ex}&rdquo;
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {cat.examples.needsWork.length > 0 && (
                                      <div>
                                        <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#f97316' }}>Areas to improve:</p>
                                        <div className="space-y-2">
                                          {cat.examples.needsWork.map((ex, i) => (
                                            <div key={i} className="px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs md:text-sm" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#9a3412', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                              &ldquo;{ex}&rdquo;
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="p-3 md:p-4 rounded-xl" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)' }}>
                                      <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#ea580c' }}><Sparkles className="w-4 h-4" />Practice Advice</p>
                                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#64748b' }}>{cat.advice}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Overall Assessment */}
                        <div className="rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 space-y-4 md:space-y-6" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                          <h3 className="text-lg md:text-xl font-bold">Overall Assessment</h3>
                          {typeof report.overallFeedback === 'object' && report.overallFeedback !== null ? (
                            <>
                              {(report.overallFeedback as OverallFeedback).summary && (
                                <p className="text-[15px] leading-relaxed" style={{ color: '#64748b' }}>{(report.overallFeedback as OverallFeedback).summary}</p>
                              )}
                              {(report.overallFeedback as OverallFeedback).strengths?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                                    <span className="w-2 h-2 rounded-full bg-green-500" /> What Was Done Well
                                  </h4>
                                  <div className="space-y-2">
                                    {(report.overallFeedback as OverallFeedback).strengths.map((s, i) => (
                                      <div key={i} className="flex gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
                                        <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span>
                                        <span>{s}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(report.overallFeedback as OverallFeedback).weaknesses?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
                                    <span className="w-2 h-2 rounded-full bg-red-500" /> What Needs Work
                                  </h4>
                                  <div className="space-y-2">
                                    {(report.overallFeedback as OverallFeedback).weaknesses.map((w, i) => (
                                      <div key={i} className="flex gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#991b1b' }}>
                                        <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">−</span>
                                        <span>{w}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(report.overallFeedback as OverallFeedback).missedOpportunities?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Missed Opportunities
                                  </h4>
                                  <div className="space-y-2">
                                    {(report.overallFeedback as OverallFeedback).missedOpportunities.map((m, i) => (
                                      <div key={i} className="flex gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', color: '#92400e' }}>
                                        <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">!</span>
                                        <span>{m}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {(report.overallFeedback as OverallFeedback).practiceScenarios?.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#ea580c' }}>
                                    <Sparkles className="w-4 h-4" /> Practice These Scenarios
                                  </h4>
                                  <div className="space-y-2">
                                    {(report.overallFeedback as OverallFeedback).practiceScenarios.map((p, i) => (
                                      <div key={i} className="flex gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs md:text-sm leading-relaxed" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)', color: '#7c2d12' }}>
                                        <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#ea580c' }}>{i + 1}.</span>
                                        <span>{p}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-line" style={{ color: '#64748b' }}>
                              {typeof report.overallFeedback === 'string' ? report.overallFeedback : ''}
                            </p>
                          )}
                        </div>

                        {/* Replay Button */}
                        {report.hasRecording && (
                          <div className="flex justify-center mb-6 md:mb-8">
                            <button
                              onClick={(e) => { e.stopPropagation(); openReplay(report) }}
                              className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base text-white transition-all duration-200 hover:scale-[1.02]"
                              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                            >
                              <Video className="w-4 h-4 md:w-5 md:h-5" />
                              Watch Session Replay
                            </button>
                          </div>
                        )}

                        {/* Conversation */}
                        <div className="rounded-xl md:rounded-2xl p-3 md:p-6" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                          <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Full Conversation</h3>
                          <div className="space-y-2 pr-1 md:pr-2 max-h-96 overflow-y-auto">
                            {report.conversation.map((msg, i) => (
                              msg.role === 'system' ? (
                                <div key={i} className="flex justify-center">
                                  <span className="text-xs italic px-2 md:px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-center">{msg.content}</span>
                                </div>
                              ) : (
                                <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                                  {msg.contentType === 'voice_memo' && msg.role === 'creator' ? (
                                    <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#7c3aed', color: 'white' }}>🎤 Voice Memo</div>
                                  ) : msg.contentType === 'video' && msg.role === 'creator' ? (
                                    <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2" style={{ background: '#1a1a2e', color: 'white' }}>
                                      📹 PPV ${msg.price}
                                      {msg.unlocked === true && <span style={{ color: '#10b981' }}>✓ Bought</span>}
                                      {msg.unlocked === false && <span style={{ color: '#ef4444' }}>✗ Passed</span>}
                                    </div>
                                  ) : msg.contentType === 'teaser' && msg.role === 'creator' ? (
                                    <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#e11d48', color: 'white' }}>🎬 Free Teaser</div>
                                  ) : (
                                    <div
                                      className="max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2 rounded-2xl text-xs md:text-sm"
                                      style={{
                                        background: msg.role === 'creator' ? (report.simulationType === 'sexting-teacher' ? '#7c3aed' : report.simulationType === 'chat-teacher' ? '#6366f1' : report.simulationType === 'sexting' ? '#e11d48' : report.simulationType === 'aftercare' ? '#e84393' : '#ff6b35') : '#ffffff',
                                        color: msg.role === 'creator' ? '#ffffff' : '#000000',
                                        borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                                        borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                      }}
                                    >
                                      {msg.content}
                                    </div>
                                  )}
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Replay Modal */}
      {replayReport && (
        <SessionReplayModal
          report={replayReport}
          recording={replayRecording}
          loading={replayLoading}
          onClose={() => { setReplayReport(null); setReplayRecording(null) }}
        />
      )}
    </div>
  )
}

function SessionReplayModal({ report, recording, loading, onClose }: {
  report: SimReport
  recording: {t:number;e:string;d:string}[] | null
  loading: boolean
  onClose: () => void
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [replayMessages, setReplayMessages] = useState<{role: string; content: string}[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const eventIndexRef = useRef(0)
  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const totalDuration = recording && recording.length > 0 ? recording[recording.length - 1].t : 0

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const resetReplay = useCallback(() => {
    setReplayMessages([])
    setCurrentInput('')
    setShowTypingIndicator(false)
    setCurrentTime(0)
    eventIndexRef.current = 0
    pausedAtRef.current = 0
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    pausedAtRef.current = currentTime
  }, [currentTime])

  const processEventsUpTo = useCallback((targetTime: number) => {
    if (!recording) return
    const msgs: {role: string; content: string}[] = []
    let input = ''
    let typing = false
    for (let i = 0; i < recording.length; i++) {
      const ev = recording[i]
      if (ev.t > targetTime) break
      switch (ev.e) {
        case 'i': input = ev.d; break
        case 's': msgs.push({ role: 'creator', content: ev.d }); input = ''; break
        case 'r': msgs.push({ role: 'subscriber', content: ev.d }); break
        case 'x': msgs.push({ role: 'system', content: ev.d }); break
        case 'y': typing = true; break
        case 'z': typing = false; break
      }
      eventIndexRef.current = i + 1
    }
    setReplayMessages(msgs)
    setCurrentInput(input)
    setShowTypingIndicator(typing)
  }, [recording])

  const startPlayback = useCallback(() => {
    if (!recording || recording.length === 0) return
    setIsPlaying(true)
    const baseTime = pausedAtRef.current
    startTimeRef.current = Date.now()
    processEventsUpTo(baseTime)
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) * speed
      const newTime = baseTime + elapsed
      if (newTime >= totalDuration) {
        processEventsUpTo(totalDuration)
        setCurrentTime(totalDuration)
        setIsPlaying(false)
        if (timerRef.current) clearInterval(timerRef.current)
        timerRef.current = null
        return
      }
      processEventsUpTo(newTime)
      setCurrentTime(newTime)
    }, 50)
  }, [recording, speed, totalDuration, processEventsUpTo])

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [replayMessages])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      pausedAtRef.current = currentTime
      if (timerRef.current) clearInterval(timerRef.current)
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) * speed
        const newTime = pausedAtRef.current + elapsed
        if (newTime >= totalDuration) {
          processEventsUpTo(totalDuration)
          setCurrentTime(totalDuration)
          setIsPlaying(false)
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          return
        }
        processEventsUpTo(newTime)
        setCurrentTime(newTime)
      }, 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    const wasPlaying = isPlaying
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
    setIsPlaying(false)
    eventIndexRef.current = 0
    processEventsUpTo(newTime)
    setCurrentTime(newTime)
    pausedAtRef.current = newTime
    if (wasPlaying) setTimeout(() => startPlayback(), 50)
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback()
    } else {
      if (currentTime >= totalDuration) {
        resetReplay()
        setTimeout(() => startPlayback(), 50)
      } else {
        startPlayback()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl sm:mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3 md:p-4 border-b">
          <div className="min-w-0">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Video className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0" />
              Session Replay
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">{report.simulationType} simulation</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : !recording || recording.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12 text-gray-400">No recording data available</div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2" style={{ background: '#f1f5f9', minHeight: '200px', maxHeight: '50vh' }}>
              {replayMessages.map((msg, i) => (
                msg.role === 'system' ? (
                  <div key={i} className="text-center">
                    <span className="text-xs italic px-2 md:px-3 py-1 rounded-full bg-gray-200 text-gray-600">{msg.content}</span>
                  </div>
                ) : (
                  <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2 text-xs md:text-sm"
                      style={{
                        background: msg.role === 'creator'
                          ? (report.simulationType === 'sexting-teacher' ? '#7c3aed' : report.simulationType === 'chat-teacher' ? '#6366f1' : report.simulationType === 'sexting' ? '#e11d48' : report.simulationType === 'aftercare' ? '#e84393' : '#ff6b35')
                          : '#ffffff',
                        color: msg.role === 'creator' ? '#ffffff' : '#1e293b',
                        border: msg.role === 'subscriber' ? '1px solid #e2e8f0' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                )
              ))}
              {showTypingIndicator && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-2 text-sm border border-gray-200">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-3 md:px-4 py-2 border-t bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 flex-shrink-0">Input:</span>
                <div className="flex-1 rounded-lg bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm min-h-[32px] md:min-h-[36px] border border-gray-200 font-mono break-all">
                  {currentInput}
                  {isPlaying && <span className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />}
                </div>
              </div>
            </div>

            <div className="p-3 md:p-4 border-t bg-gray-50 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs font-mono text-gray-500 w-10 md:w-12 text-right">{formatTime(currentTime)}</span>
                <input type="range" min={0} max={totalDuration} value={currentTime} onChange={handleSeek} className="flex-1 h-2 rounded-full accent-purple-500 cursor-pointer" />
                <span className="text-xs font-mono text-gray-500 w-10 md:w-12">{formatTime(totalDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={togglePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button onClick={() => { resetReplay(); setIsPlaying(false) }} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors">Reset</button>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 5].map(s => (
                    <button key={s} onClick={() => setSpeed(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${speed === s ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MyResultsPage() {
  return (
    <TrainingClientWrapper>
      <MyResultsContent />
    </TrainingClientWrapper>
  )
}
