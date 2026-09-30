'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, FileText, ExternalLink, Loader2, LogIn, Play, Send, StickyNote, Timer, X } from 'lucide-react'
import Link from 'next/link'
import GuideLinks from '@/components/GuideLinks'
import SimulationResults, { type Evaluation } from '@/components/simulation/SimulationResults'
import { SIMULATIONS, weightedScore, type SimulationType } from '@/lib/simulations'

interface ChatMessage { id: string; role: 'creator' | 'subscriber' | 'system'; content: string }
interface SimUser { id?: number; telegramUsername: string; email: string }
type Phase = 'login' | 'intro' | 'chatting' | 'evaluating' | 'results'
interface RecordedEvent { t: number; e: string; d: string }

const DURATIONS = [0, 5, 10] as const
const REPLY_DELAY_MS = 2000

/** Generic practice simulation: the AI plays the subscriber, a grader scores the creator. */
export default function PracticeSimulation({ type }: { type: SimulationType }) {
  const config = SIMULATIONS[type]
  const [phase, setPhase] = useState<Phase>('login')
  const [user, setUser] = useState<SimUser | null>(null)
  const [loginTelegram, setLoginTelegram] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginBusy, setLoginBusy] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [showNotesMobile, setShowNotesMobile] = useState(false)
  const messagesRef = useRef<ChatMessage[]>([])
  const sessionRef = useRef<Record<string, unknown>>({})
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stats = useRef({ typed: 0, pasted: 0, words: 0, typingMs: 0, typingStart: 0, lastPaste: false, start: 0, recording: [] as RecordedEvent[] })
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesRef.current = messages
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight })
  }, [messages])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sim_user')
      if (stored) {
        setUser(JSON.parse(stored))
        setPhase('intro')
      }
    } catch { /* stay on login */ }
  }, [])

  const record = useCallback((e: string, d = '') => {
    if (stats.current.start) stats.current.recording.push({ t: Date.now() - stats.current.start, e, d })
  }, [])

  const login = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/simulation-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telegramUsername: loginTelegram.trim().replace(/^@/, ''), email: loginEmail.trim() }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('sim_user', JSON.stringify(data.user))
      setUser(data.user)
      setPhase('intro')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoginBusy(false)
    }
  }

  const appendSubscriberLines = useCallback(async (reply: string) => {
    const lines = reply.split('\n').map((l) => l.trim()).filter(Boolean)
    for (let i = 0; i < lines.length; i++) {
      if (i) await new Promise((r) => setTimeout(r, 600))
      record('r', lines[i])
      setMessages((prev) => [...prev, { id: `sub-${Date.now()}-${i}`, role: 'subscriber', content: lines[i] }])
    }
  }, [record])

  const fetchReply = useCallback(async () => {
    const real = messagesRef.current.filter((m) => m.role !== 'system')
    if (real.length && real[real.length - 1].role !== 'creator') return
    setIsTyping(true)
    record('y')
    setError(null)
    try {
      const response = await fetch(config.chatApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: real.map((m) => ({ role: m.role, content: m.content })), ...sessionRef.current }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to get response')
      await appendSubscriberLines(String(data.reply || ''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsTyping(false)
      record('z')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [appendSubscriberLines, config.chatApi, record])

  const scheduleReply = useCallback(() => {
    if (replyTimer.current) clearTimeout(replyTimer.current)
    replyTimer.current = setTimeout(fetchReply, REPLY_DELAY_MS)
  }, [fetchReply])

  const start = () => {
    sessionRef.current = config.createSession()
    stats.current = { typed: 0, pasted: 0, words: 0, typingMs: 0, typingStart: 0, lastPaste: false, start: Date.now(), recording: [] }
    setMessages([{ id: 'system-start', role: 'system', content: config.startNote }])
    record('x', config.startNote)
    setNotes('')
    setError(null)
    setEvaluation(null)
    setTimeLeft(duration * 60)
    setPhase('chatting')
    if (config.opener === 'subscriber') setTimeout(fetchReply, 400)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const send = () => {
    const text = input.trim()
    if (!text || isTyping) return
    const s = stats.current
    if (s.lastPaste) s.pasted += 1
    else s.typed += 1
    if (s.typingStart) s.typingMs += Date.now() - s.typingStart
    s.typingStart = 0
    s.lastPaste = false
    s.words += text.split(/\s+/).length
    record('s', text)
    setMessages((prev) => [...prev, { id: `creator-${Date.now()}`, role: 'creator', content: text }])
    setInput('')
    setError(null)
    scheduleReply()
  }

  const onInputChange = (value: string) => {
    if (!stats.current.typingStart && value) stats.current.typingStart = Date.now()
    setInput(value)
    if (replyTimer.current) scheduleReply()
  }

  const endConversation = useCallback(async () => {
    if (replyTimer.current) clearTimeout(replyTimer.current)
    const real = messagesRef.current.filter((m) => m.role !== 'system')
    if (real.length < 4) {
      setError('Please exchange at least a few more messages before ending the conversation.')
      return
    }
    setPhase('evaluating')
    setError(null)
    try {
      const payload = real.map((m) => ({ role: m.role, content: m.content }))
      const response = await fetch(config.evaluateApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: payload, notes, ...sessionRef.current }) })
      const data = await response.json().catch(() => ({ error: 'Failed to evaluate' }))
      if (!response.ok) throw new Error(data.error || 'Failed to evaluate')
      setEvaluation(data.evaluation)
      setPhase('results')
      if (user && data.evaluation) {
        const s = stats.current
        await fetch('/api/simulation/save-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telegramUsername: user.telegramUsername, email: user.email,
            overallScore: weightedScore(data.evaluation.categories || [], config.categoryWeights),
            categories: data.evaluation.categories, overallFeedback: data.evaluation.overallFeedback, notes,
            conversation: payload, durationMode: duration === 0 ? 'free' : `${duration}min`,
            messageCount: real.filter((m) => m.role === 'creator').length, typedCount: s.typed, pasteCount: s.pasted,
            wpm: s.typingMs > 0 ? Math.round((s.words / (s.typingMs / 60000)) * 10) / 10 : 0,
            sessionRecording: s.recording, simulationType: config.type,
          }),
        }).catch(() => console.error('Failed to save simulation report'))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate')
      setPhase('chatting')
    }
  }, [config, duration, notes, user])

  useEffect(() => {
    if (phase !== 'chatting' || duration === 0) return
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    return () => clearInterval(timer)
  }, [phase, duration])

  useEffect(() => {
    if (phase === 'chatting' && duration > 0 && timeLeft === 0) endConversation()
  }, [phase, duration, timeLeft, endConversation])

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className={phase === 'chatting' ? 'max-w-7xl mx-auto px-4' : 'max-w-4xl mx-auto px-4'}>
        {phase === 'login' && (
          <form onSubmit={login} className="max-w-md mx-auto rounded-2xl p-8 space-y-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{config.emoji} {config.title}</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Log in with the Telegram username and email you registered in the training portal.</p>
            <input value={loginTelegram} onChange={(e) => setLoginTelegram(e.target.value)} placeholder="Telegram username" required className="w-full px-4 py-3 rounded-xl" style={{ border: '1px solid var(--border)' }} />
            <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Email" type="email" required className="w-full px-4 py-3 rounded-xl" style={{ border: '1px solid var(--border)' }} />
            {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
            <button type="submit" disabled={loginBusy} className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2" style={{ background: config.gradient }}>
              {loginBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Continue
            </button>
          </form>
        )}

        {phase === 'intro' && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl" style={{ background: config.gradient }}>{config.emoji}</div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{config.title} Simulation</h1>
            <p className="text-lg max-w-2xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }}>{config.intro}</p>
            {user && <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Logged in as @{user.telegramUsername.replace(/^@/, '')} · <button onClick={() => { localStorage.removeItem('sim_user'); setUser(null); setPhase('login') }} className="underline">switch</button></p>}
            <div className="max-w-2xl mx-auto rounded-2xl p-6 mb-6 text-left" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#92400e' }}>Read the Guide First!</h3>
              <p className="text-sm mb-3" style={{ color: '#78350f' }}>Do <strong>not</strong> start this simulation before reading the {config.guideTitle} multiple times and taking notes. The grader scores you on exactly that method.</p>
              <Link href={`/guides/${config.guideSlug}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: '#d97706' }}>
                <FileText className="w-4 h-4" /> Read the {config.guideTitle} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <GuideLinks />
            <div className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
              <div className="space-y-4">
                {config.howItWorks.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: config.color }}>{i + 1}</div>
                    <p className="text-sm pt-1.5" style={{ color: 'var(--text-secondary)' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background: duration === d ? config.color : 'var(--bg-secondary)', color: duration === d ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border)' }}>
                  {d === 0 ? 'Free (no timer)' : `${d} minutes`}
                </button>
              ))}
            </div>
            <button onClick={start} className="px-10 py-4 rounded-2xl font-bold text-white text-lg inline-flex items-center gap-3" style={{ background: config.gradient }}>
              <Play className="w-5 h-5" /> Start Simulation
            </button>
          </div>
        )}

        {phase === 'chatting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4" style={{ height: 'calc(100vh - 140px)' }}>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between px-4 md:px-6 py-3 rounded-t-2xl flex-shrink-0" style={{ background: 'var(--color-black)', color: 'var(--text-on-black)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: config.color }}>👤</div>
                  <div>
                    <p className="font-semibold text-white text-sm">Subscriber · {config.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted-on-black)' }}>{messages.filter((m) => m.role === 'creator').length} messages sent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold" style={{ background: 'rgba(255,255,255,0.1)', color: timeLeft <= 30 && duration > 0 ? '#fca5a5' : '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Timer className="w-3.5 h-3.5" /> {duration > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Free'}
                  </div>
                  <button onClick={() => setShowNotesMobile(!showNotesMobile)} className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}><StickyNote className="w-3.5 h-3.5" /></button>
                  <button onClick={endConversation} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5" style={{ background: config.gradient }}>
                    <Award className="w-3.5 h-3.5" /> <span className="hidden sm:inline">End & Get Score</span><span className="sm:hidden">End</span>
                  </button>
                </div>
              </div>
              <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ background: '#f0f0f0', overflowAnchor: 'none' }}>
                {messages.map((m) => m.role === 'system' ? (
                  <div key={m.id} className="flex justify-center my-2"><span className="text-xs italic px-3 py-1 rounded-full text-center" style={{ background: 'rgba(0,0,0,0.06)', color: '#666' }}>{m.content}</span></div>
                ) : (
                  <div key={m.id} className={`flex ${m.role === 'creator' ? 'justify-end' : 'justify-start'} mb-1.5`}>
                    <div className="max-w-[75%] px-4 py-2.5 rounded-2xl" style={{ background: m.role === 'creator' ? config.color : '#fff', color: m.role === 'creator' ? '#fff' : '#000', borderBottomRightRadius: m.role === 'creator' ? '4px' : '18px', borderBottomLeftRadius: m.role === 'subscriber' ? '4px' : '18px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-1.5"><div className="px-4 py-3 rounded-2xl" style={{ background: '#fff', borderBottomLeftRadius: '4px' }}><div className="flex gap-1.5">{[0, 150, 300].map((d) => <div key={d} className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#999', animationDelay: `${d}ms` }} />)}</div></div></div>
                )}
              </div>
              {error && <div className="px-4 py-2 text-sm font-semibold text-red-600" style={{ background: '#fef2f2' }}>{error}</div>}
              <div className="px-4 py-3 rounded-b-2xl flex-shrink-0" style={{ background: '#fff', borderTop: '1px solid #e5e5e5' }}>
                <div className="flex items-center gap-3">
                  <input ref={inputRef} type="text" value={input} onChange={(e) => onInputChange(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send() } }} onPaste={() => { stats.current.lastPaste = true; record('p') }} placeholder="Type your message as the creator..." disabled={isTyping} className="flex-1 px-4 py-3 rounded-full text-[15px] outline-none" style={{ background: '#f0f0f0', color: '#000' }} />
                  <button onClick={send} disabled={!input.trim() || isTyping} className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40" style={{ background: input.trim() ? config.color : '#d1d5db' }}><Send className="w-5 h-5 text-white" style={{ transform: 'rotate(-45deg)', marginLeft: '2px' }} /></button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: '#999' }}>{config.inputHint}</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-col w-80 flex-shrink-0">
              <div className="flex items-center gap-2 px-4 py-3 rounded-t-2xl" style={{ background: 'var(--color-black)', color: '#fff' }}><StickyNote className="w-4 h-4" /><span className="font-semibold text-sm">Notes</span></div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={config.notesPlaceholder} className="flex-1 w-full p-4 text-sm resize-none outline-none" style={{ background: '#fffef0', border: '1px solid #e8e4c9', borderTop: 'none', borderRadius: '0 0 16px 16px', color: '#4a4520', lineHeight: '1.7' }} />
            </div>
            <AnimatePresence>
              {showNotesMobile && (
                <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="lg:hidden fixed inset-y-0 right-0 w-80 z-50 flex flex-col shadow-2xl" style={{ top: '80px' }}>
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-black)', color: '#fff' }}><span className="font-semibold text-sm flex items-center gap-2"><StickyNote className="w-4 h-4" /> Notes</span><button onClick={() => setShowNotesMobile(false)}><X className="w-4 h-4" /></button></div>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={config.notesPlaceholder} className="flex-1 w-full p-4 text-sm resize-none outline-none" style={{ background: '#fffef0', color: '#4a4520', lineHeight: '1.7' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {phase === 'evaluating' && (
          <div className="text-center py-24">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-6" style={{ color: config.color }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Grading your conversation…</h2>
            <p style={{ color: 'var(--text-secondary)' }}>The coach reads every message against the {config.guideTitle}. This takes about 20 seconds.</p>
          </div>
        )}

        {phase === 'results' && evaluation && <SimulationResults config={config} evaluation={evaluation} messages={messages} onRestart={() => setPhase('intro')} />}
      </div>
    </div>
  )
}
