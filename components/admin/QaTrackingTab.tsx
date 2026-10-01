'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, RefreshCw, ChevronDown, ChevronUp, Activity } from 'lucide-react'
import { getAdminToken } from '@/lib/admin-role'
import { relativeDateLabel } from '@/lib/dates'

interface Account { email: string; sessions: number; events: number; firstSeen: string | null; lastSeen: string | null; activeMs: number }
interface Session { sid: string; email: string; platform: string; start: string; end: string; totalMs: number; activeMs: number; events: number; clicks: number; pageViews: number; inputs: number; apiCalls: number; paths: string[]; ua: string; ip: string }
interface Ev { id: number; sid: string; email: string; type: string; label: string; path: string; detail: Record<string, unknown> | null; dur: number | null; t: string }
interface Payload { accounts: Account[]; sessions: Session[]; pageTime: { path: string; ms: number; views: number }[]; recent: Ev[]; generatedAt: string }

type Range = 'today' | 'yesterday' | '7d' | '30d' | 'all'
const RANGES: { key: Range; label: string }[] = [{ key: 'today', label: 'Today' }, { key: 'yesterday', label: 'Yesterday' }, { key: '7d', label: 'Last 7 days' }, { key: '30d', label: 'Last 30 days' }, { key: 'all', label: 'All time' }]

const TYPE_STYLE: Record<string, string> = {
  page_view: 'bg-blue-100 text-blue-800', page_leave: 'bg-blue-50 text-blue-600', click: 'bg-orange-100 text-orange-800', dblclick: 'bg-orange-100 text-orange-800', contextmenu: 'bg-orange-50 text-orange-700',
  input: 'bg-violet-100 text-violet-800', change: 'bg-violet-100 text-violet-800', key: 'bg-violet-50 text-violet-700', paste: 'bg-fuchsia-100 text-fuchsia-800', copy: 'bg-fuchsia-100 text-fuchsia-800', cut: 'bg-fuchsia-100 text-fuchsia-800',
  api_call: 'bg-emerald-100 text-emerald-800', scroll: 'bg-gray-100 text-gray-700', heartbeat: 'bg-gray-50 text-gray-500', tab_hidden: 'bg-amber-100 text-amber-800', tab_visible: 'bg-amber-50 text-amber-700',
  window_blur: 'bg-amber-100 text-amber-800', window_focus: 'bg-amber-50 text-amber-700', session_start: 'bg-green-600 text-white', login: 'bg-green-100 text-green-800', logout: 'bg-red-100 text-red-800', unload: 'bg-red-50 text-red-700',
  js_error: 'bg-red-600 text-white', resize: 'bg-gray-100 text-gray-600', print: 'bg-gray-800 text-white',
}
const TYPE_GROUPS: { key: string; label: string; types: string[] }[] = [
  { key: 'all', label: 'Everything', types: [] },
  { key: 'pages', label: 'Pages', types: ['page_view', 'page_leave', 'unload'] },
  { key: 'clicks', label: 'Clicks', types: ['click', 'dblclick', 'contextmenu'] },
  { key: 'typing', label: 'Typing', types: ['input', 'change', 'key', 'paste', 'copy', 'cut'] },
  { key: 'api', label: 'Data loaded', types: ['api_call'] },
  { key: 'attention', label: 'Attention', types: ['scroll', 'tab_hidden', 'tab_visible', 'window_blur', 'window_focus', 'heartbeat'] },
  { key: 'session', label: 'Session', types: ['session_start', 'login', 'logout', 'js_error', 'resize', 'print'] },
]

function fmtDur(ms: number): string {
  if (!ms || ms < 1000) return `${Math.max(0, Math.round(ms || 0))}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`
}
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const str = (v: unknown) => (typeof v === 'string' ? v : v === undefined || v === null ? '' : JSON.stringify(v))

function summarize(e: Ev): string {
  const d = e.detail || {}
  switch (e.type) {
    case 'page_view': return [d.from ? `came from ${str(d.from)}` : d.referrer ? `referrer ${str(d.referrer)}` : 'direct'].join('')
    case 'page_leave': return `stayed ${fmtDur(e.dur || 0)} · scrolled ${str(d.maxScroll) || 0}% · ${str(d.reason)}`
    case 'click': return [d.section ? `in "${str(d.section)}"` : '', d.kind ? `<${str(d.kind)}>` : '', d.href ? `→ ${str(d.href)}` : ''].filter(Boolean).join(' ')
    case 'input': return `typed "${str(d.value)}" (${str(d.length)} chars)`
    case 'change': return `set to "${str(d.value)}"${d.checked !== undefined ? ` (${d.checked ? 'checked' : 'unchecked'})` : ''}`
    case 'key': return d.field ? `in ${str(d.field)}` : ''
    case 'copy': case 'cut': case 'paste': return `"${str(d.text)}"${d.field ? ` into ${str(d.field)}` : ''}`
    case 'api_call': return d.error ? `failed: ${str(d.error)}` : `HTTP ${str(d.status)} · ${fmtDur(e.dur || 0)}`
    case 'scroll': return `reached ${str(d.depth)}% of the page`
    case 'heartbeat': return d.active ? 'active' : `idle for ${fmtDur(Number(d.idleMs) || 0)}`
    case 'session_start': return `${str(d.platform)} · screen ${str(d.screen)} · ${str(d.tz)} · ${str(d.lang)}`
    case 'login': return `${str(d.platform)}${d.resumed ? ' (page reload)' : ''}`
    case 'unload': return `tab closed or reloaded after ${fmtDur(e.dur || 0)} on this page`
    default: return ''
  }
}

function rangeBounds(range: Range): { from?: string; to?: string } {
  const now = new Date()
  const day = (offset: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
  if (range === 'today') return { from: day(0).toISOString(), to: day(1).toISOString() }
  if (range === 'yesterday') return { from: day(-1).toISOString(), to: day(0).toISOString() }
  if (range === '7d') return { from: day(-7).toISOString() }
  if (range === '30d') return { from: day(-30).toISOString() }
  return {}
}

function Tile({ value, label }: { value: string | number; label: string }) {
  return <div className="rounded-xl p-3 text-center bg-white border border-gray-200"><div className="text-xl font-black text-gray-900">{value}</div><div className="text-xs text-gray-500 mt-0.5">{label}</div></div>
}

function EventRow({ e, prev }: { e: Ev; prev: Ev | null }) {
  const delta = prev ? new Date(e.t).getTime() - new Date(prev.t).getTime() : 0
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1 border-b border-gray-50 text-xs">
      <span className="font-mono text-gray-500 w-[68px]">{fmtTime(e.t)}</span>
      <span className="font-mono text-gray-400 w-[60px]">{prev ? `+${fmtDur(delta)}` : ''}</span>
      <span className={`font-bold px-1.5 py-0.5 rounded ${TYPE_STYLE[e.type] || 'bg-gray-100 text-gray-700'}`}>{e.type}</span>
      <span className="font-semibold text-gray-900">{e.label}</span>
      <span className="text-gray-600">{summarize(e)}</span>
      <span className="text-gray-400 ml-auto truncate max-w-[260px]">{e.path}</span>
    </div>
  )
}

function Timeline({ events }: { events: Ev[] }) {
  const [group, setGroup] = useState('all')
  const [showBeats, setShowBeats] = useState(false)
  const [q, setQ] = useState('')
  const types = TYPE_GROUPS.find((g) => g.key === group)?.types || []
  const rows = events.filter((e) => (types.length === 0 || types.includes(e.type)) && (showBeats || e.type !== 'heartbeat') && (!q || `${e.label} ${e.path} ${summarize(e)}`.toLowerCase().includes(q.toLowerCase())))
  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {TYPE_GROUPS.map((g) => <button key={g.key} onClick={() => setGroup(g.key)} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${group === g.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{g.label}</button>)}
        <label className="text-xs text-gray-600 flex items-center gap-1 ml-2"><input type="checkbox" checked={showBeats} onChange={(e) => setShowBeats(e.target.checked)} /> show 15s heartbeats</label>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="filter this timeline…" className="ml-auto px-3 py-1 rounded-lg border border-gray-200 text-xs" />
        <span className="text-xs text-gray-500">{rows.length} of {events.length}</span>
      </div>
      <div className="max-h-[520px] overflow-y-auto rounded-xl bg-gray-50 p-3">
        {rows.map((e, i) => <EventRow key={e.id} e={e} prev={i > 0 ? rows[i - 1] : null} />)}
        {rows.length === 0 && <p className="text-xs text-gray-500">Nothing in this filter.</p>}
      </div>
    </div>
  )
}

/** Super-admin only: everything the QA accounts did, when, and for how long. */
export default function QaTrackingTab() {
  const [range, setRange] = useState<Range>('today')
  const [email, setEmail] = useState('')
  const [data, setData] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [auto, setAuto] = useState(true)
  const [openSid, setOpenSid] = useState<string | null>(null)
  const [timelines, setTimelines] = useState<Record<string, Ev[]>>({})

  const authed = useCallback((url: string) => fetch(url, { cache: 'no-store', headers: { Authorization: `Bearer ${getAdminToken('admin') || ''}` } }), [])

  const load = useCallback(async () => {
    try {
      const b = rangeBounds(range)
      const params = new URLSearchParams()
      if (b.from) params.set('from', b.from)
      if (b.to) params.set('to', b.to)
      if (email) params.set('email', email)
      const res = await authed(`/api/admin/qa-activity?${params}`)
      if (res.status === 401) throw new Error('Only the super admin can see QA tracking. Log out and in again if you just updated.')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [range, email, authed])

  const loadSession = useCallback(async (sid: string) => {
    const res = await authed(`/api/admin/qa-activity?sid=${encodeURIComponent(sid)}`)
    if (res.ok) {
      const d = await res.json()
      setTimelines((t) => ({ ...t, [sid]: d.events || [] }))
    }
  }, [authed])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!auto) return
    const id = window.setInterval(() => { load(); if (openSid) loadSession(openSid) }, 15000)
    return () => window.clearInterval(id)
  }, [auto, load, openSid, loadSession])

  const totals = useMemo(() => {
    const s = data?.sessions || []
    return { sessions: s.length, totalMs: s.reduce((a, x) => a + x.totalMs, 0), activeMs: s.reduce((a, x) => a + x.activeMs, 0), pageViews: s.reduce((a, x) => a + x.pageViews, 0), clicks: s.reduce((a, x) => a + x.clicks, 0), inputs: s.reduce((a, x) => a + x.inputs, 0), apiCalls: s.reduce((a, x) => a + x.apiCalls, 0) }
  }, [data])

  if (error) return <div className="card glass-card text-red-600 font-semibold">{error}</div>
  if (!data) return <div className="card glass-card text-gray-500">Loading QA tracking…</div>

  return (
    <div className="space-y-6">
      <div className="card glass-card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-gray-800" /> QA tracking</h2>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1 text-gray-600"><input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> live (every 15s)</label>
            <button onClick={() => { load(); if (openSid) loadSession(openSid) }} className="btn-primary px-4 py-2 inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Refresh</button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {RANGES.map((r) => <button key={r.key} onClick={() => setRange(r.key)} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${range === r.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{r.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setEmail('')} className={`px-3 py-1.5 rounded-xl text-sm font-semibold ${email === '' ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>All QA accounts</button>
          {data.accounts.map((a) => (
            <button key={a.email} onClick={() => setEmail(a.email)} className={`px-3 py-1.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 ${email === a.email ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
              {a.email} <span className={`text-xs ${email === a.email ? 'text-white/80' : 'text-gray-400'}`}>{a.sessions} sessions · active {fmtDur(a.activeMs)} · last {a.lastSeen ? relativeDateLabel(a.lastSeen) : 'never'}</span>
            </button>
          ))}
          {data.accounts.length === 0 && <span className="text-sm text-gray-500">No QA activity recorded yet. It starts the moment a QA account logs in.</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          <Tile value={totals.sessions} label="Sessions" />
          <Tile value={fmtDur(totals.totalMs)} label="Time on site" />
          <Tile value={fmtDur(totals.activeMs)} label="Actively working" />
          <Tile value={totals.pageViews} label="Pages opened" />
          <Tile value={totals.clicks} label="Clicks" />
          <Tile value={totals.inputs} label="Things typed" />
          <Tile value={totals.apiCalls} label="Data loads" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card glass-card">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><Activity className="w-5 h-5 text-emerald-600" /> Live feed <span className="text-xs font-normal text-gray-500">newest first, heartbeats hidden</span></h3>
          <div className="max-h-[420px] overflow-y-auto rounded-xl bg-gray-50 p-3">
            {data.recent.map((e) => (
              <div key={e.id} className="flex flex-wrap items-baseline gap-x-2 py-1 border-b border-gray-100 text-xs">
                <span className="font-mono text-gray-500">{relativeDateLabel(e.t)}:{new Date(e.t).getSeconds().toString().padStart(2, '0')}</span>
                <span className={`font-bold px-1.5 py-0.5 rounded ${TYPE_STYLE[e.type] || 'bg-gray-100 text-gray-700'}`}>{e.type}</span>
                <span className="font-semibold text-gray-900">{e.label}</span>
                <span className="text-gray-600">{summarize(e)}</span>
                <span className="text-gray-400 ml-auto truncate max-w-[200px]">{e.path}</span>
              </div>
            ))}
            {data.recent.length === 0 && <p className="text-xs text-gray-500">Nothing in this range.</p>}
          </div>
        </div>
        <div className="card glass-card">
          <h3 className="text-lg font-bold mb-2">Time per page</h3>
          {data.pageTime.length === 0 ? <p className="text-sm text-gray-500">No completed page visits in this range.</p> : (
            <div className="space-y-1.5">
              {data.pageTime.map((p) => {
                const max = data.pageTime[0].ms || 1
                return (
                  <div key={p.path} className="text-sm">
                    <div className="flex justify-between gap-2"><span className="font-semibold text-gray-900 truncate">{p.path}</span><span className="text-gray-600 whitespace-nowrap">{fmtDur(p.ms)} · {p.views} visits</span></div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.max(2, (p.ms / max) * 100)}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card glass-card">
        <h3 className="text-lg font-bold mb-3">Sessions <span className="text-xs font-normal text-gray-500">one per browser tab, newest first · open one for the full step-by-step timeline</span></h3>
        <div className="space-y-2">
          {data.sessions.map((s) => {
            const open = openSid === s.sid
            return (
              <div key={s.sid} className="rounded-xl bg-white border border-gray-200 p-3">
                <button onClick={() => { const next = open ? null : s.sid; setOpenSid(next); if (next && !timelines[next]) loadSession(next) }} className="w-full text-left flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-bold text-gray-900">{relativeDateLabel(s.start)}</span>
                  <span className="text-gray-600">to {fmtTime(s.end)}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">{fmtDur(s.totalMs)} total</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{fmtDur(s.activeMs)} active</span>
                  <span className="text-xs text-gray-600">{s.email} · {s.platform}</span>
                  <span className="text-xs text-gray-500">{s.pageViews} pages · {s.clicks} clicks · {s.inputs} typed · {s.apiCalls} data loads · {s.events} events</span>
                  <span className="text-xs text-gray-400 truncate max-w-[320px]">{s.paths.join(', ')}</span>
                  <span className="ml-auto">{open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</span>
                </button>
                {open && (
                  <div>
                    <p className="text-xs text-gray-500 mt-2">{s.ua}{s.ip ? ` · IP ${s.ip}` : ''}</p>
                    {timelines[s.sid] ? <Timeline events={timelines[s.sid]} /> : <p className="text-xs text-gray-500 mt-2">Loading timeline…</p>}
                  </div>
                )}
              </div>
            )
          })}
          {data.sessions.length === 0 && <p className="text-sm text-gray-500">No sessions in this range.</p>}
        </div>
      </div>
    </div>
  )
}
