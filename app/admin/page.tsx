'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, RefreshCw, Trash2, LogOut, MessageCircle, ChevronDown, ChevronUp, StickyNote, Sparkles, Keyboard, ClipboardPaste, AlertTriangle, Download, Loader2 } from 'lucide-react'
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
  conversation: { role: string; content: string }[]
  durationMode: string
  messageCount: number
  typedCount: number
  pasteCount: number
  completedAt: string
}

function AdminPanelContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'assessments' | 'simulations'>('assessments')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [simReports, setSimReports] = useState<SimReport[]>([])
  const [simLoading, setSimLoading] = useState(true)
  const [simSearch, setSimSearch] = useState('')
  const [expandedReport, setExpandedReport] = useState<number | null>(null)
  const [expandedSimCategories, setExpandedSimCategories] = useState<Set<string>>(new Set())
  const [exportingReportId, setExportingReportId] = useState<number | null>(null)
  const [expandedUserAssessment, setExpandedUserAssessment] = useState<string | null>(null)
  const reportContentRefs = useRef<Record<number, HTMLDivElement | null>>({})

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

  const CATEGORY_WEIGHTS: Record<string, number> = {
    'Giving Him What He Wants to Hear': 25,
    'Making the Subscriber Feel Special': 20,
    'Caring About the Subscriber': 15,
    'Asking the Right Questions': 15,
    'American Accent & Texting Style': 10,
    'Grammar & Natural Flow': 10,
    'Note-Taking & Information Tracking': 5,
  }

  const calculateWeightedScore = (categories: SimCategory[]): number => {
    let total = 0
    for (const cat of categories) {
      const weight = CATEGORY_WEIGHTS[cat.name] || 0
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

  useEffect(() => {
    fetchUsers()
    fetchSimReports()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchUsers(false)
      if (activeTab === 'simulations') fetchSimReports(false)
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

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      {/* Logout Button */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={handleLogout}
          className="card bg-white shadow-lg p-3 flex items-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="text-sm font-semibold text-red-600">Logout</span>
        </button>
      </div>
      
      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="mb-4">Admin Panel</h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
              Training & Simulation Dashboard
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('assessments')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'assessments'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              Assessments
            </button>
            <button
              onClick={() => { setActiveTab('simulations'); if (simReports.length === 0) fetchSimReports() }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'simulations'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              Simulations
              {simReports.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'simulations' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  {simReports.length}
                </span>
              )}
            </button>
          </div>

          {/* ASSESSMENTS TAB */}
          {activeTab === 'assessments' && (<>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
                  <div className="text-sm text-blue-700">Total Users</div>
                </div>
              </div>
            </div>
            <div className="card bg-purple-50 border-2 border-purple-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">{stats.day2Completed}</div>
                <div className="text-sm text-purple-700">Day 2</div>
              </div>
            </div>
            <div className="card bg-indigo-50 border-2 border-indigo-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-900">{stats.day3Completed}</div>
                <div className="text-sm text-indigo-700">Day 3</div>
              </div>
            </div>
            <div className="card bg-orange-50 border-2 border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{stats.day4Completed}</div>
                <div className="text-sm text-orange-700">Day 4</div>
              </div>
            </div>
            <div className="card bg-green-50 border-2 border-green-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">{stats.day5Completed}</div>
                <div className="text-sm text-green-700">Day 5</div>
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{user.telegramUsername}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                        {user.email}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUser(user.id, user.telegramUsername)}
                      className="mt-4 md:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete User
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
                                    <div key={idx} className="p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${attempt.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {attempt.passed ? '✅ Passed' : '❌ Failed'}
                                          </span>
                                          <span className="text-sm font-semibold">
                                            Attempt #{attempt.attempt_number}: {attempt.score}/{attempt.total_questions} ({Math.round(attempt.percentage)}%)
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                          {new Date(attempt.completed_at).toLocaleString()}
                                        </span>
                                      </div>

                                      {attempt.answers && attempt.answers.length > 0 ? (
                                        <div className="space-y-3">
                                          {attempt.answers.map((ans: AssessmentAnswer, ansIdx: number) => (
                                            <div
                                              key={ansIdx}
                                              className="rounded-lg p-3 text-sm"
                                              style={{
                                                background: ans.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                                                border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                              }}
                                            >
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
                                                    <span className="font-semibold text-gray-500">Correct answer: </span>
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
              {/* Sim Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-blue-50 border-2 border-blue-200">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{simReports.length}</div>
                      <div className="text-sm text-blue-700">Total Sessions</div>
                    </div>
                  </div>
                </div>
                <div className="card bg-green-50 border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">
                      {simReports.length > 0 ? (simReports.reduce((s, r) => s + calculateWeightedScore(r.categories), 0) / simReports.length).toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-green-700">Avg Score /100</div>
                  </div>
                </div>
                <div className="card bg-purple-50 border-2 border-purple-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-900">
                      {new Set(simReports.map(r => r.telegramUsername)).size}
                    </div>
                    <div className="text-sm text-purple-700">Unique Users</div>
                  </div>
                </div>
                <div className="card bg-orange-50 border-2 border-orange-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-900">
                      {simReports.filter(r => calculateWeightedScore(r.categories) >= 70).length}
                    </div>
                    <div className="text-sm text-orange-700">Score 70+</div>
                  </div>
                </div>
              </div>

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
              ) : simReports.filter(r =>
                r.telegramUsername.toLowerCase().includes(simSearch.toLowerCase()) ||
                r.email.toLowerCase().includes(simSearch.toLowerCase())
              ).length === 0 ? (
                <div className="card glass-card text-center py-12">
                  <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
                    No simulation reports found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {simReports
                    .filter(r =>
                      r.telegramUsername.toLowerCase().includes(simSearch.toLowerCase()) ||
                      r.email.toLowerCase().includes(simSearch.toLowerCase())
                    )
                    .map((report, index) => {
                      const isExpanded = expandedReport === report.id
                      const weightedScore = calculateWeightedScore(report.categories)

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
                            <div className="flex items-center gap-4">
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0"
                                style={{ background: `${getScoreColor(weightedScore)}15`, color: getScoreColor(weightedScore) }}
                              >
                                {weightedScore}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{report.telegramUsername}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>{report.email}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {report.durationMode}
                                  </span>
                                  <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                    {report.messageCount} msgs
                                  </span>
                                  <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                    <Keyboard className="w-3 h-3" /> {report.typedCount}
                                  </span>
                                  {report.pasteCount > 0 ? (
                                    <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold">
                                      <ClipboardPaste className="w-3 h-3" /> {report.pasteCount} pasted
                                    </span>
                                  ) : (
                                    <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                                      <Keyboard className="w-3 h-3" /> all typed
                                    </span>
                                  )}
                                  <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                    {new Date(report.completedAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 md:mt-0">
                              <div className="text-right hidden md:block">
                                <div className="text-2xl font-black" style={{ color: getScoreColor(weightedScore) }}>
                                  {weightedScore}/100
                                </div>
                                <div className="text-xs font-semibold" style={{ color: getScoreColor(weightedScore) }}>
                                  {getScoreLabel(weightedScore)}
                                </div>
                              </div>
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
                              <div className="text-center mb-10">
                                <div
                                  className="inline-flex items-center justify-center w-36 h-36 rounded-full mb-6 relative"
                                  style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}
                                >
                                  <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center bg-white">
                                    <span className="text-4xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
                                    <span className="text-xs font-semibold text-gray-400">/100</span>
                                  </div>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Score: {weightedScore}/100</h2>
                                <p className="text-lg font-semibold mb-4" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
                                <div className="inline-flex flex-wrap gap-3 justify-center text-xs font-medium">
                                  <span className="px-2.5 py-1 rounded-full" style={{ background: '#10b98115', color: '#10b981' }}>85-100 Elite</span>
                                  <span className="px-2.5 py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>70-84 Strong</span>
                                  <span className="px-2.5 py-1 rounded-full" style={{ background: '#f9731615', color: '#f97316' }}>55-69 Developing</span>
                                  <span className="px-2.5 py-1 rounded-full" style={{ background: '#ef444415', color: '#ef4444' }}>40-54 Below Avg</span>
                                  <span className="px-2.5 py-1 rounded-full" style={{ background: '#dc262615', color: '#dc2626' }}>0-39 Needs Coaching</span>
                                </div>
                              </div>

                              {/* Copy/Paste Detection Banner */}
                              {(report.typedCount > 0 || report.pasteCount > 0) && (
                                <div className="mb-8">
                                  <div className="rounded-2xl p-4 flex flex-wrap items-center gap-6" style={{ background: report.pasteCount > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${report.pasteCount > 0 ? '#fecaca' : '#bbf7d0'}` }}>
                                    <div className="flex items-center gap-2">
                                      <Keyboard className="w-5 h-5 text-blue-600" />
                                      <div>
                                        <span className="text-lg font-black text-blue-700">{report.typedCount}</span>
                                        <span className="text-xs text-blue-600 ml-1">typed</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <ClipboardPaste className={`w-5 h-5 ${report.pasteCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                                      <div>
                                        <span className={`text-lg font-black ${report.pasteCount > 0 ? 'text-red-700' : 'text-green-700'}`}>{report.pasteCount}</span>
                                        <span className={`text-xs ml-1 ${report.pasteCount > 0 ? 'text-red-600' : 'text-green-600'}`}>pasted</span>
                                      </div>
                                    </div>
                                    {report.pasteCount > 0 && (
                                      <div className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        {Math.round((report.pasteCount / (report.typedCount + report.pasteCount)) * 100)}% copy-pasted
                                      </div>
                                    )}
                                    {report.pasteCount === 0 && (
                                      <div className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        100% typed by hand
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Weighted Score Table */}
                              <div className="rounded-2xl overflow-hidden mb-10" style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                      <th className="text-left px-4 py-3 font-semibold text-gray-900">#</th>
                                      <th className="text-left px-4 py-3 font-semibold text-gray-900">Category</th>
                                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Weight</th>
                                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Raw</th>
                                      <th className="text-center px-4 py-3 font-semibold text-gray-900">Points</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.categories.map((cat, catIdx) => {
                                      const tw = CATEGORY_WEIGHTS[cat.name] || 0
                                      const te = Math.round(((cat.score / 10) * tw) * 10) / 10
                                      return (
                                        <tr key={catIdx} style={{ borderTop: '1px solid #e5e7eb' }}>
                                          <td className="px-4 py-3 font-semibold text-gray-400">{catIdx + 1}</td>
                                          <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                                          <td className="px-4 py-3 text-center text-gray-500">{tw} pts</td>
                                          <td className="px-4 py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}/10</td>
                                          <td className="px-4 py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{te}</td>
                                        </tr>
                                      )
                                    })}
                                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f8fafc' }}>
                                      <td colSpan={2} className="px-4 py-3 font-bold text-gray-900">TOTAL</td>
                                      <td className="px-4 py-3 text-center font-bold text-gray-500">100 pts</td>
                                      <td className="px-4 py-3 text-center"></td>
                                      <td className="px-4 py-3 text-center font-black text-lg" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}/100</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Category Scores Overview — weighted grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                                {report.categories.map((cat, catIdx) => {
                                  const weight = CATEGORY_WEIGHTS[cat.name] || 0
                                  const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                                  return (
                                  <div
                                    key={catIdx}
                                    className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                                    style={{
                                      background: '#ffffff',
                                      border: `2px solid ${expandedSimCategories.has(`${report.id}-${catIdx}`) ? getCategoryScoreColor(cat.score) : '#e5e7eb'}`,
                                      boxShadow: expandedSimCategories.has(`${report.id}-${catIdx}`) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : '0 1px 3px rgba(0,0,0,0.06)',
                                    }}
                                    onClick={(e) => { e.stopPropagation(); toggleSimCategory(report.id, catIdx) }}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-3xl font-black" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}</span>
                                      <span className="text-xs text-gray-400">/10</span>
                                    </div>
                                    <p className="text-sm font-semibold leading-tight mb-1">{cat.name}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                      <span>{earned}/{weight} pts</span>
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
                              <div className="space-y-4 mb-10">
                                <h3 className="text-xl font-bold">Detailed Breakdown</h3>
                                {report.categories.map((cat, catIdx) => {
                                  const catKey = `${report.id}-${catIdx}`
                                  const isCatExpanded = expandedSimCategories.has(catKey)
                                  const catWeight = CATEGORY_WEIGHTS[cat.name] || 0
                                  const catEarned = Math.round(((cat.score / 10) * catWeight) * 10) / 10

                                  return (
                                    <div
                                      key={catIdx}
                                      className="rounded-2xl overflow-hidden"
                                      style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleSimCategory(report.id, catIdx) }}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                                        style={{ background: isCatExpanded ? '#f8fafc' : 'transparent' }}
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                                            {cat.score}
                                          </div>
                                          <div>
                                            <p className="font-semibold">{cat.name}</p>
                                            <p className="text-sm" style={{ color: getCategoryScoreColor(cat.score) }}>{catEarned}/{catWeight} pts (weight &times;{catWeight})</p>
                                          </div>
                                        </div>
                                        {isCatExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                      </button>

                                      {isCatExpanded && (
                                        <div className="px-6 pb-6 space-y-4">
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
                              <div className="rounded-2xl p-8 mb-8 space-y-6" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                <h3 className="text-xl font-bold">Overall Assessment</h3>

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
                                            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
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
                                            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#991b1b' }}>
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
                                            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', color: '#92400e' }}>
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
                                            <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)', color: '#7c2d12' }}>
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
                                <div className="rounded-2xl p-6 mb-8" style={{ background: '#fffef0', border: '1px solid #e8e4c9' }}>
                                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#4a4520' }}>
                                    <StickyNote className="w-5 h-5" />
                                    Creator Notes
                                  </h3>
                                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{report.notes}</p>
                                </div>
                              )}

                              {/* Export PDF Button */}
                              <div className="flex justify-center mb-8">
                                <button
                                  onClick={(e) => { e.stopPropagation(); exportSimReportAsPdf(report) }}
                                  disabled={exportingReportId === report.id}
                                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
                                >
                                  {exportingReportId === report.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                  {exportingReportId === report.id ? 'Generating PDF...' : 'Export Report as PDF'}
                                </button>
                              </div>

                              {/* Full Conversation */}
                              <div className="rounded-2xl p-6 mb-4" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                                <h3 className="text-lg font-bold mb-4">Full Conversation</h3>
                                <div className={`space-y-2 pr-2 ${exportingReportId === report.id ? '' : 'max-h-96 overflow-y-auto'}`}>
                                  {report.conversation.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                                      <div
                                        className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                                        style={{
                                          background: msg.role === 'creator' ? '#ff6b35' : '#ffffff',
                                          color: msg.role === 'creator' ? '#ffffff' : '#000000',
                                          borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                                          borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                        }}
                                      >
                                        {msg.content}
                                      </div>
                                    </div>
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
        </div>
      </section>
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
