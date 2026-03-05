'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, ChevronDown, ChevronUp, Trash2, RefreshCw, LogOut, Megaphone, CheckCircle, XCircle, Search } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import MarketingAdminWrapper from './admin-wrapper'
import { useRouter } from 'next/navigation'

interface AssessmentAttempt {
  day: number
  score: number
  total_questions: number
  percentage: number
  passed: boolean
  attempt_number: number
  answers: any[]
  completed_at: string
}

interface MarketingUser {
  id: number
  telegramUsername: string
  email: string
  createdAt: string
  assessments: {
    day1: AssessmentAttempt[]
    day2: AssessmentAttempt[]
  }
}

function MarketingAdminContent() {
  const router = useRouter()
  const [users, setUsers] = useState<MarketingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingUser, setDeletingUser] = useState<number | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/adminmarketing/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user and all their assessment data?')) return
    
    setDeletingUser(userId)
    try {
      const response = await fetch(`/api/adminmarketing/users/${userId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        if (expandedUser === userId) setExpandedUser(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setDeletingUser(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_marketing_token')
    localStorage.removeItem('admin_marketing_expiry')
    router.push('/adminmarketing/auth')
  }

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase()
    return u.telegramUsername.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q)
  })

  const getUserBestScore = (user: MarketingUser, day: 'day1' | 'day2') => {
    const attempts = user.assessments[day]
    if (!attempts || attempts.length === 0) return null
    return attempts.reduce((best, a) => a.score > best.score ? a : best, attempts[0])
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200'
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      <section className="section pt-24 md:pt-32 relative z-10">
        <div className="container max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Marketing Admin</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                  {users.length} registered users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchUsers}
                className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Telegram username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/80 backdrop-blur"
            />
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="card glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-xs text-gray-500 mt-1">Total Users</div>
            </div>
            <div className="card glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => {
                  const best = getUserBestScore(u, 'day1')
                  return best && best.passed
                }).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Day 1 Passed</div>
            </div>
            <div className="card glass-card p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => {
                  const attempts = u.assessments.day1
                  if (!attempts || attempts.length === 0) return false
                  return !attempts.some(a => a.passed)
                }).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Day 1 Failed</div>
            </div>
            <div className="card glass-card p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {users.filter(u => !u.assessments.day1 || u.assessments.day1.length === 0).length}
              </div>
              <div className="text-xs text-gray-500 mt-1">Not Started</div>
            </div>
          </div>

          {/* User List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>Loading marketing users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 card glass-card">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-500">
                {searchQuery ? 'No users match your search' : 'No marketing users registered yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const day1Best = getUserBestScore(user, 'day1')
                const isExpanded = expandedUser === user.id

                return (
                  <motion.div
                    key={user.id}
                    layout
                    className="card glass-card overflow-hidden"
                  >
                    {/* User Header */}
                    <div
                      className="p-4 md:p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold ${
                          day1Best?.passed ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          day1Best ? 'bg-gradient-to-br from-red-400 to-red-600' :
                          'bg-gradient-to-br from-gray-300 to-gray-400'
                        }`}>
                          {user.telegramUsername.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold truncate">{user.telegramUsername}</h3>
                            {day1Best?.passed && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold flex-shrink-0">
                                Passed
                              </span>
                            )}
                            {day1Best && !day1Best.passed && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold flex-shrink-0">
                                Failed
                              </span>
                            )}
                            {!day1Best && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold flex-shrink-0">
                                No Assessment
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {day1Best && (
                            <div className="text-right hidden sm:block">
                              <div className={`text-lg font-bold ${getScoreColor(day1Best.percentage)}`}>
                                {day1Best.score}/{day1Best.total_questions}
                              </div>
                              <div className="text-xs text-gray-500">Best Score</div>
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded User Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-5 pb-5 pt-2 border-t border-gray-100">
                            {/* User Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Telegram</div>
                                <div className="font-medium text-sm truncate">{user.telegramUsername}</div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                <div className="font-medium text-sm truncate">{user.email}</div>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Registered</div>
                                <div className="font-medium text-sm">{new Date(user.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>

                            {/* Day 1 Assessment */}
                            <div className="mb-5">
                              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</span>
                                Day 1 — Mindset & A-Player Assessment
                              </h4>

                              {user.assessments.day1.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm text-center">
                                  No assessment attempts yet
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {user.assessments.day1.map((attempt, aIdx) => {
                                    const attemptKey = `${user.id}-day1-${aIdx}`
                                    const isAttemptExpanded = expandedAttempt === attemptKey

                                    return (
                                      <div key={aIdx} className={`rounded-xl border ${getScoreBg(attempt.percentage)}`}>
                                        <div
                                          className="p-3 md:p-4 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setExpandedAttempt(isAttemptExpanded ? null : attemptKey)
                                          }}
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold">Attempt #{attempt.attempt_number}</span>
                                              {attempt.passed ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-semibold">Passed</span>
                                              ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 font-semibold">Failed</span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className={`text-lg font-bold ${getScoreColor(attempt.percentage)}`}>
                                                {attempt.score}/{attempt.total_questions}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {Number(attempt.percentage).toFixed(0)}%
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                {new Date(attempt.completed_at).toLocaleDateString()}
                                              </span>
                                              {isAttemptExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                              ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Expanded answers */}
                                        <AnimatePresence>
                                          {isAttemptExpanded && attempt.answers && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.25 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="px-3 md:px-4 pb-4 space-y-3">
                                                {attempt.answers.map((ans: any, qIdx: number) => (
                                                  <div key={qIdx} className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <div className="flex items-start gap-2 mb-2">
                                                      {ans.isCorrect ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                      ) : (
                                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                      )}
                                                      <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                                          Q{qIdx + 1}: {ans.question}
                                                        </p>
                                                        <div className="mt-2 space-y-1.5">
                                                          <div>
                                                            <span className="text-xs font-medium text-gray-500">Their Answer:</span>
                                                            <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap">{ans.userAnswer || '(no answer)'}</p>
                                                          </div>
                                                          <div>
                                                            <span className="text-xs font-medium text-gray-500">AI Feedback:</span>
                                                            <p className={`text-xs mt-0.5 ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                              {ans.feedback}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Day 2 Assessment */}
                            <div className="mb-5">
                              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</span>
                                Day 2 — Advanced Marketing
                              </h4>
                              {user.assessments.day2.length === 0 ? (
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm text-center">
                                  No assessment for Day 2 yet
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {user.assessments.day2.map((attempt, aIdx) => {
                                    const attemptKey = `${user.id}-day2-${aIdx}`
                                    const isAttemptExpanded = expandedAttempt === attemptKey

                                    return (
                                      <div key={aIdx} className={`rounded-xl border ${getScoreBg(attempt.percentage)}`}>
                                        <div
                                          className="p-3 md:p-4 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setExpandedAttempt(isAttemptExpanded ? null : attemptKey)
                                          }}
                                        >
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-semibold">Attempt #{attempt.attempt_number}</span>
                                              {attempt.passed ? (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-200 text-green-800 font-semibold">Passed</span>
                                              ) : (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 font-semibold">Failed</span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className={`text-lg font-bold ${getScoreColor(attempt.percentage)}`}>
                                                {attempt.score}/{attempt.total_questions}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {Number(attempt.percentage).toFixed(0)}%
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                {new Date(attempt.completed_at).toLocaleDateString()}
                                              </span>
                                              {isAttemptExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                              ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                              )}
                                            </div>
                                          </div>
                                        </div>

                                        <AnimatePresence>
                                          {isAttemptExpanded && attempt.answers && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.25 }}
                                              className="overflow-hidden"
                                            >
                                              <div className="px-3 md:px-4 pb-4 space-y-3">
                                                {attempt.answers.map((ans: any, qIdx: number) => (
                                                  <div key={qIdx} className="bg-white rounded-lg p-3 border border-gray-100">
                                                    <div className="flex items-start gap-2 mb-2">
                                                      {ans.isCorrect ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                      ) : (
                                                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                      )}
                                                      <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                                          Q{qIdx + 1}: {ans.question}
                                                        </p>
                                                        <div className="mt-2 space-y-1.5">
                                                          <div>
                                                            <span className="text-xs font-medium text-gray-500">Their Answer:</span>
                                                            <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap">{ans.userAnswer || '(no answer)'}</p>
                                                          </div>
                                                          <div>
                                                            <span className="text-xs font-medium text-gray-500">AI Feedback:</span>
                                                            <p className={`text-xs mt-0.5 ${ans.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                              {ans.feedback}
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Delete User */}
                            <div className="pt-4 border-t border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteUser(user.id)
                                }}
                                disabled={deletingUser === user.id}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition-all disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingUser === user.id ? 'Deleting...' : 'Delete User & All Data'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function MarketingAdminPage() {
  return (
    <MarketingAdminWrapper>
      <MarketingAdminContent />
    </MarketingAdminWrapper>
  )
}
