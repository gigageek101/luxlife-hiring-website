'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle, BookOpenCheck, Keyboard, ClipboardPaste, Zap } from 'lucide-react'
import ScoreTrendChart from '@/components/admin/ScoreTrendChart'
import ScriptAdherenceCard from '@/components/admin/ScriptAdherenceCard'
import IssuesTimeline from '@/components/admin/IssuesTimeline'
import { getCategoryScoreColor, getScoreColor, getScoreLabel, getSimTypeLabel, parseFeedback } from '@/lib/sim-scoring'
import { AnalyticsReport, CategoryTrend, Direction, TypeAnalysis, analyzeType, typesWithData } from '@/lib/user-analytics'
import { relativeDateLabel } from '@/lib/dates'

interface Payload {
  user: { id: number | null; telegramUsername: string; email: string; createdAt: string | null } | null
  reports: AnalyticsReport[]
}

const DIRECTION_STYLE: Record<Direction, { color: string; bg: string; label: string }> = {
  improving: { color: '#047857', bg: '#d1fae5', label: 'Going up' },
  declining: { color: '#b91c1c', bg: '#fee2e2', label: 'Going down' },
  flat: { color: '#92400e', bg: '#fef3c7', label: 'Flat' },
  new: { color: '#4b5563', bg: '#f3f4f6', label: 'Too early' },
}

function DirectionIcon({ direction, className = 'w-4 h-4' }: { direction: Direction; className?: string }) {
  if (direction === 'improving') return <TrendingUp className={className} />
  if (direction === 'declining') return <TrendingDown className={className} />
  return <Minus className={className} />
}

function TrendBadge({ direction, text }: { direction: Direction; text: string }) {
  const s = DIRECTION_STYLE[direction]
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: s.bg, color: s.color }}>
      <DirectionIcon direction={direction} /> {s.label} <span className="font-normal">· {text}</span>
    </div>
  )
}

function Tile({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-xl p-4 text-center bg-white" style={{ border: '1px solid #e5e7eb' }}>
      <div className="text-2xl font-black" style={{ color: color || '#111827' }}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function CategoryRow({ cat }: { cat: CategoryTrend }) {
  const s = DIRECTION_STYLE[cat.trend.direction]
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="font-semibold text-gray-900 flex-1 min-w-[200px]">{cat.name}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: s.bg, color: s.color }}>
          <DirectionIcon direction={cat.trend.direction} className="w-3 h-3" /> {cat.trend.direction === 'new' ? 'one session' : `${cat.trend.firstAvg} → ${cat.trend.lastAvg}`}
        </span>
        <span className="text-sm font-black w-14 text-right" style={{ color: getCategoryScoreColor(cat.avg) }}>{cat.avg}/10</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${cat.avg * 10}%`, background: getCategoryScoreColor(cat.avg) }} />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">{cat.scores.join(' → ')}</span>
      </div>
    </div>
  )
}

function WeaknessCard({ analysis }: { analysis: TypeAnalysis }) {
  const w = analysis.biggestWeakness
  return (
    <div className="card glass-card h-full">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-red-500" /> Biggest weakness</h3>
      {!w ? <p className="text-sm text-gray-500">No graded categories yet.</p> : (
        <>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getCategoryScoreColor(w.avg)}22`, color: getCategoryScoreColor(w.avg) }}>{w.avg}</div>
            <div>
              <p className="font-bold text-gray-900">{w.name}</p>
              <p className="text-xs text-gray-500">average over {w.scores.length} session{w.scores.length === 1 ? '' : 's'} · latest {w.latest}/10 · {w.trend.text}</p>
            </div>
          </div>
          {w.latestFeedback && <p className="text-sm text-gray-700 mb-2">{w.latestFeedback}</p>}
          {w.needsWork.length > 0 && (
            <ul className="text-sm space-y-1 mb-3">{w.needsWork.map((e, i) => <li key={i} className="pl-3 border-l-2 border-red-300 text-gray-700">{e}</li>)}</ul>
          )}
          {w.latestAdvice && <p className="text-sm rounded-lg p-3" style={{ background: '#fffbeb', color: '#92400e' }}><strong>Fix: </strong>{w.latestAdvice}</p>}
          {analysis.recurringWeaknesses.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Flagged in the last sessions</p>
              <ul className="text-sm space-y-1">{analysis.recurringWeaknesses.map((r, i) => <li key={i} className="pl-3 border-l-2 border-gray-300 text-gray-700">{r}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdherenceSection({ analysis }: { analysis: TypeAnalysis }) {
  const a = analysis.adherence
  return (
    <div className="card glass-card h-full">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-3"><BookOpenCheck className="w-5 h-5 text-violet-600" /> Sticks to the script?</h3>
      {!a ? (
        <p className="text-sm text-gray-500">Not graded yet. Script adherence is scored on every simulation finished from 1 Oct 2026 on.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getCategoryScoreColor(a.avg)}22`, color: getCategoryScoreColor(a.avg) }}>{a.avg}</div>
            <div>
              <p className="font-bold text-gray-900">{a.verdict}</p>
              <p className="text-xs text-gray-500">average over {a.count} graded session{a.count === 1 ? '' : 's'} · {a.trend.text}</p>
            </div>
          </div>
          {a.series.length >= 2 && <div className="mb-3"><ScoreTrendChart points={a.series} max={10} colorFor={getCategoryScoreColor} /></div>}
          <ScriptAdherenceCard data={a.latest} title="Latest session" subtitle={relativeDateLabel(a.series[a.series.length - 1].date)} />
        </>
      )}
    </div>
  )
}

/** Per-user analytics cards. Used inside the admin Analytics tab and on /admin/user/<name>. */
export default function UserAnalyticsView({ username }: { username: string }) {
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/user-analytics?username=${encodeURIComponent(username)}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const payload = (await res.json()) as Payload
      payload.reports = payload.reports.map((r) => ({ ...r, overallFeedback: parseFeedback(r.overallFeedback) }))
      setData(payload)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [username])

  useEffect(() => {
    load()
  }, [load])

  const types = useMemo(() => (data ? typesWithData(data.reports) : []), [data])
  const activeType = type && types.includes(type) ? type : types[0] || null
  const analysis = useMemo(() => (data && activeType ? analyzeType(data.reports, activeType) : null), [data, activeType])
  const overallAvg = useMemo(() => {
    if (!data || data.reports.length === 0) return null
    const all = types.map((t) => analyzeType(data.reports, t))
    const total = all.reduce((s, a) => s + a.avg * a.count, 0)
    return Math.round((total / data.reports.length) * 10) / 10
  }, [data, types])

  return (
    <div>
          {error && <div className="card glass-card text-red-600 font-semibold">Could not load analytics: {error}</div>}
          {!data && !error && <div className="card glass-card text-gray-500">Loading analytics…</div>}

          {data && (
            <>
              <div className="card glass-card mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">@{(data.user?.telegramUsername || username).replace(/^@/, '')}</h1>
                    <p className="text-sm" style={{ color: 'var(--text-secondary-on-white)' }}>
                      {data.user?.email || ''}{data.user?.createdAt ? ` · joined ${new Date(data.user.createdAt).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <button onClick={load} className="btn-primary px-5 py-2.5 inline-flex items-center gap-2 self-start"><RefreshCw className="w-4 h-4" /> Refresh</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <Tile value={data.reports.length} label="Simulations done" color="#1d4ed8" />
                  <Tile value={overallAvg ?? '—'} label={overallAvg !== null ? `Avg score · ${getScoreLabel(overallAvg)}` : 'Avg score'} color={overallAvg !== null ? getScoreColor(overallAvg) : undefined} />
                  <Tile value={types.length} label="Simulation types practised" color="#6d28d9" />
                  <Tile value={data.reports.length ? relativeDateLabel(data.reports[data.reports.length - 1].completedAt, true) : '—'} label="Last simulation" />
                </div>
              </div>

              {data.reports.length === 0 ? (
                <div className="card glass-card text-center py-12 text-gray-500">This user has not finished a simulation yet.</div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {types.map((t) => {
                      const count = data.reports.filter((r) => r.simulationType === t).length
                      return (
                        <button key={t} onClick={() => setType(t)} className={`py-2 px-4 rounded-xl font-semibold text-sm transition-all flex items-center gap-1.5 ${activeType === t ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
                          {getSimTypeLabel(t)} <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeType === t ? 'bg-white/25' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                        </button>
                      )
                    })}
                  </div>

                  {analysis && (
                    <>
                      <div className="card glass-card mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                          <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-violet-500" /> {analysis.label}: score over time</h2>
                          <TrendBadge direction={analysis.trend.direction} text={analysis.trend.text} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                          <Tile value={analysis.count} label="Sessions" color="#1d4ed8" />
                          <Tile value={analysis.avg} label={`Average · ${getScoreLabel(analysis.avg)}`} color={getScoreColor(analysis.avg)} />
                          <Tile value={analysis.best} label="Best" color={getScoreColor(analysis.best)} />
                          <Tile value={analysis.latest} label="Latest" color={getScoreColor(analysis.latest)} />
                        </div>
                        <ScoreTrendChart points={analysis.series} />
                        <p className="text-xs text-gray-500 mt-2">Dots = weighted score of each session (0-100). Dashed line = overall direction.</p>
                      </div>

                      <div className="card glass-card mb-6">
                        <h2 className="text-xl font-bold mb-1">Category trends</h2>
                        <p className="text-xs text-gray-500 mb-3">Weakest first. Badge compares the first sessions with the latest ones; numbers on the right are every session in order.</p>
                        {analysis.categories.map((cat) => <CategoryRow key={cat.name} cat={cat} />)}
                      </div>

                      <div className="card glass-card mb-6">
                        <h2 className="text-xl font-bold mb-1">Common issues over time</h2>
                        <IssuesTimeline reports={data.reports.filter((r) => r.simulationType === activeType)} />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <WeaknessCard analysis={analysis} />
                        <AdherenceSection analysis={analysis} />
                      </div>

                      <div className="card glass-card">
                        <h2 className="text-xl font-bold mb-3">Sessions</h2>
                        <div className="space-y-2">
                          {[...analysis.series].reverse().map((p) => {
                            const r = data.reports.find((x) => x.id === p.id)
                            const adherence = r?.overallFeedback?.scriptAdherence
                            return (
                              <div key={p.id} className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
                                <span className="w-12 text-center font-black text-lg" style={{ color: getScoreColor(p.score) }}>{p.score}</span>
                                <span className="font-semibold text-gray-900 min-w-[150px]">{relativeDateLabel(p.date)}</span>
                                {r && <span className="text-gray-500">{r.durationMode} · {r.messageCount} msgs</span>}
                                {r && <span className="inline-flex items-center gap-1 text-blue-700"><Keyboard className="w-3 h-3" />{r.typedCount}</span>}
                                {r && r.pasteCount > 0 && <span className="inline-flex items-center gap-1 text-red-700 font-semibold"><ClipboardPaste className="w-3 h-3" />{r.pasteCount}</span>}
                                {r && r.wpm > 0 && <span className="inline-flex items-center gap-1 text-violet-700"><Zap className="w-3 h-3" />{r.wpm}</span>}
                                {adherence && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${getCategoryScoreColor(Number(adherence.score))}22`, color: getCategoryScoreColor(Number(adherence.score)) }}>script {adherence.score}/10</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
    </div>
  )
}
