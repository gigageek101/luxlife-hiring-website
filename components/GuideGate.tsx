'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface SimUser {
  telegramUsername: string
  email: string
}

interface Props {
  slug: string
  html: string
}

const STORAGE_KEY = 'sim_user'
const FLUSH_EVERY_MS = 15000
const COMPLETE_AT_PERCENT = 97

function readStoredUser(): SimUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.telegramUsername && parsed?.email ? { telegramUsername: parsed.telegramUsername, email: parsed.email } : null
  } catch {
    return null
  }
}

function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

/** Same passwordless login as the simulations: registered Telegram username + email. */
function ReaderLogin({ onLogin }: { onLogin: (user: SimUser) => void }) {
  const [telegram, setTelegram] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/simulation-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramUsername: telegram.trim().replace(/^@/, ''), email: email.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      onLogin({ telegramUsername: data.user.telegramUsername, email: data.user.email })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="guide-gate">
      <p className="guide-gate-title">Who is reading?</p>
      <p className="guide-gate-text">Your reading is part of your training record. Use the same Telegram username and email as in the training portal, then the guide opens.</p>
      <div className="guide-gate-fields">
        <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram username" autoComplete="username" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" autoComplete="email" required />
        <button type="submit" disabled={busy}>{busy ? 'Checking…' : 'Open the guide'}</button>
      </div>
      {error && <p className="guide-gate-error">{error}</p>}
    </form>
  )
}

/** Gates the guide behind the trainee identity and reports how far they read. */
export default function GuideGate({ slug, html }: Props) {
  const [user, setUser] = useState<SimUser | null | undefined>(undefined)
  const [percent, setPercent] = useState(0)
  const [completed, setCompleted] = useState(false)
  const articleRef = useRef<HTMLElement | null>(null)
  const state = useRef({ sessionId: newSessionId(), maxScroll: 0, seconds: 0, completed: false, dirty: true })

  useEffect(() => {
    setUser(readStoredUser())
  }, [])

  const send = useCallback((useBeacon: boolean) => {
    if (!user || !state.current.dirty) return
    const payload = JSON.stringify({
      sessionId: state.current.sessionId,
      slug,
      telegramUsername: user.telegramUsername,
      email: user.email,
      maxScroll: state.current.maxScroll,
      seconds: state.current.seconds,
      completed: state.current.completed,
    })
    state.current.dirty = false
    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon('/api/guides/track', new Blob([payload], { type: 'application/json' }))
      return
    }
    fetch('/api/guides/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {
      state.current.dirty = true
    })
  }, [slug, user])

  useEffect(() => {
    if (!user) return
    const measure = () => {
      const article = articleRef.current
      if (!article) return
      const top = article.getBoundingClientRect().top + window.scrollY
      const seen = window.scrollY + window.innerHeight - top
      const pct = Math.max(0, Math.min(100, Math.round((seen / Math.max(1, article.offsetHeight)) * 100)))
      if (pct > state.current.maxScroll) {
        state.current.maxScroll = pct
        state.current.dirty = true
        setPercent(pct)
        if (pct >= COMPLETE_AT_PERCENT && !state.current.completed) {
          state.current.completed = true
          setCompleted(true)
          send(false)
        }
      }
    }
    const tick = () => {
      if (document.visibilityState === 'visible') {
        state.current.seconds += 5
        state.current.dirty = true
      }
    }
    const flush = () => send(false)
    const leave = () => send(true)
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') leave()
    }
    send(false)
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    window.addEventListener('pagehide', leave)
    document.addEventListener('visibilitychange', onVisibility)
    const seconds = setInterval(tick, 5000)
    const flusher = setInterval(flush, FLUSH_EVERY_MS)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      window.removeEventListener('pagehide', leave)
      document.removeEventListener('visibilitychange', onVisibility)
      clearInterval(seconds)
      clearInterval(flusher)
      leave()
    }
  }, [user, send])

  if (user === undefined) return <div className="guide-gate-loading">Loading…</div>
  if (!user) return <ReaderLogin onLogin={setUser} />

  return (
    <>
      <div className="guide-reader-bar">
        <span>Reading as <strong>@{user.telegramUsername.replace(/^@/, '')}</strong></span>
        <span className="guide-reader-progress">{completed ? '✓ finished' : `${percent}% read`}</span>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY)
            setUser(null)
          }}
        >
          not you?
        </button>
      </div>
      <article ref={articleRef} className="guide" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
