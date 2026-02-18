'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, MessageCircle, Award, ChevronDown, ChevronUp, Sparkles, AlertCircle, Clock, Timer, StickyNote, X, LogIn, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'creator' | 'subscriber'
  content: string
  timestamp: Date
}

interface CategoryResult {
  name: string
  score: number
  feedback: string
  examples: {
    good: string[]
    needsWork: string[]
  }
  advice: string
}

interface OverallFeedback {
  strengths: string[]
  weaknesses: string[]
  missedOpportunities: string[]
  practiceScenarios: string[]
  summary: string
}

interface EvaluationResult {
  overallScore: number
  categories: CategoryResult[]
  overallFeedback: OverallFeedback | string
}

interface SimUser {
  id: number
  telegramUsername: string
  email: string
}

const DURATION_OPTIONS = [
  { label: 'Free Mode', minutes: 0, description: 'End when you want', icon: '∞' },
  { label: 'Quick', minutes: 1, description: 'Fast opener practice', icon: '1' },
  { label: 'Standard', minutes: 3, description: 'Full conversation flow', icon: '3' },
  { label: 'Extended', minutes: 5, description: 'Deep relationship building', icon: '5' },
] as const

const SUBSCRIBER_PROFILES = [
  "Name: Mike, Age: 42, Job: Electrician/Lineman, Location: Texas, Hobbies: Fishing and watching football, Has a dog named Duke, Drives a lifted F-250, Height: 5'9\"",
  "Name: Brandon, Age: 38, Job: Mechanic, Location: Ohio, Hobbies: Working on trucks and hunting, Divorced, has a 12-year-old son, Height: 5'8\"",
  "Name: Tommy, Age: 47, Job: Truck Driver (long haul), Location: Kentucky, Hobbies: Fishing and camping, Owns his home, Has two dogs, Height: 5'10\"",
  "Name: Austin, Age: 35, Job: Construction worker/Welder, Location: Florida, Hobbies: Going to the shooting range and working on his truck, Single, Height: 5'11\"",
  "Name: Scott, Age: 44, Job: Plumber, Location: Indiana, Hobbies: Deer hunting and grilling steaks, Has two kids, Owns his home, Height: 5'7\"",
  "Name: Jake, Age: 40, Job: Carpenter, Location: Montana, Hobbies: Hunting elk and camping, Has a German Shepherd, Height: 6'0\"",
  "Name: Dustin, Age: 36, Job: HVAC Technician, Location: Georgia, Hobbies: Bass fishing and NASCAR, Recently divorced, Height: 5'8\"",
  "Name: Travis, Age: 50, Job: Farmer/Rancher, Location: Oklahoma, Hobbies: Hunting and horseback riding, Has 3 kids, Owns 200 acres, Height: 5'9\"",
]

function getScoreColor(score: number): string {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#f97316'
  return '#ef4444'
}

function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Average'
  if (score >= 3) return 'Below Average'
  return 'Needs Work'
}

export default function ChattingSimulationPage() {
  const [phase, setPhase] = useState<'login' | 'intro' | 'chatting' | 'evaluating' | 'results'>('login')
  const [simUser, setSimUser] = useState<SimUser | null>(null)
  const [loginTelegram, setLoginTelegram] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [subscriberProfile, setSubscriberProfile] = useState('')
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [selectedDuration, setSelectedDuration] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesMobile, setShowNotesMobile] = useState(false)
  const [waitingForIdle, setWaitingForIdle] = useState(false)
  const [pasteCount, setPasteCount] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const lastInputWasPaste = useRef(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endConversationRef = useRef<(() => Promise<void>) | null>(null)
  const replyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const profileRef = useRef('')

  useEffect(() => {
    const stored = localStorage.getItem('sim_user')
    if (stored) {
      try {
        const user = JSON.parse(stored) as SimUser
        setSimUser(user)
        setPhase('intro')
      } catch { /* ignore */ }
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/auth/simulation-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: loginTelegram,
          email: loginEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      const user = data.user as SimUser
      setSimUser(user)
      localStorage.setItem('sim_user', JSON.stringify(user))
      setPhase('intro')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sim_user')
    setSimUser(null)
    setPhase('login')
    resetSimulation()
  }

  const scrollToBottom = useCallback(() => {
    const container = chatContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom())
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  useEffect(() => {
    profileRef.current = subscriberProfile
  }, [subscriberProfile])

  const resetReplyTimer = useCallback(() => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current)
    }
  }, [])

  const fetchAIReply = useCallback(async () => {
    const currentMessages = messagesRef.current
    const lastMsg = currentMessages[currentMessages.length - 1]
    if (!lastMsg || lastMsg.role !== 'creator') return

    setWaitingForIdle(false)
    setIsTyping(true)
    setError(null)

    try {
      const allMessages = currentMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          subscriberProfile: profileRef.current,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to get response')
      }

      const data = await response.json()
      const subscriberLines = data.reply.split('\n').filter((l: string) => l.trim())

      for (let i = 0; i < subscriberLines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 600))
        setMessages(prev => [...prev, {
          id: `sub-${Date.now()}-${i}`,
          role: 'subscriber',
          content: subscriberLines[i].trim(),
          timestamp: new Date(),
        }])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  const scheduleReply = useCallback(() => {
    resetReplyTimer()
    setWaitingForIdle(true)
    replyTimeoutRef.current = setTimeout(() => {
      fetchAIReply()
    }, 1000)
  }, [resetReplyTimer, fetchAIReply])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimerActive(false)
          endConversationRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerActive, timeLeft])

  const startSimulation = async () => {
    const profile = SUBSCRIBER_PROFILES[Math.floor(Math.random() * SUBSCRIBER_PROFILES.length)]
    setSubscriberProfile(profile)
    setPhase('chatting')
    setMessages([])
    setMessageCount(0)
    setError(null)
    setNotes('')
    setPasteCount(0)
    setTypedCount(0)
    lastInputWasPaste.current = false
    if (selectedDuration > 0) {
      setTimeLeft(selectedDuration * 60)
      setTimerActive(true)
    } else {
      setTimeLeft(0)
      setTimerActive(false)
    }

    setIsTyping(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          subscriberProfile: profile,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to start simulation')
      }

      const data = await response.json()
      const subscriberLines = data.reply.split('\n').filter((l: string) => l.trim())

      for (let i = 0; i < subscriberLines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 600))
        setMessages(prev => [...prev, {
          id: `sub-init-${i}`,
          role: 'subscriber',
          content: subscriberLines[i].trim(),
          timestamp: new Date(),
        }])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
    } finally {
      setIsTyping(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const sendMessage = () => {
    if (!inputValue.trim() || isTyping) return

    if (lastInputWasPaste.current) {
      setPasteCount(prev => prev + 1)
    } else {
      setTypedCount(prev => prev + 1)
    }

    const userMessage: ChatMessage = {
      id: `creator-${Date.now()}`,
      role: 'creator',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setMessageCount(prev => prev + 1)
    setInputValue('')
    setError(null)
    lastInputWasPaste.current = false
    scheduleReply()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (waitingForIdle && value.length > 0) {
      scheduleReply()
    }
  }

  const endConversation = useCallback(async () => {
    setTimerActive(false)
    resetReplyTimer()
    setWaitingForIdle(false)

    if (messages.length < 4) {
      setError('Please exchange at least a few more messages before ending the conversation.')
      return
    }

    setPhase('evaluating')
    setError(null)

    try {
      const allMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/evaluate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to evaluate conversation')
      }

      const data = await response.json()
      setEvaluation(data.evaluation)
      setPhase('results')

      if (simUser && data.evaluation) {
        try {
          await fetch('/api/simulation/save-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramUsername: simUser.telegramUsername,
              email: simUser.email,
              overallScore: data.evaluation.overallScore,
              categories: data.evaluation.categories,
              overallFeedback: data.evaluation.overallFeedback,
              notes,
              conversation: messages.map(m => ({ role: m.role, content: m.content })),
              durationMode: selectedDuration === 0 ? 'free' : `${selectedDuration}min`,
              messageCount,
              typedCount,
              pasteCount,
            })
          })
        } catch {
          console.error('Failed to save simulation report')
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
      setPhase('chatting')
    }
  }, [messages, resetReplyTimer, simUser, notes, selectedDuration, messageCount, typedCount, pasteCount])

  useEffect(() => {
    endConversationRef.current = endConversation
  }, [endConversation])

  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const resetSimulation = () => {
    resetReplyTimer()
    setPhase('intro')
    setMessages([])
    setInputValue('')
    setEvaluation(null)
    setExpandedCategories(new Set())
    setError(null)
    setMessageCount(0)
    setTimeLeft(0)
    setTimerActive(false)
    setNotes('')
    setShowNotesMobile(false)
    setWaitingForIdle(false)
    setPasteCount(0)
    setTypedCount(0)
    lastInputWasPaste.current = false
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className={phase === 'chatting' ? 'max-w-7xl mx-auto px-4' : 'max-w-4xl mx-auto px-4'}>

        {/* LOGIN PHASE */}
        {phase === 'login' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
              >
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Chatting Simulation
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Sign in with your training account to continue
              </p>
            </div>

            <div className="rounded-2xl p-8" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="p-4 rounded-xl text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    {loginError}
                  </div>
                )}

                <div>
                  <label htmlFor="sim-telegram" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Telegram Username
                  </label>
                  <input
                    type="text"
                    id="sim-telegram"
                    value={loginTelegram}
                    onChange={(e) => setLoginTelegram(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    placeholder="@username"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sim-email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="sim-email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', opacity: loginLoading ? 0.7 : 1 }}
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Continue to Simulation
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Use the same Telegram username and email you registered with in the training portal. No password needed.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mb-8">
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
              >
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Chatting Simulation
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }}>
                Practice your subscriber relationship building skills in a realistic simulation. 
                An AI subscriber will message you first — handle the conversation like a pro.
              </p>
              {simUser && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    Signed in as {simUser.telegramUsername}
                  </span>
                  <button onClick={handleLogout} className="text-sm font-medium underline" style={{ color: 'var(--text-muted)' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div
              className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--accent)' }}>1</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Subscriber Messages First</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A random blue-collar subscriber will open the conversation. Respond as the creator.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--accent)' }}>2</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Chat Naturally</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Follow the conversation flow: get his name, learn about his job, validate his work, mirror his hobbies, and build a genuine connection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--accent)' }}>3</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Take Notes & Get Scored</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Use the notes panel to track subscriber info. End the conversation to get a detailed evaluation.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(255, 107, 53, 0.08)', border: '1px solid rgba(255, 107, 53, 0.2)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  You&apos;ll be rated on: American accent, grammar, caring about the subscriber, asking the right questions, making him feel special, and giving him what he wants to hear.
                </p>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-5 h-5 inline-block mr-2 mb-0.5" />
                Choose Duration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => setSelectedDuration(opt.minutes)}
                    className="rounded-2xl p-5 text-center transition-all duration-200 hover:scale-[1.03]"
                    style={{
                      background: selectedDuration === opt.minutes ? 'var(--accent)' : 'var(--bg-primary)',
                      color: selectedDuration === opt.minutes ? '#ffffff' : 'var(--text-primary)',
                      border: selectedDuration === opt.minutes ? '2px solid var(--accent)' : '2px solid var(--border)',
                      boxShadow: selectedDuration === opt.minutes ? '0 4px 20px rgba(255, 107, 53, 0.3)' : 'var(--shadow-sm)',
                    }}
                  >
                    <div className="text-3xl font-black mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{opt.label}</div>
                    <div className="text-xs mt-2" style={{ color: selectedDuration === opt.minutes ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startSimulation} className="btn-primary text-lg px-10 py-4">
              <Sparkles className="w-5 h-5" />
              {selectedDuration === 0 ? 'Start Free Simulation' : `Start ${selectedDuration}-Minute Simulation`}
            </button>
          </motion.div>
        )}

        {/* CHATTING PHASE */}
        {phase === 'chatting' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-4"
            style={{ height: 'calc(100vh - 140px)' }}
          >
            {/* Chat Column */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div
                className="flex items-center justify-between px-4 md:px-6 py-3 rounded-t-2xl flex-shrink-0"
                style={{ background: 'var(--color-black)', color: 'var(--text-on-black)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: 'var(--accent)' }}>👤</div>
                  <div>
                    <p className="font-semibold text-white text-sm">New Subscriber</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted-on-black)' }}>
                      {messageCount > 0 ? `${messageCount} messages sent` : 'Just subscribed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDuration > 0 ? (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold"
                      style={{
                        background: timeLeft <= 30 ? 'rgba(239, 68, 68, 0.2)' : timeLeft <= 60 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: timeLeft <= 30 ? '#fca5a5' : timeLeft <= 60 ? '#fdba74' : '#ffffff',
                        border: `1px solid ${timeLeft <= 30 ? 'rgba(239, 68, 68, 0.4)' : timeLeft <= 60 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                      }}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                    >
                      <Timer className="w-3.5 h-3.5" />
                      Free
                    </div>
                  )}
                  {/* Mobile notes toggle */}
                  <button
                    onClick={() => setShowNotesMobile(!showNotesMobile)}
                    className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={endConversation}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', color: 'white' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">End & Get Score</span>
                      <span className="sm:hidden">End</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Chat Messages — stable, no layout-shifting animations */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{ background: '#f0f0f0', overflowAnchor: 'none' }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'creator' ? 'justify-end' : 'justify-start'} mb-1.5`}
                  >
                    <div
                      className="max-w-[75%] px-4 py-2.5 rounded-2xl"
                      style={{
                        background: message.role === 'creator' ? 'var(--accent)' : '#ffffff',
                        color: message.role === 'creator' ? '#ffffff' : '#000000',
                        borderBottomRightRadius: message.role === 'creator' ? '4px' : '18px',
                        borderBottomLeftRadius: message.role === 'subscriber' ? '4px' : '18px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start mb-1.5">
                    <div
                      className="px-4 py-3 rounded-2xl"
                      style={{ background: '#ffffff', borderBottomLeftRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}
                    >
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#999', animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#999', animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#999', animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="px-4 py-2 flex-shrink-0" style={{ background: '#fef2f2' }}>
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}

              {/* Input Area */}
              <div className="px-4 py-3 rounded-b-2xl flex-shrink-0" style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
                <div className="flex items-center gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={() => { lastInputWasPaste.current = true }}
                    placeholder="Type your message as the creator..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-full text-[15px] outline-none transition-all duration-200"
                    style={{ background: '#f0f0f0', color: '#000000', border: '1px solid transparent' }}
                    onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--accent)'; e.currentTarget.style.background = '#ffffff' }}
                    onBlur={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = '#f0f0f0' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                    style={{ background: inputValue.trim() ? 'var(--accent)' : '#d1d5db' }}
                  >
                    <Send className="w-5 h-5 text-white" style={{ transform: 'rotate(-45deg)', marginLeft: '2px' }} />
                  </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: '#999' }}>
                  one sentence per message &bull; use &quot;u&quot; not &quot;you&quot; &bull; lowercase everything &bull; react first then ask
                </p>
              </div>
            </div>

            {/* Notes Panel — Desktop (always visible) */}
            <div className="hidden lg:flex flex-col w-80 flex-shrink-0">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-t-2xl flex-shrink-0"
                style={{ background: 'var(--color-black)', color: 'white' }}
              >
                <StickyNote className="w-4 h-4" />
                <span className="font-semibold text-sm">Subscriber Notes</span>
              </div>
              <div className="flex-1 flex flex-col" style={{ background: '#fffef0', border: '1px solid #e8e4c9', borderTop: 'none', borderRadius: '0 0 16px 16px' }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={"Track subscriber info here...\n\nExample:\n• Name: \n• Age: \n• Location: \n• Job: \n• Hobbies: \n• Kids/Pets: \n• Height: \n• Key details: "}
                  className="flex-1 w-full p-4 text-sm resize-none outline-none"
                  style={{ background: 'transparent', color: '#4a4520', lineHeight: '1.7', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Notes Panel — Mobile (overlay) */}
            <AnimatePresence>
              {showNotesMobile && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.2 }}
                  className="lg:hidden fixed inset-y-0 right-0 w-80 z-50 flex flex-col shadow-2xl"
                  style={{ top: '80px' }}
                >
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--color-black)', color: 'white' }}>
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      <span className="font-semibold text-sm">Subscriber Notes</span>
                    </div>
                    <button onClick={() => setShowNotesMobile(false)} className="p-1 rounded-lg hover:bg-white/10">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col" style={{ background: '#fffef0', border: '1px solid #e8e4c9', borderTop: 'none' }}>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={"Track subscriber info here...\n\nExample:\n• Name: \n• Age: \n• Location: \n• Job: \n• Hobbies: "}
                      className="flex-1 w-full p-4 text-sm resize-none outline-none"
                      style={{ background: 'transparent', color: '#4a4520', lineHeight: '1.7', fontFamily: 'inherit' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* EVALUATING PHASE */}
        {phase === 'evaluating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Analyzing Your Conversation...
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Our AI is reviewing your chatting skills across 6 categories
            </p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: 'var(--accent)', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            {error && (
              <div className="mt-6 p-4 rounded-xl" style={{ background: '#fef2f2' }}>
                <p className="text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* RESULTS PHASE */}
        {phase === 'results' && evaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overall Score Card */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-6 relative"
                style={{ background: `conic-gradient(${getScoreColor(evaluation.overallScore)} ${evaluation.overallScore * 10}%, #e5e7eb ${evaluation.overallScore * 10}%)` }}
              >
                <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                  <span className="text-4xl font-black" style={{ color: getScoreColor(evaluation.overallScore) }}>{evaluation.overallScore}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>/10</span>
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Score: {evaluation.overallScore}/10</h2>
              <p className="text-lg" style={{ color: getScoreColor(evaluation.overallScore) }}>{getScoreLabel(evaluation.overallScore)}</p>
            </div>

            {/* Category Scores Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {evaluation.categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-primary)',
                    border: `2px solid ${expandedCategories.has(idx) ? getScoreColor(cat.score) : 'var(--border)'}`,
                    boxShadow: expandedCategories.has(idx) ? `0 4px 20px ${getScoreColor(cat.score)}20` : 'var(--shadow-sm)',
                  }}
                  onClick={() => toggleCategory(idx)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-black" style={{ color: getScoreColor(cat.score) }}>{cat.score}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span>
                  </div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                  <div className="mt-2 w-full rounded-full h-1.5" style={{ background: '#e5e7eb' }}>
                    <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${cat.score * 10}%`, background: getScoreColor(cat.score) }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Detailed Category Breakdowns */}
            <div className="space-y-4 mb-10">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h3>
              {evaluation.categories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * idx }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <button
                    onClick={() => toggleCategory(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                    style={{ background: expandedCategories.has(idx) ? 'var(--bg-secondary)' : 'transparent' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getScoreColor(cat.score)}15`, color: getScoreColor(cat.score) }}>
                        {cat.score}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                        <p className="text-sm" style={{ color: getScoreColor(cat.score) }}>{getScoreLabel(cat.score)}</p>
                      </div>
                    </div>
                    {expandedCategories.has(idx) ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  <AnimatePresence>
                    {expandedCategories.has(idx) && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-6 pb-6 space-y-4">
                          <div><p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cat.feedback}</p></div>
                          {cat.examples.good.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>What you did well:</p>
                              <div className="space-y-2">
                                {cat.examples.good.map((ex, i) => (
                                  <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)' }}>&ldquo;{ex}&rdquo;</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {cat.examples.needsWork.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#f97316' }}>Areas to improve:</p>
                              <div className="space-y-2">
                                {cat.examples.needsWork.map((ex, i) => (
                                  <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#9a3412', border: '1px solid rgba(249, 115, 22, 0.2)' }}>&ldquo;{ex}&rdquo;</div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="p-4 rounded-xl" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)' }}>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}><Sparkles className="w-4 h-4" />Practice Advice</p>
                            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{cat.advice}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Overall Feedback */}
            <div className="rounded-2xl p-8 mb-8 space-y-6" style={{ background: '#ffffff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overall Assessment</h3>

              {typeof evaluation.overallFeedback === 'object' && evaluation.overallFeedback !== null ? (
                <>
                  {evaluation.overallFeedback.summary && (
                    <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {evaluation.overallFeedback.summary}
                    </p>
                  )}

                  {evaluation.overallFeedback.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                        <span className="w-2 h-2 rounded-full bg-green-500" /> What You Did Well
                      </h4>
                      <div className="space-y-2">
                        {evaluation.overallFeedback.strengths.map((s, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
                            <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.overallFeedback.weaknesses?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#ef4444' }}>
                        <span className="w-2 h-2 rounded-full bg-red-500" /> What Needs Work
                      </h4>
                      <div className="space-y-2">
                        {evaluation.overallFeedback.weaknesses.map((w, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#991b1b' }}>
                            <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">−</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.overallFeedback.missedOpportunities?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#f59e0b' }}>
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Missed Opportunities
                      </h4>
                      <div className="space-y-2">
                        {evaluation.overallFeedback.missedOpportunities.map((m, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', color: '#92400e' }}>
                            <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">!</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {evaluation.overallFeedback.practiceScenarios?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                        <Sparkles className="w-4 h-4" /> Practice These Scenarios
                      </h4>
                      <div className="space-y-2">
                        {evaluation.overallFeedback.practiceScenarios.map((p, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(255, 107, 53, 0.06)', border: '1px solid rgba(255, 107, 53, 0.15)', color: '#7c2d12' }}>
                            <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }}>{i + 1}.</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                  {typeof evaluation.overallFeedback === 'string' ? evaluation.overallFeedback : ''}
                </p>
              )}
            </div>

            {/* Your Notes */}
            {notes.trim() && (
              <div className="rounded-2xl p-6 mb-8" style={{ background: '#fffef0', border: '1px solid #e8e4c9' }}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: '#4a4520' }}>
                  <StickyNote className="w-5 h-5" />
                  Your Notes
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{notes}</p>
              </div>
            )}

            {/* Conversation Review */}
            <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your Conversation</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                      style={{
                        background: msg.role === 'creator' ? 'var(--accent)' : '#ffffff',
                        color: msg.role === 'creator' ? '#ffffff' : '#000000',
                        borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                        borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Try Again Button */}
            <div className="text-center">
              <button onClick={resetSimulation} className="btn-primary text-lg px-10 py-4">
                <RotateCcw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
