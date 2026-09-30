'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { GUIDES, STEP_INFO, STEP_ORDER, guideBySlug } from '@/lib/guides'

interface GuideStat { opens: number; completed: boolean; maxScroll: number; seconds: number; lastSeen: string }
interface SimStat { count: number; avg: number; best: number; last: string }
interface UserRow {
  id: number
  telegramUsername: string
  email: string
  createdAt: string
  guides: Record<string, GuideStat>
  guidesOpened: number
  guidesCompleted: number
  simulations: Record<string, SimStat>
  simulationsTotal: number
  assessments: { attempts: number; days: number; anyPassed: boolean; last: string } | null
  lastActivity: string | null
  flags: string[]
}
interface GuideRow { slug: string; title: string; emoji: string; step: string; readers: number; finished: number; opens: number }
interface Payload { users: UserRow[]; guides: GuideRow[]; totalGuides: number; generatedAt: string }

const SIM_LABELS: Record<string, string> = {
  chatting: 'Relationship', sexting: 'Sexting', aftercare: 'Aftercare', combined: 'Full Session',
  connection: 'Connection', 'topic-change': 'Changing Topic',
  'chat-teacher': 'Chat demo', 'sexting-teacher': 'Sexting demo', 'aftercare-teacher': 'Aftercare demo',
}
const ago = (value: string | null) => {
  if (!value) return 'never'
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`
}
const minutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} min`

function UserGuides({ user }: { user: UserRow }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Guides</p>
        <ul className="space-y-1 text-sm">
          {STEP_ORDER.flatMap((step) => GUIDES.filter((g) => g.step === step)).map((guide) => {
            const stat = user.guides[guide.slug]
            return (
              <li key={guide.slug} className={`flex items-center gap-2 rounded-lg px-2 py-1 ${stat ? (stat.completed ? 'bg-green-50' : 'bg-amber-50') : 'bg-gray-50 text-gray-400'}`}>
                <span>{stat ? (stat.completed ? '✅' : '👀') : '⬜'}</span>
                <span className="flex-1 truncate">{guide.emoji} {guide.title.replace(/^💖 /, '')}</span>
                {stat && <span className="text-xs text-gray-600 whitespace-nowrap">{stat.opens}× · {stat.maxScroll}% · {minutes(stat.seconds)} · {ago(stat.lastSeen)}</span>}
              </li>
            )
          })}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">Simulations</p>
        {Object.keys(user.simulations).length === 0 && <p className="text-sm text-red-600 font-semibold">No simulation done yet.</p>}
        <ul className="space-y-1 text-sm">
          {Object.entries(user.simulations).map(([type, stat]) => (
            <li key={type} className="flex items-center gap-2 rounded-lg px-2 py-1 bg-violet-50">
              <span className="font-semibold flex-1">{SIM_LABELS[type] || type}</span>
              <span className="text-xs text-gray-700">{stat.count}× · avg {stat.avg} · best {stat.best} · {ago(stat.last)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mt-4 mb-2">Assessments</p>
        <p className="text-sm">{user.assessments ? `${user.assessments.attempts} attempts over ${user.assessments.days} days · last ${ago(user.assessments.last)}` : <span className="text-red-600 font-semibold">none</span>}</p>
      </div>
    </div>
  )
}

/** Who read which guide (and finished it), who did which simulations, and who did nothing. */
export default function AccountabilityTab() {
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/accountability', { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setData(await response.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    if (!data) return []
    const list = onlyFlagged ? data.users.filter((u) => u.flags.length > 0) : data.users
    return [...list].sort((a, b) => b.flags.length - a.flags.length || (b.lastActivity || '').localeCompare(a.lastActivity || ''))
  }, [data, onlyFlagged])

  if (error) return <p className="text-red-600 font-semibold">Could not load accountability: {error}</p>
  if (!data) return <p className="text-gray-500">Loading accountability…</p>

  const total = data.users.length
  const readSomething = data.users.filter((u) => u.guidesOpened > 0).length
  const noGuides = total - readSomething
  const noSims = data.users.filter((u) => u.simulationsTotal === 0).length
  const nothing = data.users.filter((u) => u.flags.includes('no activity at all')).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([['Users', total, 'text-gray-900'], ['Read ≥ 1 guide', readSomething, 'text-green-700'], ['Never opened a guide', noGuides, 'text-red-600'], ['Never did a simulation', noSims, 'text-red-600'], ['No activity at all', nothing, 'text-red-700']] as const).map(([label, value, color]) => (
          <div key={label} className="rounded-2xl p-4 bg-white border border-gray-200">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} /> Only flagged users
        </label>
        <button onClick={load} className="text-sm font-semibold underline text-violet-700">Refresh</button>
        <span className="text-xs text-gray-500">Updated {new Date(data.generatedAt).toLocaleTimeString()} · a guide counts as finished when the reader scrolled to its end</span>
      </div>

      <div className="space-y-2">
        {rows.map((user) => (
          <div key={user.id} className="rounded-2xl bg-white border border-gray-200 p-4">
            <button onClick={() => setOpen(open === user.id ? null : user.id)} className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="min-w-[180px]">
                <p className="font-bold text-gray-900">@{user.telegramUsername.replace(/^@/, '')}</p>
                <p className="text-xs text-gray-500">{user.email} · joined {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.guidesCompleted ? 'bg-green-100 text-green-800' : user.guidesOpened ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'}`}>
                📚 {user.guidesOpened}/{data.totalGuides} opened · {user.guidesCompleted} finished
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.simulationsTotal ? 'bg-violet-100 text-violet-800' : 'bg-red-100 text-red-700'}`}>
                🎮 {user.simulationsTotal} sims{user.simulationsTotal ? `: ${Object.entries(user.simulations).map(([t, s]) => `${SIM_LABELS[t] || t} ${s.count}`).join(', ')}` : ''}
              </span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.assessments ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-700'}`}>
                📝 {user.assessments ? `${user.assessments.attempts} assessments` : 'no assessments'}
              </span>
              <span className="text-xs text-gray-500">last activity {ago(user.lastActivity)}</span>
              {user.flags.map((flag) => <span key={flag} className="text-xs font-bold px-2 py-1 rounded-full bg-red-600 text-white">⚠ {flag}</span>)}
            </button>
            {open === user.id && <UserGuides user={user} />}
          </div>
        ))}
        {rows.length === 0 && <p className="text-gray-500">Nobody is flagged. Everyone read and practised something.</p>}
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 p-4">
        <p className="font-bold text-gray-800 mb-3">Per guide: who read it</p>
        {STEP_ORDER.map((step) => (
          <div key={step} className="mb-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{STEP_INFO[step].title}</p>
            <div className="grid md:grid-cols-2 gap-1">
              {data.guides.filter((g) => g.step === step).map((g) => (
                <div key={g.slug} className="flex items-center gap-2 text-sm rounded-lg px-2 py-1 bg-gray-50">
                  <span className="flex-1 truncate">{g.emoji} {guideBySlug(g.slug)?.title.replace(/^💖 /, '') || g.slug}</span>
                  <span className={`text-xs font-bold ${g.readers ? 'text-gray-700' : 'text-red-600'}`}>{g.readers}/{total} readers · {g.finished} finished · {g.opens} opens</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
