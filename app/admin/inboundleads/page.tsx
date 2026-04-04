'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, ChevronUp, ArrowLeft, RefreshCw, Users, CheckCircle, XCircle, TrendingUp, Trash2 } from 'lucide-react'
import AdminWrapper from '../admin-wrapper'

interface QuizAnswer {
  questionId: number
  selectedOption: number
  answer: string
  isCorrect: boolean
  question?: string
  correctAnswer?: string
  options?: string[]
}

interface CreativityData {
  object?: string
  alternateUses?: string[]
  scenario?: string
  captions?: string[]
}

interface ClaudeEvaluation {
  validUses?: number
  totalUses?: number
  usesFeedback?: string
  validCaptions?: number
  totalCaptions?: number
  captionsFeedback?: string
  passed?: boolean
}

interface Lead {
  id: number
  full_name: string
  email: string
  telegram_username: string | null
  city: string
  age: number
  position_type: string
  english_quiz_score: number
  english_quiz_total: number
  memory_test_score: number
  memory_test_total: number
  education_type: string
  english_rating: string
  quiz_answers: QuizAnswer[]
  qualified: boolean
  created_at: string
  typing_wpm: number | null
  typing_accuracy: number | null
  typing_passed: boolean | null
  download_speed: number | null
  upload_speed: number | null
  speed_passed: boolean | null
  creativity_score: number | null
  creativity_data: CreativityData | null
  creativity_passed: boolean | null
  claude_evaluation: ClaudeEvaluation | null
}

interface PositionStats {
  attempted: number
  qualified: number
  failed: number
}

interface StatsData {
  byPosition: Record<string, PositionStats>
  total: {
    attempted: number
    qualified: number
    failed: number
    passRate: number
  }
}

function InboundLeadsContent() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState<'all' | 'marketing' | 'backend'>('all')
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inbound-leads?t=' + Date.now(), { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setLeads(data.leads || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching inbound leads:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => {
      fetchData()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete lead "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch('/api/admin/inbound-leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
    }
  }

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      (lead.full_name || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.telegram_username || '').toLowerCase().includes(q)

    const matchesPosition =
      positionFilter === 'all' || lead.position_type === positionFilter

    return matchesSearch && matchesPosition
  })

  const getPassRate = (p: PositionStats) =>
    p.attempted > 0 ? Math.round((p.qualified / p.attempted) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading inbound leads...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 px-4 md:px-8 pb-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </button>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Inbound Leads
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <Users className="w-5 h-5" style={{ color: '#3b82f6' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Attempted</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total.attempted}</p>
            </div>

            <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Qualified</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#10b981' }}>{stats.total.qualified}</p>
            </div>

            <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Failed</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#ef4444' }}>{stats.total.failed}</p>
            </div>

            <div className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#a855f7' }} />
                </div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Pass Rate</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#a855f7' }}>{stats.total.passRate}%</p>
            </div>
          </div>
        )}

        {/* Per-position breakdown */}
        {stats && Object.keys(stats.byPosition).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(stats.byPosition).map(([position, p]) => (
              <div key={position} className="rounded-xl p-5 shadow-sm" style={{ background: 'var(--surface)' }}>
                <h3 className="text-lg font-semibold mb-3 capitalize" style={{ color: 'var(--text-primary)' }}>
                  {position}
                </h3>
                <div className="flex items-center gap-6 text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Attempted: <strong style={{ color: 'var(--text-primary)' }}>{p.attempted}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Passed: <strong style={{ color: '#10b981' }}>{p.qualified}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Failed: <strong style={{ color: '#ef4444' }}>{p.failed}</strong>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Rate: <strong style={{ color: '#a855f7' }}>{getPassRate(p)}%</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border, #333)' }}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'marketing', 'backend'] as const).map((val) => (
              <button
                key={val}
                onClick={() => setPositionFilter(val)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize"
                style={{
                  background: positionFilter === val ? 'var(--accent)' : 'var(--surface)',
                  color: positionFilter === val ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Leads count */}
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Showing {filteredLeads.length} successful lead{filteredLeads.length !== 1 ? 's' : ''}
        </p>

        {/* Leads Table */}
        {filteredLeads.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>No leads found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="rounded-xl overflow-hidden shadow-sm" style={{ background: 'var(--surface)' }}>
                {/* Row header */}
                <div className="flex items-center p-4 md:p-5">
                  <button
                    onClick={() => toggleRow(lead.id)}
                    className="flex-1 flex items-center text-left transition-colors hover:opacity-90 min-w-0"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Name</p>
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{lead.full_name || 'N/A'}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium capitalize ${lead.position_type === 'marketing' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {lead.position_type}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Telegram</p>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--accent)' }}>
                          {lead.telegram_username ? `@${lead.telegram_username}` : '—'}
                        </p>
                      </div>
                      <div className="hidden md:block min-w-0">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Email</p>
                        <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{lead.email || 'N/A'}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tests</p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: '#10b981' + '22', color: '#10b981' }}>EN {lead.english_quiz_score ?? '?'}/{lead.english_quiz_total ?? '?'}</span>
                          {lead.typing_wpm != null && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: (lead.typing_passed ? '#10b981' : '#ef4444') + '22', color: lead.typing_passed ? '#10b981' : '#ef4444' }}>{lead.typing_wpm} WPM</span>
                          )}
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Speed</p>
                        <p className="text-sm font-medium" style={{ color: lead.speed_passed ? '#10b981' : lead.download_speed != null ? '#ef4444' : 'var(--text-muted)' }}>
                          {lead.download_speed != null ? `↓${lead.download_speed} Mbps` : '—'}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Date</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    {expandedRows.has(lead.id) ? (
                      <ChevronUp className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(lead.id, lead.full_name || 'this lead') }}
                    className="ml-3 p-2 rounded-lg hover:bg-red-500/20 transition-colors flex-shrink-0"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                {/* Expanded details */}
                {expandedRows.has(lead.id) && (
                  <div className="px-4 md:px-5 pb-5 pt-0 border-t" style={{ borderColor: 'var(--border, #333)' }}>
                    {/* Contact info */}
                    <div className="rounded-lg p-4 mt-4 mb-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--accent)' }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Contact Info</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Telegram</p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                            {lead.telegram_username ? (
                              <a href={`https://t.me/${lead.telegram_username}`} target="_blank" rel="noopener noreferrer" className="hover:underline">@{lead.telegram_username}</a>
                            ) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>City</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{lead.city || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Age</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{lead.age || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Education</p>
                          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{lead.education_type || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Test results */}
                    <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-primary)' }}>
                      <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Test Results</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid #10b981' + '44' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>English</p>
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>{lead.english_quiz_score ?? '?'}/{lead.english_quiz_total ?? '?'}</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid #10b981' + '44' }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Memory</p>
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>{lead.memory_test_score ?? '?'}/{lead.memory_test_total ?? '?'}</p>
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: `1px solid ${lead.typing_passed ? '#10b981' : '#ef4444'}44` }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Typing</p>
                          <p className="text-lg font-bold" style={{ color: lead.typing_passed ? '#10b981' : lead.typing_wpm != null ? '#ef4444' : 'var(--text-muted)' }}>
                            {lead.typing_wpm != null ? `${lead.typing_wpm}` : '—'}
                          </p>
                          {lead.typing_accuracy != null && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.typing_accuracy}% acc</p>}
                        </div>
                        <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: `1px solid ${lead.speed_passed ? '#10b981' : '#ef4444'}44` }}>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Download</p>
                          <p className="text-lg font-bold" style={{ color: lead.speed_passed ? '#10b981' : lead.download_speed != null ? '#ef4444' : 'var(--text-muted)' }}>
                            {lead.download_speed != null ? `${lead.download_speed}` : '—'}
                          </p>
                          {lead.upload_speed != null && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>↑{lead.upload_speed} Mbps</p>}
                        </div>
                        {lead.position_type === 'marketing' && (
                          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--surface)', border: `1px solid ${lead.creativity_passed ? '#10b981' : '#ef4444'}44` }}>
                            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Creativity</p>
                            <p className="text-lg font-bold" style={{ color: lead.creativity_passed ? '#10b981' : lead.creativity_score != null ? '#ef4444' : 'var(--text-muted)' }}>
                              {lead.creativity_passed ? 'Pass' : lead.creativity_score != null ? 'Fail' : '—'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Creativity Details (marketing only) */}
                    {lead.creativity_data && (
                      <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-primary)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Creativity Test Details</h4>
                        {lead.creativity_data.object && (
                          <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--surface)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Object: {lead.creativity_data.object}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {lead.creativity_data.alternateUses?.map((use, i) => (
                                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--accent)' + '22', color: 'var(--accent)' }}>{use}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {lead.creativity_data.captions && lead.creativity_data.captions.some(c => c.trim()) && (
                          <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--surface)' }}>
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Captions — {lead.creativity_data.scenario || 'N/A'}</p>
                            <div className="space-y-2">
                              {lead.creativity_data.captions.filter(c => c.trim()).map((cap, i) => (
                                <p key={i} className="text-sm italic pl-3" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--accent)' }}>"{cap}"</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {lead.claude_evaluation && (
                          <div className="rounded-lg p-3" style={{ background: 'var(--surface)', border: '1px solid #a855f7' + '44' }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#a855f7' }}>AI Evaluation</p>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                              <div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Valid Uses</p>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{lead.claude_evaluation.validUses ?? '?'}/{lead.claude_evaluation.totalUses ?? '?'}</p>
                              </div>
                              <div>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Valid Captions</p>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{lead.claude_evaluation.validCaptions ?? '?'}/{lead.claude_evaluation.totalCaptions ?? '?'}</p>
                              </div>
                            </div>
                            {lead.claude_evaluation.usesFeedback && (
                              <p className="text-xs mb-1.5 pl-2" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid #a855f7' }}>{lead.claude_evaluation.usesFeedback}</p>
                            )}
                            {lead.claude_evaluation.captionsFeedback && (
                              <p className="text-xs pl-2" style={{ color: 'var(--text-secondary)', borderLeft: '2px solid #a855f7' }}>{lead.claude_evaluation.captionsFeedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quiz Answers */}
                    {lead.quiz_answers && lead.quiz_answers.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                          Quiz Answers
                        </h4>
                        <div className="space-y-2">
                          {lead.quiz_answers.map((qa, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-lg text-sm"
                              style={{ background: 'var(--bg-primary)' }}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {qa.isCorrect ? (
                                  <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                                ) : (
                                  <XCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                                  Q{idx + 1}: {qa.question || `Question ${qa.questionId || idx + 1}`}
                                </p>
                                <p style={{ color: qa.isCorrect ? '#10b981' : '#ef4444' }}>
                                  Their answer: {qa.answer || 'Not answered'}
                                </p>
                                {!qa.isCorrect && qa.correctAnswer && (
                                  <p style={{ color: 'var(--text-muted)' }}>
                                    Correct answer: {qa.correctAnswer}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function InboundLeadsPage() {
  return (
    <AdminWrapper>
      <InboundLeadsContent />
    </AdminWrapper>
  )
}
