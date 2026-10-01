'use client'

// Records everything a QA account does on the site: pages, clicks, typing, filters, API calls,
// scrolling, copy/paste, focus/idle, heartbeats. Batched to /api/qa-activity. Admin-only readers see it.
import { qaSession } from '@/lib/admin-role'

interface QaEvent { t: string; type: string; label?: string; path?: string; detail?: Record<string, unknown>; dur?: number }
type Session = { token: string; platform: string; email: string }

const HEARTBEAT_MS = 15000
const FLUSH_MS = 4000
const IDLE_MS = 30000
const MAX_BATCH = 25

interface State {
  session: Session
  sid: string
  queue: QaEvent[]
  timers: number[]
  lastActivity: number
  pageStart: number
  pagePath: string
  maxScroll: number
  scrollMilestones: Set<number>
  inputTimers: Map<Element, number>
  cleanups: (() => void)[]
  originalFetch: typeof window.fetch
}

let state: State | null = null

const now = () => new Date().toISOString()
const clean = (s: string | null | undefined, max = 120) => (s || '').replace(/\s+/g, ' ').trim().slice(0, max)
const pathOnly = (url: string) => {
  try { const u = new URL(url, location.origin); return u.pathname + u.search } catch { return url.slice(0, 300) }
}

function push(type: string, label?: string, detail?: Record<string, unknown>, dur?: number) {
  if (!state) return
  const ev: QaEvent = { t: now(), type, path: location.pathname + location.search }
  if (label) ev.label = label
  if (detail) ev.detail = detail
  if (dur !== undefined) ev.dur = Math.round(dur)
  state.queue.push(ev)
  if (state.queue.length >= MAX_BATCH) flush()
}

function flush(useBeacon = false) {
  if (!state || state.queue.length === 0) return
  const events = state.queue.splice(0, state.queue.length)
  const body = JSON.stringify({ token: state.session.token, sid: state.sid, platform: state.session.platform, ua: navigator.userAgent, events })
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/qa-activity', new Blob([body], { type: 'application/json' }))
    return
  }
  state.originalFetch('/api/qa-activity', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined)
}

function fieldName(el: Element): string {
  const input = el as HTMLInputElement
  const labelled = input.id ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent : ''
  return clean(input.getAttribute('aria-label') || input.getAttribute('placeholder') || labelled || input.name || input.id || input.getAttribute('data-track') || input.type || el.tagName.toLowerCase(), 80)
}

function describe(target: Element): { label: string; kind: string; href?: string; section?: string } {
  const tracked = target.closest('[data-track]')
  const ctl = target.closest('button, a, [role="button"], [role="tab"], summary, label, input, select, textarea, li, td, th, h1, h2, h3, h4, svg') || target
  const el = ctl.tagName.toLowerCase() === 'svg' ? (ctl.closest('button, a') || ctl) : ctl
  const kind = el.tagName.toLowerCase()
  const isField = kind === 'input' || kind === 'select' || kind === 'textarea'
  const label = tracked ? clean(tracked.getAttribute('data-track')) : isField ? fieldName(el) : clean(el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent) || `${kind}${el.id ? '#' + el.id : ''}`
  const card = el.closest('.card, section, form, table, nav, header, footer, aside, main')
  const heading = card?.querySelector('h1, h2, h3, h4')
  const out: { label: string; kind: string; href?: string; section?: string } = { label, kind }
  const href = (el as HTMLAnchorElement).getAttribute?.('href')
  if (href) out.href = href.slice(0, 200)
  const section = clean(heading?.textContent, 80)
  if (section && section !== label) out.section = section
  return out
}

function bump() {
  if (state) state.lastActivity = Date.now()
}

function scrollDepth(): number {
  const doc = document.documentElement
  const total = Math.max(doc.scrollHeight - window.innerHeight, 1)
  return Math.min(100, Math.round((window.scrollY / total) * 100))
}

function leavePage(reason: string) {
  if (!state) return
  push('page_leave', state.pagePath, { reason, maxScroll: state.maxScroll }, Date.now() - state.pageStart)
}

function enterPage(from: string | null) {
  if (!state) return
  state.pagePath = location.pathname + location.search
  state.pageStart = Date.now()
  state.maxScroll = scrollDepth()
  state.scrollMilestones = new Set()
  push('page_view', clean(document.title, 120), { from, referrer: from ? undefined : document.referrer.slice(0, 200) })
}

/** Called on every client-side route change. */
export function notifyPath() {
  if (!state) return
  const path = location.pathname + location.search
  if (path === state.pagePath) return
  const previous = state.pagePath
  leavePage('navigation')
  enterPage(previous)
}

function on<K extends keyof DocumentEventMap>(type: K, handler: (e: DocumentEventMap[K]) => void, opts?: AddEventListenerOptions) {
  document.addEventListener(type, handler, opts ?? { capture: true, passive: true })
  state?.cleanups.push(() => document.removeEventListener(type, handler, opts ?? { capture: true }))
}
function onWindow<K extends keyof WindowEventMap>(type: K, handler: (e: WindowEventMap[K]) => void) {
  window.addEventListener(type, handler, { passive: true })
  state?.cleanups.push(() => window.removeEventListener(type, handler))
}

function installListeners() {
  if (!state) return
  on('click', (e) => { bump(); const t = e.target; if (!(t instanceof Element)) return; const d = describe(t); push('click', d.label, { ...d, x: Math.round((e as MouseEvent).clientX), y: Math.round((e as MouseEvent).clientY) }) })
  on('dblclick', (e) => { const t = e.target; if (t instanceof Element) push('dblclick', describe(t).label) })
  on('contextmenu', (e) => { const t = e.target; if (t instanceof Element) push('contextmenu', describe(t).label) })
  on('input', (e) => {
    bump()
    const el = e.target as HTMLInputElement
    if (!el || !(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return
    const st = state
    if (!st) return
    const existing = st.inputTimers.get(el)
    if (existing) window.clearTimeout(existing)
    st.inputTimers.set(el, window.setTimeout(() => {
      st.inputTimers.delete(el)
      const raw = el.isContentEditable ? el.textContent || '' : el.value || ''
      const value = el.type === 'password' ? '•'.repeat(Math.min(raw.length, 12)) : raw.slice(0, 200)
      push('input', fieldName(el), { value, length: raw.length, fieldType: el.type || el.tagName.toLowerCase() })
    }, 900))
  })
  on('change', (e) => {
    const el = e.target as HTMLInputElement
    if (!el) return
    if (el.tagName === 'SELECT' || el.type === 'checkbox' || el.type === 'radio' || el.type === 'file') {
      push('change', fieldName(el), { value: el.type === 'file' ? `${el.files?.length || 0} file(s)` : String(el.value).slice(0, 200), checked: el.type === 'checkbox' || el.type === 'radio' ? el.checked : undefined })
    }
  })
  on('keydown', (e) => {
    bump()
    const k = e as KeyboardEvent
    const mod = k.metaKey || k.ctrlKey
    const target = k.target as Element | null
    const inField = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable)
    if (k.key === 'Enter' || k.key === 'Escape' || (mod && /^[a-z]$/i.test(k.key))) {
      push('key', `${mod ? (k.metaKey ? 'Cmd+' : 'Ctrl+') : ''}${k.key}`, { field: inField && target ? fieldName(target) : undefined })
    }
  }, { capture: true })
  on('copy', () => { const text = String(window.getSelection() || ''); push('copy', `${text.length} chars`, { text: clean(text, 200) }) })
  on('cut', () => { const text = String(window.getSelection() || ''); push('cut', `${text.length} chars`, { text: clean(text, 200) }) })
  on('paste', (e) => { const text = (e as ClipboardEvent).clipboardData?.getData('text') || ''; const t = e.target; push('paste', `${text.length} chars`, { text: clean(text, 200), field: t instanceof Element ? fieldName(t) : undefined }) })
  on('visibilitychange', () => push(document.visibilityState === 'hidden' ? 'tab_hidden' : 'tab_visible'))
  on('mousemove', bump)
  on('touchstart', bump)
  let scrollTimer = 0
  onWindow('scroll', () => {
    bump()
    if (scrollTimer) return
    scrollTimer = window.setTimeout(() => {
      scrollTimer = 0
      if (!state) return
      const depth = scrollDepth()
      if (depth > state.maxScroll) state.maxScroll = depth
      for (const m of [25, 50, 75, 100]) {
        if (depth >= m && !state.scrollMilestones.has(m)) { state.scrollMilestones.add(m); push('scroll', `${m}%`, { depth }) }
      }
    }, 500)
  })
  onWindow('focus', () => push('window_focus'))
  onWindow('blur', () => push('window_blur'))
  let resizeTimer = 0
  onWindow('resize', () => { if (resizeTimer) window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => push('resize', `${window.innerWidth}x${window.innerHeight}`), 500) })
  onWindow('error', (e) => push('js_error', clean((e as ErrorEvent).message, 200)))
  onWindow('unhandledrejection', (e) => push('js_error', clean(String((e as PromiseRejectionEvent).reason), 200)))
  onWindow('beforeprint', () => push('print'))
  onWindow('pagehide', () => { leavePage('unload'); push('unload', undefined, undefined, state ? Date.now() - state.pageStart : undefined); flush(true) })
}

function patchFetch() {
  if (!state) return
  const original = state.originalFetch
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    const path = pathOnly(url)
    const isApi = path.startsWith('/api/') && (typeof input === 'string' ? !/^https?:/i.test(input) || input.startsWith(location.origin) : true)
    if (!isApi || path.startsWith('/api/qa-activity')) return original(input, init)
    const method = (init?.method || (typeof input !== 'string' && !(input instanceof URL) ? input.method : 'GET') || 'GET').toUpperCase()
    const t0 = performance.now()
    try {
      const res = await original(input, init)
      push('api_call', `${method} ${path.slice(0, 160)}`, { status: res.status, ok: res.ok }, performance.now() - t0)
      return res
    } catch (error) {
      push('api_call', `${method} ${path.slice(0, 160)}`, { error: clean(String(error), 160) }, performance.now() - t0)
      throw error
    }
  }
  state.cleanups.push(() => { window.fetch = original })
}

function start(session: Session) {
  if (state) return
  let sid = ''
  let fresh = false
  try { sid = sessionStorage.getItem('qa_sid') || '' } catch { /* private mode */ }
  if (!sid) {
    sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
    fresh = true
    try { sessionStorage.setItem('qa_sid', sid) } catch { /* ignore */ }
  }
  state = {
    session, sid, queue: [], timers: [], lastActivity: Date.now(), pageStart: Date.now(), pagePath: '', maxScroll: 0,
    scrollMilestones: new Set(), inputTimers: new Map(), cleanups: [], originalFetch: window.fetch.bind(window),
  }
  if (fresh) push('session_start', session.email, { platform: session.platform, screen: `${screen.width}x${screen.height}`, viewport: `${window.innerWidth}x${window.innerHeight}`, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, lang: navigator.language, referrer: document.referrer.slice(0, 200) })
  push('login', session.email, { platform: session.platform, resumed: !fresh })
  enterPage(null)
  installListeners()
  patchFetch()
  state.timers.push(window.setInterval(() => {
    if (!state) return
    const idleMs = Date.now() - state.lastActivity
    const active = document.visibilityState === 'visible' && idleMs < IDLE_MS
    push('heartbeat', active ? 'active' : 'idle', { active, idleMs, depth: scrollDepth() })
  }, HEARTBEAT_MS))
  state.timers.push(window.setInterval(() => flush(), FLUSH_MS))
}

function stop() {
  if (!state) return
  push('logout', state.session.email)
  leavePage('logout')
  flush(true)
  for (const t of state.timers) window.clearInterval(t)
  for (const c of state.cleanups) c()
  try { sessionStorage.removeItem('qa_sid') } catch { /* ignore */ }
  state = null
}

/** Starts or stops tracking depending on whether a QA session exists right now. */
export function syncQaTracker() {
  const session = qaSession()
  if (session && !state) start(session)
  else if (!session && state) stop()
  else if (session && state && session.token !== state.session.token) state.session = session
}
