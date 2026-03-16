'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, RefreshCw, Trash2, LogOut, MessageCircle, ChevronDown, ChevronUp, StickyNote, Sparkles, Keyboard, ClipboardPaste, AlertTriangle, Download, Loader2, Flame, Zap, Play, Pause, X, Video, GraduationCap, RotateCcw } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import AdminWrapper from './admin-wrapper'
import { useRouter } from 'next/navigation'

interface AssessmentAnswer {
  question: string
  correctAnswer: string
  userAnswer: string
  isCorrect: boolean
  feedback: string
}

interface Assessment {
  day: number
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  attempt_number: number
  answers: AssessmentAnswer[]
  completed_at: string
}

interface User {
  id: number
  telegramUsername: string
  email: string
  createdAt: string
  assessments: {
    day2: Assessment[]
    day3: Assessment[]
    day4: Assessment[]
    day5: Assessment[]
  }
}

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

function AdminPanelContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'assessments' | 'simulations' | 'peruser'>('assessments')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [simReports, setSimReports] = useState<SimReport[]>([])
  const [simLoading, setSimLoading] = useState(true)
  const [simSearch, setSimSearch] = useState('')
  const [simTypeFilter, setSimTypeFilter] = useState<'all' | 'chatting' | 'sexting' | 'aftercare' | 'sexting-teacher' | 'chat-teacher' | 'aftercare-teacher' | 'combined'>('all')
  const [replayReport, setReplayReport] = useState<SimReport | null>(null)
  const [replayRecording, setReplayRecording] = useState<{t:number;e:string;d:string}[] | null>(null)
  const [replayLoading, setReplayLoading] = useState(false)
  const [expandedReport, setExpandedReport] = useState<number | null>(null)
  const [expandedSimCategories, setExpandedSimCategories] = useState<Set<string>>(new Set())
  const [exportingReportId, setExportingReportId] = useState<number | null>(null)
  const [expandedUserAssessment, setExpandedUserAssessment] = useState<string | null>(null)
  const [perUserSearch, setPerUserSearch] = useState('')
  const [expandedPerUser, setExpandedPerUser] = useState<number | null>(null)
  const [expandedPerUserReport, setExpandedPerUserReport] = useState<number | null>(null)
  const [expandedPerUserCats, setExpandedPerUserCats] = useState<Set<string>>(new Set())
  const reportContentRefs = useRef<Record<number, HTMLDivElement | null>>({})
  const [grantingRetry, setGrantingRetry] = useState<string | null>(null)

  const grantRetry = async (user: User, day: number) => {
    const key = `${user.id}-day${day}`
    if (!confirm(`Grant ${user.telegramUsername} another try for Day ${day}?`)) return
    setGrantingRetry(key)
    try {
      const res = await fetch('/api/admin/grant-retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_username: user.telegramUsername,
          email: user.email,
          day,
        }),
      })
      if (!res.ok) throw new Error('Failed to grant retry')
      await fetchUsers()
    } catch (err) {
      console.error('Grant retry error:', err)
      alert('Failed to grant retry. Please try again.')
    } finally {
      setGrantingRetry(null)
    }
  }

  const exportSimReportAsPdf = useCallback(async (report: SimReport) => {
    setExportingReportId(report.id)

    const wasExpanded = expandedReport === report.id
    if (!wasExpanded) setExpandedReport(report.id)

    const prevCategories = new Set(expandedSimCategories)
    const allCatKeys = new Set(report.categories.map((_, i) => `${report.id}-${i}`))
    setExpandedSimCategories(prev => {
      const next = new Set(prev)
      allCatKeys.forEach(k => next.add(k))
      return next
    })

    await new Promise(r => setTimeout(r, 800))

    try {
      const el = reportContentRefs.current[report.id]
      if (!el) throw new Error('Report element not found')

      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pdf = new jsPDF('p', 'mm', 'a4')

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const date = new Date(report.completedAt).toISOString().slice(0, 10)
      pdf.save(`simulation-report_${report.telegramUsername}_${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExpandedSimCategories(prevCategories)
      if (!wasExpanded) setExpandedReport(null)
      setExportingReportId(null)
    }
  }, [expandedReport, expandedSimCategories])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_expiry')
    router.push('/admin/auth')
  }

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const data = await response.json()
      console.log('Admin API response:', data)
      if (data.success) {
        setUsers(data.users)
      } else {
        console.error('API returned error:', data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  const deleteUser = async (userId: number, telegramUsername: string) => {
    if (!confirm(`Are you sure you want to delete user ${telegramUsername}? This will also delete all their assessment results.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        // Remove user from state immediately
        setUsers(prev => prev.filter(u => u.id !== userId))
        alert(`User ${telegramUsername} deleted successfully`)
      } else {
        alert('Failed to delete user: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const fetchSimReports = async (showLoading = true) => {
    if (showLoading) setSimLoading(true)
    try {
      const response = await fetch('/api/admin/simulation-reports', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const data = await response.json()
      if (data.success) {
        setSimReports(data.reports)
      }
    } catch (error) {
      console.error('Error fetching simulation reports:', error)
    } finally {
      if (showLoading) setSimLoading(false)
    }
  }

  const toggleSimCategory = (reportId: number, catIdx: number) => {
    const key = `${reportId}-${catIdx}`
    setExpandedSimCategories(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const togglePerUserCat = (reportId: number, catIdx: number) => {
    const key = `pu-${reportId}-${catIdx}`
    setExpandedPerUserCats(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const getUserSimReports = (username: string): SimReport[] => {
    return simReports.filter(r => r.telegramUsername === username)
  }

  const deleteSimReport = async (id: number) => {
    if (!confirm('Delete this simulation report? This cannot be undone.')) return
    try {
      const res = await fetch('/api/admin/simulation-reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setSimReports(prev => prev.filter(r => r.id !== id))
        if (expandedReport === id) setExpandedReport(null)
      }
    } catch (error) {
      console.error('Error deleting simulation report:', error)
    }
  }

  const openReplay = async (report: SimReport) => {
    setReplayReport(report)
    setReplayLoading(true)
    setReplayRecording(null)
    try {
      const res = await fetch(`/api/admin/simulation-reports/${report.id}/recording`)
      const data = await res.json()
      if (data.success && data.recording) {
        setReplayRecording(data.recording)
      }
    } catch (err) {
      console.error('Failed to fetch recording:', err)
    } finally {
      setReplayLoading(false)
    }
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

  const getWeightsForReport = (report: SimReport): Record<string, number> => {
    if (report.simulationType === 'sexting' || report.simulationType === 'sexting-teacher') return SEXTING_CATEGORY_WEIGHTS
    if (report.simulationType === 'aftercare') return AFTERCARE_CATEGORY_WEIGHTS
    if (report.simulationType === 'combined') return COMBINED_CATEGORY_WEIGHTS
    return CHATTING_CATEGORY_WEIGHTS
  }

  const calculateWeightedScore = (categories: SimCategory[], simType?: string): number => {
    const weights = (simType === 'sexting' || simType === 'sexting-teacher') ? SEXTING_CATEGORY_WEIGHTS : simType === 'aftercare' ? AFTERCARE_CATEGORY_WEIGHTS : simType === 'combined' ? COMBINED_CATEGORY_WEIGHTS : CHATTING_CATEGORY_WEIGHTS
    let total = 0
    for (const cat of categories) {
      const weight = weights[cat.name] || 0
      total += (cat.score / 10) * weight
    }
    return Math.round(total * 10) / 10
  }

  const getCategoryScoreColor = (score: number): string => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#f59e0b'
    if (score >= 4) return '#f97316'
    return '#ef4444'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#10b981'
    if (score >= 70) return '#f59e0b'
    if (score >= 55) return '#f97316'
    if (score >= 40) return '#ef4444'
    return '#dc2626'
  }

  const getScoreLabel = (score: number): string => {
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
    worstScore: number
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
    bestScore: number
    worstScore: number
  }

  interface UserAnalysis {
    overallAvg: number
    totalSims: number
    simTypeBreakdowns: SimTypeBreakdown[]
    allCategories: CategoryDetail[]
    topStrengths: CategoryDetail[]
    weaknesses: CategoryDetail[]
    topMissedOpportunities: string[]
    topPracticeScenarios: string[]
    topOverallStrengths: string[]
    topOverallWeaknesses: string[]
    bestSim: { score: number; type: string; date: string } | null
    worstSim: { score: number; type: string; date: string } | null
  }

  const generateUserAnalysis = (simulations: SimReport[]): UserAnalysis | null => {
    if (simulations.length === 0) return null

    const byType: Record<string, SimReport[]> = {
      chatting: simulations.filter(s => s.simulationType === 'chatting' || s.simulationType === 'chat-teacher'),
      sexting: simulations.filter(s => s.simulationType === 'sexting' || s.simulationType === 'sexting-teacher'),
      aftercare: simulations.filter(s => s.simulationType === 'aftercare' || s.simulationType === 'aftercare-teacher'),
      combined: simulations.filter(s => s.simulationType === 'combined'),
    }

    const simTypeBreakdowns: SimTypeBreakdown[] = []
    for (const [type, sims] of Object.entries(byType)) {
      if (sims.length === 0) continue
      const scores = sims.map(s => calculateWeightedScore(s.categories, s.simulationType))
      simTypeBreakdowns.push({
        type,
        label: getSimTypeLabel(type),
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
        simCount: sims.length,
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
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
          if (cat.examples?.good) catData[cat.name].goods.push(...cat.examples.good.filter(e => e.trim()))
          if (cat.examples?.needsWork) catData[cat.name].bads.push(...cat.examples.needsWork.filter(e => e.trim()))
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
          avgScore: avg, bestScore: Math.max(...data.scores), worstScore: Math.min(...data.scores),
          count: data.scores.length, trend,
          goodExamples: Array.from(new Set(data.goods)).slice(0, 3),
          badExamples: Array.from(new Set(data.bads)).slice(0, 3),
          topAdvice: data.advices[data.advices.length - 1] || '',
        })
      }
    }

    const sorted = [...allCategories].sort((a, b) => b.avgScore - a.avgScore)
    const topStrengths = sorted.filter(c => c.avgScore >= 7).slice(0, 5)
    const weaknesses = sorted.filter(c => c.avgScore < 6).sort((a, b) => a.avgScore - b.avgScore).slice(0, 8)

    const missedOps: string[] = []
    const practiceScens: string[] = []
    const overallStrengths: string[] = []
    const overallWeaknesses: string[] = []
    for (const sim of simulations) {
      if (typeof sim.overallFeedback === 'object' && sim.overallFeedback !== null) {
        const fb = sim.overallFeedback as OverallFeedback
        if (fb.missedOpportunities) missedOps.push(...fb.missedOpportunities)
        if (fb.practiceScenarios) practiceScens.push(...fb.practiceScenarios)
        if (fb.strengths) overallStrengths.push(...fb.strengths)
        if (fb.weaknesses) overallWeaknesses.push(...fb.weaknesses)
      }
    }

    const overallAvg = Math.round(
      simulations.reduce((s, r) => s + calculateWeightedScore(r.categories, r.simulationType), 0) / simulations.length * 10
    ) / 10

    const allScored = simulations.map(s => ({ score: calculateWeightedScore(s.categories, s.simulationType), type: s.simulationType, date: s.completedAt }))
    const bestSim = allScored.length > 0 ? allScored.reduce((a, b) => a.score >= b.score ? a : b) : null
    const worstSim = allScored.length > 0 ? allScored.reduce((a, b) => a.score <= b.score ? a : b) : null

    return {
      overallAvg, totalSims: simulations.length, simTypeBreakdowns, allCategories,
      topStrengths, weaknesses,
      topMissedOpportunities: Array.from(new Set(missedOps)).slice(0, 6),
      topPracticeScenarios: Array.from(new Set(practiceScens)).slice(0, 4),
      topOverallStrengths: Array.from(new Set(overallStrengths)).slice(0, 5),
      topOverallWeaknesses: Array.from(new Set(overallWeaknesses)).slice(0, 6),
      bestSim, worstSim,
    }
  }

  const getTop3PerType = (simulations: SimReport[]): {
    chatting: SimReport[]; sexting: SimReport[]; aftercare: SimReport[]; top3Ids: Set<number>
  } => {
    const sortBest = (sims: SimReport[]) =>
      [...sims].sort((a, b) => calculateWeightedScore(b.categories, b.simulationType) - calculateWeightedScore(a.categories, a.simulationType)).slice(0, 3)

    const top3Chatting = sortBest(simulations.filter(s => s.simulationType === 'chatting' || s.simulationType === 'chat-teacher'))
    const top3Sexting = sortBest(simulations.filter(s => s.simulationType === 'sexting' || s.simulationType === 'sexting-teacher'))
    const top3Aftercare = sortBest(simulations.filter(s => s.simulationType === 'aftercare' || s.simulationType === 'aftercare-teacher'))

    const top3Ids = new Set([
      ...top3Chatting.map(s => s.id),
      ...top3Sexting.map(s => s.id),
      ...top3Aftercare.map(s => s.id),
    ])

    return { chatting: top3Chatting, sexting: top3Sexting, aftercare: top3Aftercare, top3Ids }
  }

  const getSimTypeLabel = (type: string) => {
    switch (type) {
      case 'chatting': return 'Relationship Building'
      case 'sexting': return 'Sexting'
      case 'aftercare': return 'Aftercare'
      case 'combined': return 'Full Session'
      default: return type
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchSimReports()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchUsers(false)
      if (activeTab === 'simulations' || activeTab === 'peruser') fetchSimReports(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh, activeTab])

  const filteredUsers = users.filter(user =>
    user.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getLatestAttempt = (assessments: Assessment[]) => {
    if (!assessments || assessments.length === 0) return null
    return assessments[assessments.length - 1]
  }

  const getAssessmentStatus = (assessments: Assessment[]) => {
    const latest = getLatestAttempt(assessments)
    if (!latest) {
      return { icon: Clock, color: 'text-gray-400', text: 'Not Completed', bgColor: 'bg-gray-100' }
    }
    if (latest.passed) {
      return { icon: CheckCircle, color: 'text-green-600', text: `Passed (${latest.score}/${latest.total_questions})`, bgColor: 'bg-green-50' }
    }
    return { icon: XCircle, color: 'text-red-600', text: `Failed (${latest.score}/${latest.total_questions})`, bgColor: 'bg-red-50' }
  }

  const getTotalAttempts = (assessments: Assessment[]) => {
    return assessments.length
  }

  const stats = {
    totalUsers: users.length,
    day2Completed: users.filter(u => u.assessments.day2.length > 0).length,
    day3Completed: users.filter(u => u.assessments.day3.length > 0).length,
    day4Completed: users.filter(u => u.assessments.day4.length > 0).length,
    day5Completed: users.filter(u => u.assessments.day5.length > 0).length,
  }

  const renderExpandedReport = (report: SimReport) => {
    const weightedScore = calculateWeightedScore(report.categories, report.simulationType)
    const reportWeights = getWeightsForReport(report)
    return (
      <div className="px-3 md:px-5 pb-4 md:pb-6 border-t border-gray-200 pt-4 md:pt-6" ref={(el) => { reportContentRefs.current[report.id] = el }}>
        <div className="text-center mb-6 md:mb-10">
          <div
            className="inline-flex items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-full mb-3 md:mb-4 relative"
            style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center bg-white">
              <span className="text-2xl md:text-3xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
              <span className="text-xs font-semibold text-gray-400">/100</span>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-1">Score: {weightedScore}/100</h3>
          <p className="text-sm md:text-base font-semibold" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
        </div>

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
                  {Math.round((report.pasteCount / (report.typedCount + report.pasteCount)) * 100)}%
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

        <div className="rounded-xl md:rounded-2xl overflow-x-auto mb-6 md:mb-8" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <table className="w-full text-xs md:text-sm min-w-[380px]">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">#</th>
                <th className="text-left px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Category</th>
                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Wt</th>
                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Raw</th>
                <th className="text-center px-2 md:px-4 py-2 md:py-3 font-semibold text-gray-900">Pts</th>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 mb-6 md:mb-8">
          {report.categories.map((cat, catIdx) => {
            const weight = reportWeights[cat.name] || 0
            const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
            const catKey = `pu-${report.id}-${catIdx}`
            return (
              <div key={catIdx} className="rounded-xl md:rounded-2xl p-3 md:p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: '#ffffff',
                  border: `2px solid ${expandedPerUserCats.has(catKey) ? getCategoryScoreColor(cat.score) : '#e5e7eb'}`,
                  boxShadow: expandedPerUserCats.has(catKey) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onClick={(e) => { e.stopPropagation(); togglePerUserCat(report.id, catIdx) }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl md:text-2xl font-black" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}</span>
                  <span className="text-xs text-gray-400">/10</span>
                </div>
                <p className="text-xs font-semibold leading-tight mb-1">{cat.name}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>{earned}/{weight} pts</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: '#e5e7eb' }}>
                  <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${cat.score * 10}%`, background: getCategoryScoreColor(cat.score) }} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
          <h4 className="text-sm md:text-base font-bold">Detailed Breakdown</h4>
          {report.categories.map((cat, catIdx) => {
            const catKey = `pu-${report.id}-${catIdx}`
            const isCatOpen = expandedPerUserCats.has(catKey)
            const catWeight = reportWeights[cat.name] || 0
            const catEarned = Math.round(((cat.score / 10) * catWeight) * 10) / 10

            return (
              <div key={catIdx} className="rounded-xl md:rounded-2xl overflow-hidden"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); togglePerUserCat(report.id, catIdx) }}
                  className="w-full px-3 md:px-5 py-2.5 md:py-3 flex items-center justify-between text-left transition-colors duration-200"
                  style={{ background: isCatOpen ? '#f8fafc' : 'transparent' }}>
                  <div className="flex items-center gap-2.5 md:gap-3 min-w-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-xs md:text-sm flex-shrink-0"
                      style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                      {cat.score}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs md:text-sm truncate">{cat.name}</p>
                      <p className="text-xs" style={{ color: getCategoryScoreColor(cat.score) }}>{catEarned}/{catWeight} pts</p>
                    </div>
                  </div>
                  {isCatOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                </button>

                {isCatOpen && (
                  <div className="px-3 md:px-5 pb-4 md:pb-5 space-y-3">
                    <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{cat.feedback}</p>
                    {cat.examples.good.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#10b981' }}>What was done well:</p>
                        {cat.examples.good.map((ex, i) => (
                          <div key={i} className="px-3 py-2 rounded-xl text-xs mb-1.5" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            &ldquo;{ex}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                    {cat.examples.needsWork.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-1.5" style={{ color: '#f97316' }}>Areas to improve:</p>
                        {cat.examples.needsWork.map((ex, i) => (
                          <div key={i} className="px-3 py-2 rounded-xl text-xs mb-1.5" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#9a3412', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                            &ldquo;{ex}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)' }}>
                      <p className="text-xs font-semibold mb-1 flex items-center gap-1" style={{ color: '#ea580c' }}>
                        <Sparkles className="w-3 h-3" /> Practice Advice
                      </p>
                      <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: '#64748b' }}>{cat.advice}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 space-y-3 md:space-y-4" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h4 className="text-sm md:text-base font-bold">Overall Assessment</h4>
          {typeof report.overallFeedback === 'object' && report.overallFeedback !== null ? (
            <>
              {(report.overallFeedback as OverallFeedback).summary && (
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{(report.overallFeedback as OverallFeedback).summary}</p>
              )}
              {(report.overallFeedback as OverallFeedback).strengths?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Strengths
                  </h5>
                  {(report.overallFeedback as OverallFeedback).strengths.map((s, i) => (
                    <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed mb-1.5" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
                      <span className="text-green-500 font-bold flex-shrink-0">+</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {(report.overallFeedback as OverallFeedback).weaknesses?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#ef4444' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Weaknesses
                  </h5>
                  {(report.overallFeedback as OverallFeedback).weaknesses.map((w, i) => (
                    <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed mb-1.5" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#991b1b' }}>
                      <span className="text-red-500 font-bold flex-shrink-0">-</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
              {(report.overallFeedback as OverallFeedback).missedOpportunities?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Missed Opportunities
                  </h5>
                  {(report.overallFeedback as OverallFeedback).missedOpportunities.map((m, i) => (
                    <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed mb-1.5" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', color: '#92400e' }}>
                      <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}
              {(report.overallFeedback as OverallFeedback).practiceScenarios?.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#ea580c' }}>
                    <Sparkles className="w-3 h-3" /> Practice Scenarios
                  </h5>
                  {(report.overallFeedback as OverallFeedback).practiceScenarios.map((p, i) => (
                    <div key={i} className="flex gap-2 px-3 py-2 rounded-xl text-xs leading-relaxed mb-1.5" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)', color: '#7c2d12' }}>
                      <span className="font-bold flex-shrink-0" style={{ color: '#ea580c' }}>{i + 1}.</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="leading-relaxed whitespace-pre-line text-sm" style={{ color: '#64748b' }}>
              {typeof report.overallFeedback === 'string' ? report.overallFeedback : ''}
            </p>
          )}
        </div>

        {report.notes && report.notes.trim() && (
          <div className="rounded-xl md:rounded-2xl p-3 md:p-5 mb-4 md:mb-6" style={{ background: '#fffef0', border: '1px solid #e8e4c9' }}>
            <h4 className="text-xs md:text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#4a4520' }}>
              <StickyNote className="w-4 h-4" /> Creator Notes
            </h4>
            <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{report.notes}</p>
          </div>
        )}

        <div className="rounded-xl md:rounded-2xl p-3 md:p-5" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          <h4 className="text-xs md:text-sm font-bold mb-2 md:mb-3">Full Conversation</h4>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 md:pr-2">
            {report.conversation.map((msg, i) => (
              msg.role === 'system' ? (
                <div key={i} className="flex justify-center">
                  <span className="text-xs italic px-2 md:px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-center">{msg.content}</span>
                </div>
              ) : (
              <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                {msg.contentType === 'voice_memo' && msg.role === 'creator' ? (
                  <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#7c3aed', color: 'white' }}>Voice Memo</div>
                ) : msg.contentType === 'video' && msg.role === 'creator' ? (
                  <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2" style={{ background: '#1a1a2e', color: 'white' }}>
                    PPV ${msg.price}
                    {msg.unlocked === true && <span style={{ color: '#10b981' }}>Bought</span>}
                    {msg.unlocked === false && <span style={{ color: '#ef4444' }}>Passed</span>}
                  </div>
                ) : msg.contentType === 'teaser' && msg.role === 'creator' ? (
                  <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#e11d48', color: 'white' }}>Free Teaser</div>
                ) : (
                  <div className="max-w-[85%] md:max-w-[75%] px-3 py-2 rounded-2xl text-xs"
                    style={{
                      background: msg.role === 'creator' ? (report.simulationType === 'sexting' ? '#e11d48' : report.simulationType === 'aftercare' ? '#e84393' : '#ff6b35') : '#ffffff',
                      color: msg.role === 'creator' ? '#ffffff' : '#000000',
                      borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                      borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}>
                    {msg.content}
                  </div>
                )}
              </div>
              )
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      {/* Logout Button */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={handleLogout}
          className="card bg-white shadow-lg p-2 md:p-3 flex items-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="text-sm font-semibold text-red-600 hidden sm:inline">Logout</span>
        </button>
      </div>
      
      <section className="section pt-24 md:pt-40 px-3 md:px-6 relative z-10">
        <div className="container max-w-7xl">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="mb-2 md:mb-4 text-2xl md:text-4xl">Admin Panel</h1>
            <p className="text-base md:text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
              Training & Simulation Dashboard
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8 max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-semibold text-xs md:text-base transition-all flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'assessments'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Assessments</span>
              <span className="sm:hidden">Assess</span>
            </button>
            <button
              onClick={() => { setActiveTab('simulations'); if (simReports.length === 0) fetchSimReports() }}
              className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-semibold text-xs md:text-base transition-all flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'simulations'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Simulations</span>
              <span className="sm:hidden">Sims</span>
              {simReports.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'simulations' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  {simReports.length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('peruser'); if (simReports.length === 0) fetchSimReports() }}
              className={`flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-lg font-semibold text-xs md:text-base transition-all flex items-center justify-center gap-1 md:gap-2 ${
                activeTab === 'peruser'
                  ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Per User</span>
              <span className="sm:hidden">Users</span>
              {users.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'peruser' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'}`}>
                  {users.length}
                </span>
              )}
            </button>
          </div>

          {/* ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (<>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="card bg-blue-50 border-2 border-blue-200 p-3 md:p-5">
              <div className="flex items-center gap-2 md:gap-3">
                <Users className="w-5 h-5 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <div className="text-lg md:text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                  <div className="text-xs md:text-sm text-blue-700">Users</div>
                </div>
              </div>
            </div>
            <div className="card bg-purple-50 border-2 border-purple-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-purple-900">{stats.day2Completed}</div>
                <div className="text-xs md:text-sm text-purple-700">Day 2</div>
              </div>
            </div>
            <div className="card bg-indigo-50 border-2 border-indigo-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-indigo-900">{stats.day3Completed}</div>
                <div className="text-xs md:text-sm text-indigo-700">Day 3</div>
              </div>
            </div>
            <div className="card bg-orange-50 border-2 border-orange-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-orange-900">{stats.day4Completed}</div>
                <div className="text-xs md:text-sm text-orange-700">Day 4</div>
              </div>
            </div>
            <div className="card bg-green-50 border-2 border-green-200 p-3 md:p-5">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-green-900">{stats.day5Completed}</div>
                <div className="text-xs md:text-sm text-green-700">Day 5</div>
              </div>
            </div>
          </div>

          {/* Search and Refresh */}
          <div className="card glass-card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search by Telegram username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  Auto-refresh (5s)
                </label>
              </div>
              <button
                onClick={() => fetchUsers()}
                disabled={isLoading}
                className="btn-primary px-6 py-3 inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="card glass-card text-center py-12">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p style={{ color: 'var(--text-secondary-on-white)' }}>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="card glass-card text-center py-12">
              <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                No users found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="card glass-card"
                >
                  {/* User Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-200">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-xl font-bold mb-1 truncate">{user.telegramUsername}</h3>
                      <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-secondary-on-white)' }}>
                        {user.email}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUser(user.id, user.telegramUsername)}
                      className="mt-3 md:mt-0 px-3 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors inline-flex items-center gap-2 text-sm self-start md:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  {/* Assessments Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {['day2', 'day3', 'day4', 'day5'].map((dayKey) => {
                      const dayNum = dayKey.replace('day', '')
                      const assessments = user.assessments[dayKey as keyof typeof user.assessments]
                      const status = getAssessmentStatus(assessments)
                      const attempts = getTotalAttempts(assessments)
                      const StatusIcon = status.icon
                      const latest = getLatestAttempt(assessments)

                      return (
                        <div key={dayKey} className={`p-4 rounded-lg border-2 ${status.bgColor}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm">Day {dayNum}</span>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </div>
                          <p className={`text-sm font-medium ${status.color} mb-1`}>
                            {status.text}
                          </p>
                          {attempts > 0 && (
                            <>
                              <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                Attempts: {attempts}
                              </p>
                              {latest && (
                                <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                  {Math.round(latest.percentage)}% ({new Date(latest.completed_at).toLocaleDateString()})
                                </p>
                              )}
                              {latest && !latest.passed && (
                                <button
                                  onClick={() => grantRetry(user, Number(dayNum))}
                                  disabled={grantingRetry === `${user.id}-${dayKey}`}
                                  className="mt-2 w-full py-1.5 px-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-semibold rounded-md transition-colors inline-flex items-center justify-center gap-1.5"
                                >
                                  {grantingRetry === `${user.id}-${dayKey}` ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3 h-3" />
                                  )}
                                  Grant Another Try
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* All Attempts & Detailed Answers */}
                  {(['day2', 'day3', 'day4', 'day5'] as const).some(
                    dayKey => user.assessments[dayKey].length > 0
                  ) && (
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedUserAssessment(expandedUserAssessment === `user-${user.id}` ? null : `user-${user.id}`)}
                        className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                      >
                        {expandedUserAssessment === `user-${user.id}` ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        View All Attempts & Answers
                      </button>

                      {expandedUserAssessment === `user-${user.id}` && (
                        <div className="mt-4 space-y-6">
                          {(['day2', 'day3', 'day4', 'day5'] as const).map((dayKey) => {
                            const dayNum = dayKey.replace('day', '')
                            const assessments = user.assessments[dayKey]
                            
                            if (assessments.length === 0) return null

                            return (
                              <div key={dayKey} className="rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                  <h4 className="font-bold text-sm">Day {dayNum} — {assessments.length} attempt{assessments.length !== 1 ? 's' : ''}</h4>
                                </div>
                                <div className="divide-y divide-gray-100">
                                  {assessments.map((attempt, idx) => (
                                    <div key={idx} className="p-3 md:p-4">
                                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                        <div className="flex items-center gap-2 md:gap-3">
                                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {attempt.passed ? 'Passed' : 'Failed'}
                                          </span>
                                          <span className="text-xs md:text-sm font-semibold">
                                            #{attempt.attempt_number}: {attempt.score}/{attempt.total_questions} ({Math.round(attempt.percentage)}%)
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                          <span className="hidden sm:inline">{new Date(attempt.completed_at).toLocaleString()}</span>
                                          <span className="sm:hidden">{new Date(attempt.completed_at).toLocaleDateString()}</span>
                                        </span>
                                      </div>

                                      {attempt.answers && attempt.answers.length > 0 ? (
                                        <div className="space-y-2 md:space-y-3">
                                          {attempt.answers.map((ans: AssessmentAnswer, ansIdx: number) => (
                                            <div
                                              key={ansIdx}
                                              className="rounded-lg p-2.5 md:p-3 text-xs md:text-sm"
                                              style={{
                                                background: ans.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                              }}
                                            >
                                              <div className="flex items-start gap-2 mb-2">
                                                <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                  {ans.isCorrect ? '✓' : '✗'}
                                                </span>
                                                <p className="font-semibold text-gray-900 text-xs md:text-sm">{ans.question}</p>
                                              </div>
                                              <div className="ml-7 space-y-1.5">
                                                <p className="text-xs">
                                                  <span className="font-semibold text-gray-500">Answer: </span>
                                                  <span className={ans.isCorrect ? 'text-green-700' : 'text-red-700'}>{ans.userAnswer || '(no answer)'}</span>
                                                </p>
                                                {!ans.isCorrect && (
                                                  <p className="text-xs">
                                                    <span className="font-semibold text-gray-500">Correct: </span>
                                                    <span className="text-green-700">{ans.correctAnswer}</span>
                                                  </p>
                                                )}
                                                {ans.feedback && (
                                                  <p className="text-xs text-gray-500 italic mt-1">{ans.feedback}</p>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-gray-400 italic">No detailed answer data available for this attempt</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          </>)}

          {/* SIMULATIONS TAB */}
          {activeTab === 'simulations' && (
            <>
              {/* Sim Type Filter */}
              <div className="flex flex-wrap gap-2 mb-6 max-w-4xl mx-auto justify-center">
                {([['all', 'All', null], ['chatting', 'Chatting', MessageCircle], ['sexting', 'Sexting', Flame], ['aftercare', 'Aftercare', Zap], ['combined', 'Full Session', Sparkles], ['sexting-teacher', 'Sexting Teacher', GraduationCap], ['chat-teacher', 'Chat Teacher', GraduationCap], ['aftercare-teacher', 'AC Teacher', GraduationCap]] as const).map(([key, label, Icon]) => {
                  const count = key === 'all' ? simReports.length : simReports.filter(r => r.simulationType === key).length
                  return (
                    <button key={key} onClick={() => setSimTypeFilter(key as typeof simTypeFilter)}
                      className={`py-2 px-3.5 md:px-4 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 whitespace-nowrap ${
                        simTypeFilter === key
                          ? key === 'sexting' ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md' : key === 'aftercare' ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md' : key === 'combined' ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md' : key === 'sexting-teacher' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' : key === 'chat-teacher' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md' : key === 'aftercare-teacher' ? 'bg-gradient-to-r from-fuchsia-500 to-fuchsia-600 text-white shadow-md' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}>
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                      <span>{label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${simTypeFilter === key ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* Sim Stats */}
              {(() => {
                const filtered = simTypeFilter === 'all' ? simReports : simReports.filter(r => r.simulationType === simTypeFilter)
                const chattingCount = simReports.filter(r => r.simulationType === 'chatting').length
                const sextingCount = simReports.filter(r => r.simulationType === 'sexting').length
                const aftercareCount = simReports.filter(r => r.simulationType === 'aftercare').length
                return (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4 mb-6 md:mb-8">
                  <div className="card bg-blue-50 border-2 border-blue-200 p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <MessageCircle className="w-5 h-5 md:w-8 md:h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="text-lg md:text-2xl font-bold text-blue-900">{filtered.length}</div>
                        <div className="text-xs md:text-sm text-blue-700">Sessions</div>
                      </div>
                    </div>
                  </div>
                  <div className="card bg-green-50 border-2 border-green-200 p-3 md:p-5">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-green-900">
                        {filtered.length > 0 ? (filtered.reduce((s, r) => s + calculateWeightedScore(r.categories, r.simulationType), 0) / filtered.length).toFixed(1) : '—'}
                      </div>
                      <div className="text-xs md:text-sm text-green-700">Avg Score</div>
                    </div>
                  </div>
                  <div className="card bg-purple-50 border-2 border-purple-200 p-3 md:p-5">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-purple-900">
                        {new Set(filtered.map(r => r.telegramUsername)).size}
                      </div>
                      <div className="text-xs md:text-sm text-purple-700">Users</div>
                    </div>
                  </div>
                  <div className="card bg-orange-50 border-2 border-orange-200 p-3 md:p-5">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-orange-900">{chattingCount}</div>
                      <div className="text-xs md:text-sm text-orange-700">Chatting</div>
                    </div>
                  </div>
                  <div className="card bg-rose-50 border-2 border-rose-200 p-3 md:p-5">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-rose-900">{sextingCount}</div>
                      <div className="text-xs md:text-sm text-rose-700">Sexting</div>
                    </div>
                  </div>
                  <div className="card bg-pink-50 border-2 border-pink-200 p-3 md:p-5">
                    <div className="text-center">
                      <div className="text-lg md:text-2xl font-bold text-pink-900">{aftercareCount}</div>
                      <div className="text-xs md:text-sm text-pink-700">Aftercare</div>
                    </div>
                  </div>
                </div>
                )
              })()}

              {/* Search and Refresh */}
              <div className="card glass-card mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by Telegram username or email..."
                    value={simSearch}
                    onChange={(e) => setSimSearch(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => fetchSimReports()}
                    disabled={simLoading}
                    className="btn-primary px-6 py-3 inline-flex items-center gap-2"
                  >
                    <RefreshCw className={`w-5 h-5 ${simLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Reports List */}
              {simLoading ? (
                <div className="card glass-card text-center py-12">
                  <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Loading simulation reports...</p>
                </div>
              ) : simReports
                .filter(r => simTypeFilter === 'all' || r.simulationType === simTypeFilter)
                .filter(r =>
                  r.telegramUsername.toLowerCase().includes(simSearch.toLowerCase()) ||
                  r.email.toLowerCase().includes(simSearch.toLowerCase())
                ).length === 0 ? (
                <div className="card glass-card text-center py-12">
                  <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                    No {simTypeFilter !== 'all' ? simTypeFilter + ' ' : ''}simulation reports found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {simReports
                    .filter(r => simTypeFilter === 'all' || r.simulationType === simTypeFilter)
                    .filter(r =>
                      r.telegramUsername.toLowerCase().includes(simSearch.toLowerCase()) ||
                      r.email.toLowerCase().includes(simSearch.toLowerCase())
                    )
                    .map((report, index) => {
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
                                <h3 className="text-base md:text-lg font-bold truncate">{report.telegramUsername}</h3>
                                <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-secondary-on-white)' }}>{report.email}</p>
                                <div className="flex flex-wrap items-center gap-1 md:gap-1.5 mt-1">
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${report.simulationType === 'combined' ? 'bg-violet-100 text-violet-700' : report.simulationType === 'sexting-teacher' ? 'bg-purple-100 text-purple-700' : report.simulationType === 'chat-teacher' ? 'bg-indigo-100 text-indigo-700' : report.simulationType === 'aftercare-teacher' ? 'bg-violet-100 text-violet-700' : report.simulationType === 'sexting' ? 'bg-rose-100 text-rose-700' : report.simulationType === 'aftercare' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {report.simulationType === 'combined' ? 'Full' : report.simulationType === 'sexting-teacher' ? 'Sext T' : report.simulationType === 'chat-teacher' ? 'Chat T' : report.simulationType === 'aftercare-teacher' ? 'AC T' : report.simulationType === 'sexting' ? 'Sext' : report.simulationType === 'aftercare' ? 'After' : 'Chat'}
                                  </span>
                                  <span className="text-xs text-gray-500">{report.durationMode}</span>
                                  <span className="text-xs text-gray-500">{report.messageCount}msg</span>
                                  <span className="text-xs inline-flex items-center gap-0.5 text-blue-700">
                                    <Keyboard className="w-3 h-3" />{report.typedCount}
                                  </span>
                                  {report.pasteCount > 0 ? (
                                    <span className="text-xs inline-flex items-center gap-0.5 text-red-700 font-semibold">
                                      <ClipboardPaste className="w-3 h-3" />{report.pasteCount}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-green-700 hidden sm:inline">all typed</span>
                                  )}
                                  {report.wpm > 0 && (
                                    <span className="text-xs inline-flex items-center gap-0.5 text-violet-700 font-semibold hidden sm:inline-flex">
                                      <Zap className="w-3 h-3" />{report.wpm}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted-on-white)' }}>
                                  <span className="hidden sm:inline">{new Date(report.completedAt).toLocaleString()}</span>
                                  <span className="sm:hidden">{new Date(report.completedAt).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-0">
                              <div className="text-right hidden md:block">
                                <div className="text-2xl font-black" style={{ color: getScoreColor(weightedScore) }}>
                                  {weightedScore}/100
                                </div>
                                <div className="text-xs font-semibold" style={{ color: getScoreColor(weightedScore) }}>
                                  {getScoreLabel(weightedScore)}
                                </div>
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
                              <button
                                onClick={(e) => { e.stopPropagation(); exportSimReportAsPdf(report) }}
                                disabled={exportingReportId === report.id}
                                className="p-2 rounded-lg hover:bg-blue-50 transition-colors group flex-shrink-0"
                                title="Export as PDF"
                              >
                                {exportingReportId === report.id ? (
                                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                )}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteSimReport(report.id) }}
                                className="p-2 rounded-lg hover:bg-red-50 transition-colors group flex-shrink-0"
                                title="Delete report"
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                              </button>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              ) : (
                                <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              )}
                            </div>
                          </div>

                          {/* Expanded Report Content — mirrors /chattingsimulation results exactly */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-gray-200" ref={(el) => { reportContentRefs.current[report.id] = el }}>
                              {/* Overall Weighted Score Circle */}
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
                                <p className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
                                <div className="inline-flex flex-wrap gap-1 md:gap-2 justify-center text-xs font-medium">
                                  <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full" style={{ background: '#10b98115', color: '#10b981' }}>85+ Elite</span>
                                  <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>70-84</span>
                                  <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full" style={{ background: '#f9731615', color: '#f97316' }}>55-69</span>
                                  <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full" style={{ background: '#ef444415', color: '#ef4444' }}>40-54</span>
                                  <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full" style={{ background: '#dc262615', color: '#dc2626' }}>&lt;40</span>
                                </div>
                              </div>

                              {/* Copy/Paste Detection Banner */}
                              {(report.typedCount > 0 || report.pasteCount > 0) && (
                                <div className="mb-6 md:mb-8">
                                  <div className="rounded-2xl p-3 md:p-4 flex flex-wrap items-center gap-3 md:gap-6" style={{ background: report.pasteCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${report.pasteCount > 0 ? '#fecaca' : '#bbf7d0'}` }}>
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
                                    {report.pasteCount > 0 && (
                                      <div className="flex items-center gap-1.5 ml-auto px-2 md:px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {Math.round((report.pasteCount / (report.typedCount + report.pasteCount)) * 100)}% copy-pasted
                                      </div>
                                    )}
                                    {report.pasteCount === 0 && (
                                      <div className="flex items-center gap-1.5 ml-auto px-2 md:px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        100% typed
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Weighted Score Table */}
                              <div className="rounded-2xl overflow-x-auto mb-6 md:mb-10" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

                              {/* Category Scores Overview — weighted grid */}
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
                                      border: `2px solid ${expandedSimCategories.has(`${report.id}-${catIdx}`) ? getCategoryScoreColor(cat.score) : '#e5e7eb'}`,
                                      boxShadow: expandedSimCategories.has(`${report.id}-${catIdx}`) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : '0 1px 3px rgba(0,0,0,0.06)',
                                    }}
                                    onClick={(e) => { e.stopPropagation(); toggleSimCategory(report.id, catIdx) }}
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

                              {/* Detailed Category Breakdowns — accordion like user sees */}
                              <div className="space-y-3 md:space-y-4 mb-6 md:mb-10">
                                <h3 className="text-lg md:text-xl font-bold">Detailed Breakdown</h3>
                                {report.categories.map((cat, catIdx) => {
                                  const catKey = `${report.id}-${catIdx}`
                                  const isCatExpanded = expandedSimCategories.has(catKey)
                                  const catWeight = reportWeights[cat.name] || 0
                                  const catEarned = Math.round(((cat.score / 10) * catWeight) * 10) / 10

                                  return (
                                    <div
                                      key={catIdx}
                                      className="rounded-xl md:rounded-2xl overflow-hidden"
                                      style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleSimCategory(report.id, catIdx) }}
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
                                          <div><p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{cat.feedback}</p></div>

                                          {cat.examples.good.length > 0 && (
                                            <div>
                                              <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>What was done well:</p>
                                              <div className="space-y-2">
                                                {cat.examples.good.map((ex, i) => (
                                                  <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
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
                                                  <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#9a3412', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                                    &ldquo;{ex}&rdquo;
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)' }}>
                                            <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#ea580c' }}><Sparkles className="w-4 h-4" />Practice Advice</p>
                                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#64748b' }}>{cat.advice}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>

                              {/* Overall Assessment — structured bullet points */}
                              <div className="rounded-xl md:rounded-2xl p-4 md:p-8 mb-6 md:mb-8 space-y-4 md:space-y-6" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                <h3 className="text-lg md:text-xl font-bold">Overall Assessment</h3>

                                {typeof report.overallFeedback === 'object' && report.overallFeedback !== null ? (
                                  <>
                                    {(report.overallFeedback as OverallFeedback).summary && (
                                      <p className="text-[15px] leading-relaxed" style={{ color: '#64748b' }}>
                                        {(report.overallFeedback as OverallFeedback).summary}
                                      </p>
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

                              {/* Creator Notes */}
                              {report.notes && report.notes.trim() && (
                                <div className="rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8" style={{ background: '#fffef0', border: '1px solid #e8e4c9' }}>
                                  <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#4a4520' }}>
                                    <StickyNote className="w-5 h-5" />
                                    Creator Notes
                                  </h3>
                                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{report.notes}</p>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                                <button
                                  onClick={(e) => { e.stopPropagation(); exportSimReportAsPdf(report) }}
                                  disabled={exportingReportId === report.id}
                                  className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base text-white transition-all duration-200 hover:scale-[1.02]"
                                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                                >
                                  {exportingReportId === report.id ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Download className="w-4 h-4 md:w-5 md:h-5" />}
                                  {exportingReportId === report.id ? 'Generating...' : 'Export PDF'}
                                </button>
                                {report.hasRecording && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openReplay(report) }}
                                    className="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base text-white transition-all duration-200 hover:scale-[1.02]"
                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}
                                  >
                                    <Video className="w-4 h-4 md:w-5 md:h-5" />
                                    Session Replay
                                  </button>
                                )}
                              </div>

                              {/* Full Conversation */}
                              <div className="rounded-xl md:rounded-2xl p-3 md:p-6 mb-4" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                                <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">Full Conversation</h3>
                                <div className={`space-y-2 pr-1 md:pr-2 ${exportingReportId === report.id ? '' : 'max-h-96 overflow-y-auto'}`}>
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
            </>
          )}

          {/* PER USER TAB */}
          {activeTab === 'peruser' && (
            <>
              {/* Per User Stats */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-8">
                <div className="card bg-violet-50 border-2 border-violet-200 p-3 md:p-5">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Users className="w-5 h-5 md:w-8 md:h-8 text-violet-600 flex-shrink-0" />
                    <div>
                      <div className="text-lg md:text-2xl font-bold text-violet-900">{users.length}</div>
                      <div className="text-xs md:text-sm text-violet-700">Users</div>
                    </div>
                  </div>
                </div>
                <div className="card bg-blue-50 border-2 border-blue-200 p-3 md:p-5">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-blue-900">{simReports.length}</div>
                    <div className="text-xs md:text-sm text-blue-700">Total Sims</div>
                  </div>
                </div>
                <div className="card bg-orange-50 border-2 border-orange-200 p-3 md:p-5">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-orange-900">{simReports.filter(r => r.simulationType === 'chatting').length}</div>
                    <div className="text-xs md:text-sm text-orange-700">Chatting</div>
                  </div>
                </div>
                <div className="card bg-rose-50 border-2 border-rose-200 p-3 md:p-5">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-rose-900">{simReports.filter(r => r.simulationType === 'sexting').length}</div>
                    <div className="text-xs md:text-sm text-rose-700">Sexting</div>
                  </div>
                </div>
                <div className="card bg-pink-50 border-2 border-pink-200 p-3 md:p-5">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-pink-900">{simReports.filter(r => r.simulationType === 'aftercare').length}</div>
                    <div className="text-xs md:text-sm text-pink-700">Aftercare</div>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="card glass-card mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Search by Telegram username or email..."
                    value={perUserSearch}
                    onChange={(e) => setPerUserSearch(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => { fetchUsers(); fetchSimReports() }}
                    disabled={isLoading || simLoading}
                    className="px-6 py-3 inline-flex items-center gap-2 rounded-lg font-semibold text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading || simLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* User List */}
              {isLoading ? (
                <div className="card glass-card text-center py-12">
                  <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p style={{ color: 'var(--text-secondary-on-white)' }}>Loading users...</p>
                </div>
              ) : (() => {
                const allUsernames = new Set(users.map(u => u.telegramUsername))
                simReports.forEach(r => allUsernames.add(r.telegramUsername))

                interface MergedUser {
                  id: number
                  telegramUsername: string
                  email: string
                  createdAt: string | null
                  assessments: User['assessments'] | null
                  simulations: SimReport[]
                }

                const merged: MergedUser[] = Array.from(allUsernames).map(username => {
                  const user = users.find(u => u.telegramUsername === username)
                  const userSims = getUserSimReports(username)
                  return {
                    id: user?.id ?? -Math.random(),
                    telegramUsername: username,
                    email: user?.email ?? userSims[0]?.email ?? '',
                    createdAt: user?.createdAt ?? null,
                    assessments: user?.assessments ?? null,
                    simulations: userSims,
                  }
                })

                const filteredMerged = merged.filter(u =>
                  u.telegramUsername.toLowerCase().includes(perUserSearch.toLowerCase()) ||
                  u.email.toLowerCase().includes(perUserSearch.toLowerCase())
                ).sort((a, b) => {
                  const aLast = a.simulations.length > 0 ? new Date(a.simulations[0].completedAt).getTime() : a.createdAt ? new Date(a.createdAt).getTime() : 0
                  const bLast = b.simulations.length > 0 ? new Date(b.simulations[0].completedAt).getTime() : b.createdAt ? new Date(b.createdAt).getTime() : 0
                  return bLast - aLast
                })

                if (filteredMerged.length === 0) {
                  return (
                    <div className="card glass-card text-center py-12">
                      <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>No users found</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {filteredMerged.map((mu, index) => {
                      const isOpen = expandedPerUser === index
                      const chattingSims = mu.simulations.filter(s => s.simulationType === 'chatting')
                      const sextingSims = mu.simulations.filter(s => s.simulationType === 'sexting')
                      const aftercareSims = mu.simulations.filter(s => s.simulationType === 'aftercare')
                      const combinedSims = mu.simulations.filter(s => s.simulationType === 'combined')
                      const avgScore = mu.simulations.length > 0
                        ? Math.round(mu.simulations.reduce((s, r) => s + calculateWeightedScore(r.categories, r.simulationType), 0) / mu.simulations.length * 10) / 10
                        : null

                      const assessmentDays = mu.assessments
                        ? (['day2', 'day3', 'day4', 'day5'] as const).filter(d => mu.assessments![d].length > 0).length
                        : 0

                      const userAnalysis = generateUserAnalysis(mu.simulations)
                      const { chatting: top3Chatting, sexting: top3Sexting, aftercare: top3Aftercare, top3Ids } = getTop3PerType(mu.simulations)
                      const otherSims = mu.simulations.filter(s => !top3Ids.has(s.id))

                      return (
                        <motion.div
                          key={mu.telegramUsername}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="card glass-card"
                        >
                          {/* User Header Row */}
                          <div
                            className="flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer"
                            onClick={() => setExpandedPerUser(isOpen ? null : index)}
                          >
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-black text-sm md:text-lg flex-shrink-0"
                                style={{ background: avgScore !== null ? `${getScoreColor(avgScore)}15` : '#f3f4f615', color: avgScore !== null ? getScoreColor(avgScore) : '#9ca3af' }}>
                                {avgScore !== null ? avgScore : '—'}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base md:text-lg font-bold truncate">{mu.telegramUsername}</h3>
                                <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-secondary-on-white)' }}>{mu.email}</p>
                                <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                                  {mu.createdAt && (
                                    <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                      {new Date(mu.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                  {assessmentDays > 0 && (
                                    <span className="text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                      {assessmentDays}/4 Assess
                                    </span>
                                  )}
                                  {chattingSims.length > 0 && (
                                    <span className="text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                      {chattingSims.length} Chat
                                    </span>
                                  )}
                                  {sextingSims.length > 0 && (
                                    <span className="text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                                      {sextingSims.length} Sext
                                    </span>
                                  )}
                                  {aftercareSims.length > 0 && (
                                    <span className="text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                                      {aftercareSims.length} After
                                    </span>
                                  )}
                                  {combinedSims.length > 0 && (
                                    <span className="text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                                      {combinedSims.length} Full
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 md:mt-0">
                              {avgScore !== null && (
                                <div className="text-right hidden md:block">
                                  <div className="text-2xl font-black" style={{ color: getScoreColor(avgScore) }}>
                                    {avgScore}/100
                                  </div>
                                  <div className="text-xs font-semibold" style={{ color: getScoreColor(avgScore) }}>
                                    Avg Score
                                  </div>
                                </div>
                              )}
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              ) : (
                                <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              )}
                            </div>
                          </div>

                          {/* Expanded User Content */}
                          {isOpen && (
                            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-8">

                              {/* 1. User Analysis */}
                              {userAnalysis && (
                                <div style={{ order: 1 }}>
                                  <div className="rounded-xl md:rounded-2xl p-3.5 md:p-8" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', border: '2px solid #e2e8f0' }}>
                                    <h4 className="text-base md:text-xl font-bold mb-4 md:mb-5 flex items-center gap-2">
                                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-violet-500" />
                                      Performance Analysis
                                    </h4>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                      <div className="rounded-xl p-4 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                                        <div className="text-2xl font-black" style={{ color: getScoreColor(userAnalysis.overallAvg) }}>{userAnalysis.overallAvg}</div>
                                        <div className="text-xs text-gray-500 mt-1">Avg Score</div>
                                        <div className="text-xs font-bold mt-0.5" style={{ color: getScoreColor(userAnalysis.overallAvg) }}>{getScoreLabel(userAnalysis.overallAvg)}</div>
                                      </div>
                                      <div className="rounded-xl p-4 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
                                        <div className="text-2xl font-black text-blue-700">{userAnalysis.totalSims}</div>
                                        <div className="text-xs text-gray-500 mt-1">Total Sims</div>
                                      </div>
                                      {userAnalysis.bestSim && (
                                        <div className="rounded-xl p-4 text-center bg-white" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                          <div className="text-2xl font-black text-green-600">{userAnalysis.bestSim.score}</div>
                                          <div className="text-xs text-gray-500 mt-1">Best Score</div>
                                          <div className="text-xs text-gray-400 mt-0.5">{new Date(userAnalysis.bestSim.date).toLocaleDateString()}</div>
                                        </div>
                                      )}
                                      {userAnalysis.worstSim && (
                                        <div className="rounded-xl p-4 text-center bg-white" style={{ border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                          <div className="text-2xl font-black text-red-600">{userAnalysis.worstSim.score}</div>
                                          <div className="text-xs text-gray-500 mt-1">Worst Score</div>
                                          <div className="text-xs text-gray-400 mt-0.5">{new Date(userAnalysis.worstSim.date).toLocaleDateString()}</div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Per-Type Breakdown */}
                                    {userAnalysis.simTypeBreakdowns.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">Score by Category</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                          {userAnalysis.simTypeBreakdowns.map(tb => (
                                            <div key={tb.type} className="rounded-xl p-3 md:p-4 bg-white flex items-center gap-3 md:gap-4" style={{ border: '1px solid #e5e7eb' }}>
                                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-xs md:text-sm flex-shrink-0"
                                                style={{ background: `${getScoreColor(tb.avgScore)}12`, color: getScoreColor(tb.avgScore) }}>
                                                {tb.avgScore}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs md:text-sm font-bold truncate">{tb.label}</p>
                                                <p className="text-xs text-gray-500">{tb.simCount}x &middot; {tb.bestScore}↑ {tb.worstScore}↓</p>
                                                <div className="w-full rounded-full h-1.5 mt-1.5" style={{ background: '#e5e7eb' }}>
                                                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${tb.avgScore}%`, background: getScoreColor(tb.avgScore) }} />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Strengths with evidence */}
                                    {userAnalysis.topStrengths.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                                          <span className="w-2 h-2 rounded-full bg-green-500" /> Top Strengths
                                        </h5>
                                        <div className="space-y-2.5">
                                          {userAnalysis.topStrengths.map((s, i) => (
                                            <div key={i} className="rounded-xl p-3 md:p-4 bg-white" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                              <div className="flex items-start gap-2.5 md:gap-3 mb-2">
                                                <span className="text-lg font-black flex-shrink-0" style={{ color: getCategoryScoreColor(s.avgScore) }}>{s.avgScore}</span>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-bold truncate">{s.category}</p>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0">#{i + 1}</span>
                                                  </div>
                                                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                                    <span className="text-xs text-gray-500">{s.simTypeLabel}</span>
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{
                                                      background: s.trend === 'improving' ? '#dcfce7' : s.trend === 'declining' ? '#fee2e2' : '#f3f4f6',
                                                      color: s.trend === 'improving' ? '#16a34a' : s.trend === 'declining' ? '#dc2626' : '#6b7280',
                                                    }}>{s.trend === 'improving' ? '↑' : s.trend === 'declining' ? '↓' : s.trend === 'stable' ? '→' : '●'}</span>
                                                    <span className="text-xs text-gray-400">{s.bestScore}/10 best &middot; {s.count}x</span>
                                                  </div>
                                                </div>
                                              </div>
                                              {s.goodExamples.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                  {s.goodExamples.map((ex, j) => (
                                                    <div key={j} className="text-xs px-3 py-1.5 rounded-lg leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', color: '#065f46' }}>
                                                      &ldquo;{ex}&rdquo;
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {userAnalysis.topOverallStrengths.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#059669' }}>
                                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> What They Do Well
                                        </h5>
                                        <div className="space-y-1.5">
                                          {userAnalysis.topOverallStrengths.map((s, i) => (
                                            <div key={i} className="flex gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
                                              <span className="text-green-500 font-bold flex-shrink-0">+</span>
                                              <span>{s}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Weaknesses with evidence and advice */}
                                    {userAnalysis.weaknesses.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
                                          <span className="w-2 h-2 rounded-full bg-red-500" /> Weaknesses &amp; What to Fix
                                        </h5>
                                        <div className="space-y-2.5">
                                          {userAnalysis.weaknesses.map((w, i) => (
                                            <div key={i} className="rounded-xl p-3 md:p-4 bg-white" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                              <div className="flex items-start gap-2.5 md:gap-3 mb-2">
                                                <span className="text-lg font-black flex-shrink-0" style={{ color: getCategoryScoreColor(w.avgScore) }}>{w.avgScore}</span>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-bold truncate">{w.category}</p>
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex-shrink-0">{w.avgScore}/10</span>
                                                  </div>
                                                  <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                                                    <span className="text-xs text-gray-500">{w.simTypeLabel}</span>
                                                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{
                                                      background: w.trend === 'improving' ? '#dcfce7' : w.trend === 'declining' ? '#fee2e2' : '#f3f4f6',
                                                      color: w.trend === 'improving' ? '#16a34a' : w.trend === 'declining' ? '#dc2626' : '#6b7280',
                                                    }}>{w.trend === 'improving' ? '↑' : w.trend === 'declining' ? '↓' : w.trend === 'stable' ? '→' : '●'}</span>
                                                    <span className="text-xs text-gray-400">{w.bestScore}↑ {w.worstScore}↓</span>
                                                  </div>
                                                </div>
                                              </div>
                                              {w.badExamples.length > 0 && (
                                                <div className="mt-2 space-y-1">
                                                  <p className="text-xs font-semibold text-red-600 mb-1">Needs work:</p>
                                                  {w.badExamples.map((ex, j) => (
                                                    <div key={j} className="text-xs px-3 py-1.5 rounded-lg leading-relaxed" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#991b1b' }}>
                                                      &ldquo;{ex}&rdquo;
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              {w.topAdvice && (
                                                <div className="mt-2 px-3 py-2 rounded-lg text-xs leading-relaxed" style={{ background: 'rgba(249, 115, 22, 0.06)', border: '1px solid rgba(249, 115, 22, 0.15)', color: '#7c2d12' }}>
                                                  <span className="font-bold" style={{ color: '#ea580c' }}>Advice: </span>{w.topAdvice}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {userAnalysis.topOverallWeaknesses.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#dc2626' }}>
                                          <span className="w-2 h-2 rounded-full bg-red-500" /> Recurring Issues
                                        </h5>
                                        <div className="space-y-1.5">
                                          {userAnalysis.topOverallWeaknesses.map((w, i) => (
                                            <div key={i} className="flex gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(239, 68, 68, 0.15)', color: '#991b1b' }}>
                                              <span className="text-red-500 font-bold flex-shrink-0">-</span>
                                              <span>{w}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {userAnalysis.topMissedOpportunities.length > 0 && (
                                      <div className="mb-6">
                                        <h5 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Missed Opportunities
                                        </h5>
                                        <div className="space-y-1.5">
                                          {userAnalysis.topMissedOpportunities.map((m, i) => (
                                            <div key={i} className="flex gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(245, 158, 11, 0.2)', color: '#92400e' }}>
                                              <span className="text-amber-500 font-bold flex-shrink-0">!</span>
                                              <span>{m}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {userAnalysis.topPracticeScenarios.length > 0 && (
                                      <div>
                                        <h5 className="text-xs md:text-sm font-bold uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2" style={{ color: '#7c3aed' }}>
                                          <Sparkles className="w-3.5 h-3.5" /> Practice Recommendations
                                        </h5>
                                        <div className="space-y-1.5">
                                          {userAnalysis.topPracticeScenarios.map((p, i) => (
                                            <div key={i} className="flex gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-xs leading-relaxed bg-white" style={{ border: '1px solid rgba(124, 58, 237, 0.15)', color: '#4c1d95' }}>
                                              <span className="font-bold flex-shrink-0" style={{ color: '#7c3aed' }}>{i + 1}.</span>
                                              <span>{p}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* 2. Top 3 Best Simulations Per Category */}
                              {mu.simulations.length > 0 && (
                                <div style={{ order: 2 }}>
                                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Top 3 Best Scores Per Category
                                  </h4>
                                  <div className="space-y-5">
                                    {([
                                      { label: 'Relationship Building (Chatting)', sims: top3Chatting, color: '#f97316', bg: 'rgba(249, 115, 22, 0.06)' },
                                      { label: 'Sexting', sims: top3Sexting, color: '#e11d48', bg: 'rgba(225, 29, 72, 0.06)' },
                                      { label: 'Aftercare', sims: top3Aftercare, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.06)' },
                                    ] as const).filter(g => g.sims.length > 0).map(group => (
                                      <div key={group.label}>
                                        <h5 className="text-sm font-bold mb-2.5" style={{ color: group.color }}>{group.label}</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                          {group.sims.map((sim, i) => {
                                            const ws = calculateWeightedScore(sim.categories, sim.simulationType)
                                            const isSelected = expandedPerUserReport === sim.id
                                            return (
                                              <div key={sim.id}
                                                className="rounded-xl p-3 md:p-4 flex items-center gap-2.5 md:gap-3 cursor-pointer transition-all duration-200 active:scale-[0.98] md:hover:scale-[1.02]"
                                                style={{
                                                  background: group.bg,
                                                  border: `1px solid ${isSelected ? group.color : group.color + '20'}`,
                                                  boxShadow: isSelected ? `0 4px 12px ${group.color}20` : 'none',
                                                }}
                                                onClick={() => setExpandedPerUserReport(isSelected ? null : sim.id)}
                                              >
                                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center font-black text-xs md:text-sm flex-shrink-0" style={{ background: `${getScoreColor(ws)}15`, color: getScoreColor(ws) }}>
                                                  {ws}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-1.5 md:gap-2">
                                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${group.color}15`, color: group.color }}>#{i + 1}</span>
                                                    <span className="text-xs font-semibold truncate" style={{ color: getScoreColor(ws) }}>{getScoreLabel(ws)}</span>
                                                  </div>
                                                  <p className="text-xs text-gray-500 mt-0.5 truncate">{new Date(sim.completedAt).toLocaleDateString()}</p>
                                                </div>
                                                {isSelected ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: group.color }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: group.color }} />}
                                              </div>
                                            )
                                          })}
                                        </div>
                                        {group.sims.some(s => expandedPerUserReport === s.id) && (() => {
                                          const sim = group.sims.find(s => expandedPerUserReport === s.id)!
                                          return (
                                            <div className="mt-3 rounded-xl md:rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                              {renderExpandedReport(sim)}
                                            </div>
                                          )
                                        })()}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 4. Training Results (Assessments) */}
                              {mu.assessments && (
                                <div style={{ order: 4 }}>
                                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                    Training Results
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                    {(['day2', 'day3', 'day4', 'day5'] as const).map((dayKey) => {
                                      const dayNum = dayKey.replace('day', '')
                                      const assessments = mu.assessments![dayKey]
                                      const status = getAssessmentStatus(assessments)
                                      const attempts = getTotalAttempts(assessments)
                                      const StatusIcon = status.icon
                                      const latest = getLatestAttempt(assessments)

                                      return (
                                        <div key={dayKey} className={`p-4 rounded-lg border-2 ${status.bgColor}`}>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm">Day {dayNum}</span>
                                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                                          </div>
                                          <p className={`text-sm font-medium ${status.color} mb-1`}>{status.text}</p>
                                          {attempts > 0 && (
                                            <>
                                              <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>Attempts: {attempts}</p>
                                              {latest && (
                                                <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                                  {Math.round(latest.percentage)}% ({new Date(latest.completed_at).toLocaleDateString()})
                                                </p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>

                                  {/* Detailed Attempts */}
                                  {(['day2', 'day3', 'day4', 'day5'] as const).some(d => mu.assessments![d].length > 0) && (
                                    <div className="space-y-4">
                                      {(['day2', 'day3', 'day4', 'day5'] as const).map((dayKey) => {
                                        const dayNum = dayKey.replace('day', '')
                                        const assessments = mu.assessments![dayKey]
                                        if (assessments.length === 0) return null

                                        return (
                                          <div key={dayKey} className="rounded-xl border border-gray-200 overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                              <h5 className="font-bold text-sm">Day {dayNum} — {assessments.length} attempt{assessments.length !== 1 ? 's' : ''}</h5>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                              {assessments.map((attempt, idx) => (
                                                <div key={idx} className="p-3 md:p-4">
                                                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {attempt.passed ? 'Passed' : 'Failed'}
                                                      </span>
                                                      <span className="text-xs md:text-sm font-semibold">
                                                        #{attempt.attempt_number}: {attempt.score}/{attempt.total_questions} ({Math.round(attempt.percentage)}%)
                                                      </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                      <span className="hidden sm:inline">{new Date(attempt.completed_at).toLocaleString()}</span>
                                                      <span className="sm:hidden">{new Date(attempt.completed_at).toLocaleDateString()}</span>
                                                    </span>
                                                  </div>
                                                  {attempt.answers && attempt.answers.length > 0 && (
                                                    <div className="space-y-2">
                                                      {attempt.answers.map((ans: AssessmentAnswer, ansIdx: number) => (
                                                        <div key={ansIdx} className="rounded-lg p-3 text-sm"
                                                          style={{
                                                            background: ans.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                            border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                                          }}>
                                                          <div className="flex items-start gap-2 mb-2">
                                                            <span className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                                              {ans.isCorrect ? '✓' : '✗'}
                                                            </span>
                                                            <p className="font-semibold text-gray-900">{ans.question}</p>
                                                          </div>
                                                          <div className="ml-7 space-y-1.5">
                                                            <p className="text-xs">
                                                              <span className="font-semibold text-gray-500">Their answer: </span>
                                                              <span className={ans.isCorrect ? 'text-green-700' : 'text-red-700'}>{ans.userAnswer || '(no answer)'}</span>
                                                            </p>
                                                            {!ans.isCorrect && (
                                                              <p className="text-xs">
                                                                <span className="font-semibold text-gray-500">Correct: </span>
                                                                <span className="text-green-700">{ans.correctAnswer}</span>
                                                              </p>
                                                            )}
                                                          </div>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 3. Other Simulations */}
                              {otherSims.length > 0 ? (
                                <div style={{ order: 3 }}>
                                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5 text-blue-600" />
                                    Latest Simulations ({otherSims.length})
                                  </h4>
                                  <div className="space-y-3">
                                    {otherSims.map((report) => {
                                      const isReportOpen = expandedPerUserReport === report.id
                                      const weightedScore = calculateWeightedScore(report.categories, report.simulationType)
                                      const reportWeights = getWeightsForReport(report)

                                      return (
                                        <div key={report.id} className="rounded-xl md:rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                          {/* Report Row */}
                                          <div
                                            className="px-3 md:px-5 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setExpandedPerUserReport(isReportOpen ? null : report.id)}
                                          >
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                              <div
                                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-sm md:text-base flex-shrink-0"
                                                style={{ background: `${getScoreColor(weightedScore)}15`, color: getScoreColor(weightedScore) }}
                                              >
                                                {weightedScore}
                                              </div>
                                              <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1 md:gap-1.5">
                                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${report.simulationType === 'combined' ? 'bg-violet-100 text-violet-700' : report.simulationType === 'sexting-teacher' ? 'bg-purple-100 text-purple-700' : report.simulationType === 'chat-teacher' ? 'bg-indigo-100 text-indigo-700' : report.simulationType === 'sexting' ? 'bg-rose-100 text-rose-700' : report.simulationType === 'aftercare' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {report.simulationType === 'combined' ? 'Full' : report.simulationType === 'sexting-teacher' ? 'Sext T' : report.simulationType === 'chat-teacher' ? 'Chat T' : report.simulationType === 'aftercare-teacher' ? 'AC T' : report.simulationType === 'sexting' ? 'Sext' : report.simulationType === 'aftercare' ? 'After' : 'Chat'}
                                                  </span>
                                                  <span className="text-xs text-gray-500">{report.messageCount}msg</span>
                                                  <span className="text-xs inline-flex items-center gap-0.5 text-blue-700">
                                                    <Keyboard className="w-3 h-3" />{report.typedCount}
                                                  </span>
                                                  {report.pasteCount > 0 && (
                                                    <span className="text-xs inline-flex items-center gap-0.5 text-red-700 font-semibold">
                                                      <ClipboardPaste className="w-3 h-3" />{report.pasteCount}
                                                    </span>
                                                  )}
                                                  {report.wpm > 0 && (
                                                    <span className="text-xs inline-flex items-center gap-0.5 text-violet-700 font-semibold hidden sm:inline-flex">
                                                      <Zap className="w-3 h-3" />{report.wpm}
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted-on-white)' }}>
                                                  <span className="hidden sm:inline">{new Date(report.completedAt).toLocaleString()}</span>
                                                  <span className="sm:hidden">{new Date(report.completedAt).toLocaleDateString()}</span>
                                                </p>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 md:gap-3 mt-2 md:mt-0 ml-auto">
                                              <div className="text-right hidden md:block">
                                                <div className="text-xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}/100</div>
                                                <div className="text-xs font-semibold" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</div>
                                              </div>
                                              {report.hasRecording && (
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); openReplay(report) }}
                                                  className="p-1.5 md:p-2 rounded-lg hover:bg-purple-50 transition-colors group flex-shrink-0"
                                                  title="Watch session replay"
                                                >
                                                  <Video className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                                                </button>
                                              )}
                                              <button
                                                onClick={(e) => { e.stopPropagation(); exportSimReportAsPdf(report) }}
                                                disabled={exportingReportId === report.id}
                                                className="p-1.5 md:p-2 rounded-lg hover:bg-blue-50 transition-colors group flex-shrink-0"
                                                title="Export as PDF"
                                              >
                                                {exportingReportId === report.id ? (
                                                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                ) : (
                                                  <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                )}
                                              </button>
                                              <button
                                                onClick={(e) => { e.stopPropagation(); deleteSimReport(report.id) }}
                                                className="p-1.5 md:p-2 rounded-lg hover:bg-red-50 transition-colors group flex-shrink-0 hidden sm:block"
                                                title="Delete report"
                                              >
                                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                                              </button>
                                              {isReportOpen ? (
                                                <ChevronUp className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                                              ) : (
                                                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                                              )}
                                            </div>
                                          </div>

                                          {isReportOpen && renderExpandedReport(report)}
                                                  </div>
                                      )
                                    })}
                                              </div>
                                                      </div>
                              ) : (
                                <div className="rounded-xl p-6 text-center" style={{ order: 3, background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                                  <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm" style={{ color: 'var(--text-muted-on-white)' }}>No simulations completed yet</p>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })()}
            </>
          )}
        </div>
      </section>

      {/* Session Replay Modal */}
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
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [replayMessages])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
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
  // Only re-run when speed changes while playing
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

    if (wasPlaying) {
      setTimeout(() => startPlayback(), 50)
    }
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
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b">
          <div className="min-w-0">
            <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
              <Video className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0" />
              Session Replay
            </h3>
            <p className="text-xs md:text-sm text-gray-500 truncate">{report.telegramUsername} — {report.simulationType}</p>
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
          <div className="flex-1 flex items-center justify-center p-12 text-gray-400">
            No recording data available
          </div>
        ) : (
          <>
            {/* Chat replay area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2" style={{ background: '#f1f5f9', minHeight: '200px', maxHeight: '50vh' }}>
              {replayMessages.map((msg, i) => (
                msg.role === 'system' ? (
                  <div key={i} className="text-center">
                    <span className="text-xs italic px-2 md:px-3 py-1 rounded-full bg-gray-200 text-gray-600">{msg.content}</span>
                  </div>
                ) : (
                  <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2 text-xs md:text-sm"
                      style={{
                        background: msg.role === 'creator'
                          ? (report.simulationType === 'sexting' ? '#e11d48' : report.simulationType === 'aftercare' ? '#e84393' : '#ff6b35')
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

            {/* Live input preview */}
            <div className="px-3 md:px-4 py-2 border-t bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 flex-shrink-0">Input:</span>
                <div className="flex-1 rounded-lg bg-gray-50 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm min-h-[32px] md:min-h-[36px] border border-gray-200 font-mono break-all">
                  {currentInput}
                  {isPlaying && <span className="inline-block w-0.5 h-4 bg-purple-500 ml-0.5 animate-pulse align-middle" />}
                </div>
              </div>
            </div>

            {/* Playback controls */}
            <div className="p-3 md:p-4 border-t bg-gray-50 space-y-2 md:space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xs font-mono text-gray-500 w-10 md:w-12 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={totalDuration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-2 rounded-full accent-purple-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-500 w-10 md:w-12">{formatTime(totalDuration)}</span>
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 hover:bg-purple-600 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <button
                    onClick={() => { resetReplay(); setIsPlaying(false) }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 5].map(s => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        speed === s
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
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

export default function AdminPanel() {
  return (
    <AdminWrapper>
      <AdminPanelContent />
    </AdminWrapper>
  )
}
