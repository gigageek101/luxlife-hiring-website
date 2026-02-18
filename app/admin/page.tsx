'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, RefreshCw, Trash2, LogOut, MessageCircle, ChevronDown, ChevronUp, StickyNote, Sparkles } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import AdminWrapper from './admin-wrapper'
import { useRouter } from 'next/navigation'

interface Assessment {
  day: number
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  attempt_number: number
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

interface SimReport {
  id: number
  telegramUsername: string
  email: string
  overallScore: number
  categories: SimCategory[]
  overallFeedback: string
  notes: string
  conversation: { role: string; content: string }[]
  durationMode: string
  messageCount: number
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

  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#f59e0b'
    if (score >= 4) return '#f97316'
    return '#ef4444'
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

                  {/* All Attempts */}
                  {(['day2', 'day3', 'day4', 'day5'] as const).some(
                    dayKey => user.assessments[dayKey].length > 1
                  ) && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-orange-600 hover:text-orange-700">
                        View All Attempts
                      </summary>
                      <div className="mt-3 space-y-2">
                        {(['day2', 'day3', 'day4', 'day5'] as const).map((dayKey) => {
                          const dayNum = dayKey.replace('day', '')
                          const assessments = user.assessments[dayKey]
                          
                          if (assessments.length === 0) return null

                          return (
                            <div key={dayKey} className="text-sm">
                              <strong>Day {dayNum}:</strong>
                              <ul className="ml-4 mt-1 space-y-1">
                                {assessments.map((attempt, idx) => (
                                  <li key={idx} className="text-xs" style={{ color: 'var(--text-secondary-on-white)' }}>
                                    Attempt #{attempt.attempt_number}: {attempt.score}/{attempt.total_questions} ({Math.round(attempt.percentage)}%) - 
                                    {attempt.passed ? ' ✅ Passed' : ' ❌ Failed'} - 
                                    {new Date(attempt.completed_at).toLocaleString()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    </details>
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
                      {simReports.length > 0 ? (simReports.reduce((s, r) => s + r.overallScore, 0) / simReports.length).toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-green-700">Avg Score</div>
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
                      {simReports.filter(r => r.overallScore >= 7).length}
                    </div>
                    <div className="text-sm text-orange-700">Score 7+</div>
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
                                className="w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
                                style={{ background: `${getScoreColor(report.overallScore)}15`, color: getScoreColor(report.overallScore) }}
                              >
                                {report.overallScore}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">{report.telegramUsername}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>{report.email}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                    {report.durationMode}
                                  </span>
                                  <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                    {report.messageCount} messages
                                  </span>
                                  <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>
                                    {new Date(report.completedAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-3 md:mt-0">
                              <div className="text-right hidden md:block">
                                <div className="text-2xl font-black" style={{ color: getScoreColor(report.overallScore) }}>
                                  {report.overallScore}/10
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              ) : (
                                <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-muted-on-white)' }} />
                              )}
                            </div>
                          </div>

                          {/* Expanded Report Content */}
                          {isExpanded && (
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                              {/* Category Scores Grid */}
                              <div>
                                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted-on-white)' }}>
                                  Category Scores
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {report.categories.map((cat, catIdx) => (
                                    <div
                                      key={catIdx}
                                      className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                                      style={{
                                        background: expandedSimCategories.has(`${report.id}-${catIdx}`) ? `${getScoreColor(cat.score)}10` : '#f9fafb',
                                        border: `1px solid ${expandedSimCategories.has(`${report.id}-${catIdx}`) ? getScoreColor(cat.score) : '#e5e7eb'}`,
                                      }}
                                      onClick={(e) => { e.stopPropagation(); toggleSimCategory(report.id, catIdx) }}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-2xl font-black" style={{ color: getScoreColor(cat.score) }}>{cat.score}</span>
                                        <span className="text-xs" style={{ color: 'var(--text-muted-on-white)' }}>/10</span>
                                      </div>
                                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                                      <div className="mt-2 w-full rounded-full h-1" style={{ background: '#e5e7eb' }}>
                                        <div className="h-1 rounded-full" style={{ width: `${cat.score * 10}%`, background: getScoreColor(cat.score) }} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Expanded Category Details */}
                              {report.categories.map((cat, catIdx) => (
                                expandedSimCategories.has(`${report.id}-${catIdx}`) && (
                                  <div key={`detail-${catIdx}`} className="rounded-xl p-5" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                                    <h4 className="font-bold mb-2" style={{ color: getScoreColor(cat.score) }}>{cat.name} — {cat.score}/10</h4>
                                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary-on-white)' }}>{cat.feedback}</p>

                                    {cat.examples.good.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-bold mb-1" style={{ color: '#10b981' }}>Good examples:</p>
                                        {cat.examples.good.map((ex, i) => (
                                          <div key={i} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={{ background: 'rgba(16,185,129,0.08)', color: '#065f46' }}>
                                            &ldquo;{ex}&rdquo;
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {cat.examples.needsWork.length > 0 && (
                                      <div className="mb-3">
                                        <p className="text-xs font-bold mb-1" style={{ color: '#f97316' }}>Needs work:</p>
                                        {cat.examples.needsWork.map((ex, i) => (
                                          <div key={i} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={{ background: 'rgba(249,115,22,0.08)', color: '#9a3412' }}>
                                            &ldquo;{ex}&rdquo;
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="p-3 rounded-lg" style={{ background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.15)' }}>
                                      <p className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                        <Sparkles className="w-3 h-3" /> Advice
                                      </p>
                                      <p className="text-xs whitespace-pre-line" style={{ color: 'var(--text-secondary-on-white)' }}>{cat.advice}</p>
                                    </div>
                                  </div>
                                )
                              ))}

                              {/* Overall Feedback */}
                              <div>
                                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted-on-white)' }}>
                                  Overall Feedback
                                </h4>
                                <div className="rounded-xl p-5" style={{ background: '#1a1a2e', color: '#e2e8f0' }}>
                                  <p className="text-sm leading-relaxed whitespace-pre-line">{report.overallFeedback}</p>
                                </div>
                              </div>

                              {/* Notes */}
                              {report.notes && report.notes.trim() && (
                                <div>
                                  <h4 className="text-sm font-bold mb-3 uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted-on-white)' }}>
                                    <StickyNote className="w-4 h-4" /> Creator Notes
                                  </h4>
                                  <div className="rounded-xl p-5" style={{ background: '#fffef0', border: '1px solid #e8e4c9' }}>
                                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{report.notes}</p>
                                  </div>
                                </div>
                              )}

                              {/* Conversation */}
                              <div>
                                <h4 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-muted-on-white)' }}>
                                  Full Conversation
                                </h4>
                                <div className="rounded-xl p-4 max-h-80 overflow-y-auto space-y-2" style={{ background: '#f0f0f0' }}>
                                  {report.conversation.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                                      <div
                                        className="max-w-[75%] px-3 py-2 rounded-2xl text-sm"
                                        style={{
                                          background: msg.role === 'creator' ? '#ff6b35' : '#ffffff',
                                          color: msg.role === 'creator' ? '#ffffff' : '#000000',
                                          borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                                          borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
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
