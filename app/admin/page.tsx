'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, CheckCircle, XCircle, Clock, RefreshCw, Trash2, LogOut } from 'lucide-react'
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

function AdminPanelContent() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

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

  useEffect(() => {
    fetchUsers()
  }, [])

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchUsers(false) // Don't show loading on auto-refresh
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

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
          <div className="text-center mb-12">
            <h1 className="mb-4">Admin Panel</h1>
            <p className="text-xl" style={{ color: 'var(--text-secondary-on-white)' }}>
              Training Assessment Dashboard
            </p>
          </div>

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
