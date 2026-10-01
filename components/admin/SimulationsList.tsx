'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

interface Category { name: string; score: number; feedback?: string }
interface Report {
  id: number
  telegramUsername: string
  email: string
  overallScore: number
  categories: Category[]
  overallFeedback: string | { summary?: string; strengths?: string[]; weaknesses?: string[]; missedOpportunities?: string[] }
  notes?: string
  conversation: { role: string; content: string }[]
  durationMode: string
  messageCount: number
  simulationType: string
  wpm?: number
  completedAt?: string
}

const TYPE_LABELS: Record<string, string> = {
  chatting: 'Relationship', sexting: 'Sexting', aftercare: 'Aftercare', combined: 'Full Session',
  connection: 'Connection', 'topic-change': 'Changing Topic', 'chat-teacher': 'Chat demo', 'sexting-teacher': 'Sexting demo', 'aftercare-teacher': 'Aftercare demo',
}
const TYPE_ORDER = ['all', 'chatting', 'sexting', 'aftercare', 'combined', 'connection', 'topic-change', 'chat-teacher', 'sexting-teacher', 'aftercare-teacher']
const scoreColor = (s: number) => (s >= 80 ? '#16a34a' : s >= 60 ? '#f59e0b' : '#dc2626')

function parseFeedback(fb: Report['overallFeedback']) {
  if (!fb) return {}
  if (typeof fb === 'string') {
    try { return JSON.parse(fb) } catch { return { summary: fb } }
  }
  return fb
}

function ReportDetails({ report }: { report: Report }) {
  const fb = parseFeedback(report.overallFeedback)
  return (
    <div className="mt-4 space-y-4 text-sm">
      <div className="grid md:grid-cols-2 gap-2">
        {report.categories.map((c) => (
          <div key={c.name} className="rounded-xl p-3 bg-gray-50">
            <div className="flex justify-between font-semibold"><span>{c.name}</span><span style={{ color: scoreColor(c.score * 10) }}>{c.score}/10</span></div>
            {c.feedback && <p className="text-gray-600 mt-1">{c.feedback}</p>}
          </div>
        ))}
      </div>
      {fb.summary && <p className="rounded-xl p-3 bg-blue-50 text-blue-900"><strong>Summary: </strong>{fb.summary}</p>}
      {Array.isArray(fb.strengths) && fb.strengths.length > 0 && <div className="rounded-xl p-3 bg-green-50"><strong>Strengths</strong><ul className="list-disc ml-5">{fb.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>}
      {Array.isArray(fb.weaknesses) && fb.weaknesses.length > 0 && <div className="rounded-xl p-3 bg-amber-50"><strong>Weaknesses</strong><ul className="list-disc ml-5">{fb.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul></div>}
      {report.notes && <div className="rounded-xl p-3" style={{ background: '#fffef0' }}><strong>Notes: </strong><span className="whitespace-pre-wrap">{report.notes}</span></div>}
      <div className="rounded-xl p-3 bg-gray-100 max-h-96 overflow-y-auto space-y-1.5">
        {(report.conversation || []).map((m, i) => (
          <div key={i} className={`flex ${m.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[75%] px-3 py-1.5 rounded-2xl" style={{ background: m.role === 'creator' ? '#ff6b35' : '#fff', color: m.role === 'creator' ? '#fff' : '#000' }}>{m.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Read-only list of every simulation report with filters, used by the QA view. */
export default function SimulationsList() {
  const [reports, setReports] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/simulation-reports', { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      setReports(data.reports || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rows = useMemo(() => {
    if (!reports) return []
    const q = search.trim().toLowerCase()
    return reports
      .filter((r) => type === 'all' || r.simulationType === type)
      .filter((r) => !q || r.telegramUsername.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '') || b.id - a.id)
  }, [reports, type, search])

  if (error) return <p className="text-red-600 font-semibold">Could not load simulations: {error}</p>
  if (!reports) return <p className="text-gray-500">Loading simulations…</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TYPE_ORDER.map((t) => {
          const count = t === 'all' ? reports.length : reports.filter((r) => r.simulationType === t).length
          if (t !== 'all' && count === 0) return null
          return (
            <button key={t} onClick={() => setType(t)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${type === t ? 'bg-violet-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>
              {t === 'all' ? 'All' : TYPE_LABELS[t] || t} <span className="opacity-70">{count}</span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by Telegram username or email…" className="flex-1 px-4 py-2 rounded-xl border border-gray-200" />
        <button onClick={load} className="px-4 py-2 rounded-xl font-semibold bg-gray-900 text-white">Refresh</button>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white border border-gray-200 p-4">
            <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="text-2xl font-black w-16" style={{ color: scoreColor(r.overallScore) }}>{r.overallScore}</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-violet-100 text-violet-800">{TYPE_LABELS[r.simulationType] || r.simulationType}</span>
              <span className="font-bold text-gray-900">@{r.telegramUsername.replace(/^@/, '')}</span>
              <span className="text-xs text-gray-500">{r.email}</span>
              <span className="text-xs text-gray-500">{r.completedAt ? new Date(r.completedAt).toLocaleString() : ''} · {r.durationMode} · {r.messageCount} msgs{r.wpm ? ` · ${r.wpm} wpm` : ''}</span>
            </button>
            {open === r.id && <ReportDetails report={r} />}
          </div>
        ))}
        {rows.length === 0 && <p className="text-gray-500">No simulation reports yet.</p>}
      </div>
    </div>
  )
}
