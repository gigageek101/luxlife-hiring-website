'use client'

import { useMemo, useState } from 'react'
import { BarChart3, TrendingDown, TrendingUp, Minus, Users } from 'lucide-react'
import UserAnalyticsView from '@/components/admin/UserAnalyticsView'
import { SimCategory, calculateWeightedScore, getCategoryScoreColor, getScoreColor } from '@/lib/sim-scoring'
import { Direction, TeamReportLike, teamCommonIssues } from '@/lib/user-analytics'
import { relativeDateLabel } from '@/lib/dates'

interface ReportLike extends TeamReportLike { email: string; categories: SimCategory[] }
interface UserLike { telegramUsername: string; email: string; createdAt: string }

interface Props {
  reports: ReportLike[]
  users: UserLike[]
  selectedUser: string | null
  onSelectUser: (username: string | null) => void
}

const DIR: Record<Direction, { label: string; color: string; bg: string }> = {
  improving: { label: 'getting better', color: '#047857', bg: '#d1fae5' },
  declining: { label: 'getting worse', color: '#b91c1c', bg: '#fee2e2' },
  flat: { label: 'no change', color: '#92400e', bg: '#fef3c7' },
  new: { label: 'not enough data', color: '#4b5563', bg: '#f3f4f6' },
}

function DirIcon({ d }: { d: Direction }) {
  if (d === 'improving') return <TrendingUp className="w-3 h-3" />
  if (d === 'declining') return <TrendingDown className="w-3 h-3" />
  return <Minus className="w-3 h-3" />
}

const norm = (name: string) => name.replace(/^@/, '').toLowerCase()

/** Third admin tab: team-wide common issues, a trainee picker, and the per-user analytics inline. */
export default function AnalyticsTab({ reports, users, selectedUser, onSelectUser }: Props) {
  const [search, setSearch] = useState('')
  const [issueType, setIssueType] = useState('all')

  const types = useMemo(() => Array.from(new Set(reports.map((r) => r.simulationType))), [reports])
  const issues = useMemo(() => teamCommonIssues(reports).filter((i) => issueType === 'all' || i.type === issueType).slice(0, 10), [reports, issueType])

  const trainees = useMemo(() => {
    const map = new Map<string, { name: string; email: string; sims: number; avg: number | null; last: string | null }>()
    for (const u of users) map.set(norm(u.telegramUsername), { name: u.telegramUsername.replace(/^@/, ''), email: u.email, sims: 0, avg: null, last: null })
    const scores = new Map<string, number[]>()
    for (const r of reports) {
      const key = norm(r.telegramUsername)
      const t = map.get(key) || { name: r.telegramUsername.replace(/^@/, ''), email: r.email, sims: 0, avg: null, last: null }
      t.sims += 1
      if (!t.last || new Date(r.completedAt) > new Date(t.last)) t.last = r.completedAt
      scores.set(key, [...(scores.get(key) || []), calculateWeightedScore(r.categories, r.simulationType)])
      map.set(key, t)
    }
    scores.forEach((list, key) => {
      const t = map.get(key)
      if (t) t.avg = Math.round((list.reduce((a, b) => a + b, 0) / list.length) * 10) / 10
    })
    const q = search.trim().toLowerCase()
    return Array.from(map.values())
      .filter((t) => !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q))
      .sort((a, b) => (b.last || '').localeCompare(a.last || '') || b.sims - a.sims || a.name.localeCompare(b.name))
  }, [reports, users, search])

  return (
    <div className="space-y-6">
      <div className="card glass-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-violet-500" /> Common issues across all trainees</h2>
          <div className="flex flex-wrap gap-1.5">
            {['all', ...types].map((t) => (
              <button key={t} onClick={() => setIssueType(t)} className={`px-3 py-1 rounded-full text-xs font-semibold ${issueType === t ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{t === 'all' ? 'All types' : t}</button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">A category counts as an issue when a session scores it 6 or lower. Trend compares the last 7 days with everything before.</p>
        {issues.length === 0 ? <p className="text-sm text-gray-500">No flagged categories yet.</p> : (
          <div className="space-y-2">
            {issues.map((i) => {
              const d = DIR[i.direction]
              return (
                <div key={`${i.type}-${i.name}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 border-b border-gray-100 last:border-0 text-sm">
                  <span className="w-10 h-10 rounded-lg flex items-center justify-center font-black" style={{ background: `${getCategoryScoreColor(i.avg)}22`, color: getCategoryScoreColor(i.avg) }}>{i.avg}</span>
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-bold text-gray-900">{i.name}</p>
                    <p className="text-xs text-gray-500">{i.label} · flagged in {i.flagged} of {i.sessions} sessions · {i.users} trainee{i.users === 1 ? '' : 's'}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1" style={{ background: d.bg, color: d.color }}>
                    <DirIcon d={i.direction} /> {d.label}{i.recentAvg !== null && i.earlierAvg !== null ? ` (${i.earlierAvg} → ${i.recentAvg})` : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card glass-card">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-violet-500" /> Pick a trainee</h2>
        <input type="text" placeholder="Search by Telegram username or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-3" />
        <div className="flex flex-wrap gap-2">
          {trainees.map((t) => {
            const active = selectedUser !== null && norm(selectedUser) === norm(t.name)
            return (
              <button key={t.name} onClick={() => onSelectUser(active ? null : t.name)} className={`px-3 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2 transition-all ${active ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}>
                <span>@{t.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>{t.sims} sims</span>
                {t.avg !== null && <span className="text-xs font-black" style={{ color: active ? '#fff' : getScoreColor(t.avg) }}>{t.avg}</span>}
                {t.last && <span className={`text-xs ${active ? 'text-white/80' : 'text-gray-400'}`}>{relativeDateLabel(t.last, true)}</span>}
              </button>
            )
          })}
          {trainees.length === 0 && <p className="text-sm text-gray-500">No trainees match.</p>}
        </div>
      </div>

      {selectedUser ? <UserAnalyticsView key={selectedUser} username={selectedUser} /> : (
        <div className="card glass-card text-center py-10 text-gray-500">Pick a trainee above to see their progress over time, biggest weakness and script adherence.</div>
      )}
    </div>
  )
}
