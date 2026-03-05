'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, RotateCcw, MessageCircle, Award, ChevronDown, ChevronUp, Sparkles,
  AlertCircle, Clock, Timer, StickyNote, X, LogIn, Loader2, Download, FileText,
  ExternalLink, Mic, Play, Lock, Unlock, Package, Flame, Reply, Heart,
  ArrowRight, Eye, Zap,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'creator' | 'subscriber' | 'system'
  content: string
  timestamp: Date
  stage: 'relationship' | 'sexting' | 'aftercare'
  contentType?: 'text' | 'voice_memo' | 'video' | 'teaser'
  price?: number
  unlocked?: boolean
}

interface VaultItem {
  id: string
  type: 'teaser' | 'voice_memo' | 'video'
  label: string
  price?: number
  description: string
  sent: boolean
  unlocked: boolean
}

interface CategoryResult {
  name: string
  score: number
  feedback: string
  examples: { good: string[]; needsWork: string[] }
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

const VAULT_ITEMS: VaultItem[] = [
  { id: 'teaser1', type: 'teaser', label: 'Teaser Clip', description: 'A quick teasing video to hook him', sent: false, unlocked: false },
  { id: 'vm1', type: 'voice_memo', label: 'Voice Memo 1', description: 'Describes upcoming video 1', sent: false, unlocked: false },
  { id: 'vid1', type: 'video', label: 'Video 1', price: 20, description: 'First PPV video ($20)', sent: false, unlocked: false },
  { id: 'vm2', type: 'voice_memo', label: 'Voice Memo 2', description: 'Describes upcoming video 2', sent: false, unlocked: false },
  { id: 'vid2', type: 'video', label: 'Video 2', price: 40, description: 'Second PPV video ($40)', sent: false, unlocked: false },
  { id: 'vm3', type: 'voice_memo', label: 'Voice Memo 3', description: 'Describes upcoming video 3', sent: false, unlocked: false },
  { id: 'vid3', type: 'video', label: 'Video 3', price: 60, description: 'Third PPV video ($60)', sent: false, unlocked: false },
  { id: 'vm4', type: 'voice_memo', label: 'Voice Memo 4', description: 'Describes upcoming video 4', sent: false, unlocked: false },
  { id: 'vid4', type: 'video', label: 'Video 4', price: 80, description: 'Fourth PPV video ($80)', sent: false, unlocked: false },
]

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Giving Him What He Wants to Hear': 7,
  'Making the Subscriber Feel Special': 6,
  'Caring About the Subscriber': 5,
  'Asking the Right Questions': 4,
  'American Texting Style': 4,
  'Grammar & Natural Flow': 2,
  'Note-Taking & Information Tracking': 2,
  'Correct Framework Order': 10,
  'Language Mirroring': 8,
  'Tension Building Between PPVs': 7,
  'Response Speed & Engagement': 3,
  'Emotional Authenticity & Vulnerability': 7,
  'Personalization Using His Notes': 5,
  'Name Usage & Intimacy Anchoring': 4,
  'Re-engagement Seed Planting': 4,
  'Pacing & Message Timing': 2,
  'No Hard-Sell / No Desperation': 2,
  'Objection Handling': 10,
  'Stage Transitions': 5,
  'Cross-Stage Consistency': 3,
}

const STAGE_DURATIONS = { relationship: 15, sexting: 10, aftercare: 10 }
const STAGE_LABELS = { relationship: 'Relationship Building', sexting: 'Sexting & PPV Sales', aftercare: 'Aftercare' }
const STAGE_COLORS = { relationship: '#f97316', sexting: '#e11d48', aftercare: '#ec4899' }
const STAGE_ICONS = { relationship: MessageCircle, sexting: Flame, aftercare: Heart }

function calculateWeightedScore(categories: CategoryResult[]): number {
  let total = 0
  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.name] || 0
    total += (cat.score / 10) * weight
  }
  return Math.round(total * 10) / 10
}

function getCategoryScoreColor(score: number): string {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#f97316'
  return '#ef4444'
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#f59e0b'
  if (score >= 55) return '#f97316'
  if (score >= 40) return '#ef4444'
  return '#dc2626'
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Elite'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Developing'
  if (score >= 40) return 'Below Average'
  return 'Needs Immediate Coaching'
}

export default function CombinedSimulationPage() {
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
  const [notes, setNotes] = useState('')
  const [showNotesMobile, setShowNotesMobile] = useState(false)
  const [pasteCount, setPasteCount] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const [totalWordsTyped, setTotalWordsTyped] = useState(0)
  const [totalTypingTimeMs, setTotalTypingTimeMs] = useState(0)

  const [currentStage, setCurrentStage] = useState<'relationship' | 'sexting' | 'aftercare'>('relationship')
  const [stageTimeLeft, setStageTimeLeft] = useState(STAGE_DURATIONS.relationship * 60)
  const [timerActive, setTimerActive] = useState(false)
  const [stageTransitioning, setStageTransitioning] = useState(false)

  const [vault, setVault] = useState<VaultItem[]>(VAULT_ITEMS.map(v => ({ ...v })))
  const [showVault, setShowVault] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const profileRef = useRef('')
  const resultsRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<'relationship' | 'sexting' | 'aftercare'>('relationship')
  const lastInputWasPaste = useRef(false)
  const typingStartRef = useRef<number>(0)
  const recordingRef = useRef<{t:number;e:string;d:string}[]>([])
  const sessionStartRef = useRef<number>(0)
  const transitionTriggeredRef = useRef(false)

  const recordEvent = useCallback((eventType: string, data: string = '') => {
    if (sessionStartRef.current === 0) return
    recordingRef.current.push({ t: Date.now() - sessionStartRef.current, e: eventType, d: data })
  }, [])

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
        body: JSON.stringify({ telegramUsername: loginTelegram, email: loginEmail }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
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
    if (container) container.scrollTop = container.scrollHeight
  }, [])

  useEffect(() => { requestAnimationFrame(() => scrollToBottom()) }, [messages, isTyping, scrollToBottom])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { profileRef.current = subscriberProfile }, [subscriberProfile])
  useEffect(() => { stageRef.current = currentStage }, [currentStage])

  // Stage timer
  useEffect(() => {
    if (!timerActive || phase !== 'chatting') return
    const interval = setInterval(() => {
      setStageTimeLeft(prev => {
        if (prev <= 1) {
          handleStageEnd()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, phase])

  const handleStageEnd = useCallback(() => {
    if (transitionTriggeredRef.current) return
    transitionTriggeredRef.current = true
    const stage = stageRef.current

    if (stage === 'relationship') {
      transitionToStage('sexting')
    } else if (stage === 'sexting') {
      transitionToStage('aftercare')
    } else {
      endConversation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const transitionToStage = useCallback(async (nextStage: 'sexting' | 'aftercare') => {
    setTimerActive(false)
    setStageTransitioning(true)

    const transitionLabel = nextStage === 'sexting'
      ? '--- TRANSITIONING TO SEXTING ---'
      : '--- TRANSITIONING TO AFTERCARE ---'

    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      role: 'system',
      content: transitionLabel,
      timestamp: new Date(),
      stage: stageRef.current,
    }])

    recordEvent('stage_transition', nextStage)

    setIsTyping(true)
    try {
      const triggerType = nextStage === 'sexting' ? 'sexting' : 'aftercare'
      const apiMessages = messagesRef.current
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/combined-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          subscriberProfile: profileRef.current,
          stage: stageRef.current,
          triggerTransition: triggerType,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.reply) {
          setMessages(prev => [...prev, {
            id: `sub-${Date.now()}`,
            role: 'subscriber',
            content: data.reply,
            timestamp: new Date(),
            stage: nextStage,
          }])
        }
      }
    } catch { /* continue */ }

    setIsTyping(false)
    setCurrentStage(nextStage)
    stageRef.current = nextStage
    setStageTimeLeft(STAGE_DURATIONS[nextStage] * 60)
    transitionTriggeredRef.current = false
    setStageTransitioning(false)
    setTimerActive(true)

    if (nextStage === 'sexting') {
      setShowVault(true)
    } else {
      setShowVault(false)
    }
  }, [recordEvent])

  const startSimulation = async () => {
    const profile = SUBSCRIBER_PROFILES[Math.floor(Math.random() * SUBSCRIBER_PROFILES.length)]
    setSubscriberProfile(profile)
    profileRef.current = profile
    setPhase('chatting')
    setCurrentStage('relationship')
    stageRef.current = 'relationship'
    setStageTimeLeft(STAGE_DURATIONS.relationship * 60)
    setTimerActive(true)
    sessionStartRef.current = Date.now()
    recordingRef.current = []
    recordEvent('session_start', 'combined')

    setIsTyping(true)
    try {
      const response = await fetch('/api/combined-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], subscriberProfile: profile, stage: 'relationship' }),
      })
      const data = await response.json()
      if (data.reply) {
        const msg: ChatMessage = {
          id: `sub-${Date.now()}`,
          role: 'subscriber',
          content: data.reply,
          timestamp: new Date(),
          stage: 'relationship',
        }
        setMessages([msg])
        setMessageCount(1)
        recordEvent('sub_msg', data.reply)
      }
    } catch {
      setError('Failed to start simulation. Please try again.')
    }
    setIsTyping(false)
  }

  const sendMessage = async (content: string, contentType: ChatMessage['contentType'] = 'text', vaultItemId?: string, price?: number) => {
    if (!content.trim() && !vaultItemId) return
    if (isTyping || stageTransitioning) return

    const stage = stageRef.current

    const creatorMsg: ChatMessage = {
      id: `creator-${Date.now()}`,
      role: 'creator',
      content: content.trim(),
      timestamp: new Date(),
      stage,
      contentType,
      price,
    }
    setMessages(prev => [...prev, creatorMsg])
    setInputValue('')
    setMessageCount(prev => prev + 1)
    recordEvent('creator_msg', content)

    if (!lastInputWasPaste.current && content.trim()) {
      setTypedCount(prev => prev + 1)
      const words = content.trim().split(/\s+/).length
      setTotalWordsTyped(prev => prev + words)
      if (typingStartRef.current > 0) {
        setTotalTypingTimeMs(prev => prev + (Date.now() - typingStartRef.current))
      }
    } else if (lastInputWasPaste.current) {
      setPasteCount(prev => prev + 1)
    }
    lastInputWasPaste.current = false
    typingStartRef.current = 0

    setIsTyping(true)
    try {
      const apiMessages = [...messagesRef.current, creatorMsg]
        .filter(m => m.role !== 'system')
        .map(m => {
          let msgContent = m.content
          if (m.contentType === 'voice_memo') msgContent = `[VOICE MEMO] ${m.content}`
          else if (m.contentType === 'video' && m.price) msgContent = `[PPV VIDEO - $${m.price}] ${m.content}`
          else if (m.contentType === 'teaser') msgContent = `[TEASER VIDEO] ${m.content}`
          return { role: m.role, content: msgContent }
        })

      const response = await fetch('/api/combined-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          subscriberProfile: profileRef.current,
          stage,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      if (data.bought && vaultItemId) {
        setVault(prev => prev.map(v => v.id === vaultItemId ? { ...v, unlocked: true } : v))
        setMessages(prev => prev.map(m =>
          m.id === creatorMsg.id ? { ...m, unlocked: true } : m
        ))
      }

      if (data.reply) {
        setMessages(prev => [...prev, {
          id: `sub-${Date.now()}`,
          role: 'subscriber',
          content: data.reply,
          timestamp: new Date(),
          stage,
        }])
        setMessageCount(prev => prev + 1)
        recordEvent('sub_msg', data.reply)
      }
    } catch {
      setError('Failed to get response. Please try again.')
    }
    setIsTyping(false)
  }

  const sendVaultItem = (item: VaultItem) => {
    if (item.sent) return
    setVault(prev => prev.map(v => v.id === item.id ? { ...v, sent: true } : v))

    let content = ''
    let contentType: ChatMessage['contentType'] = 'text'
    if (item.type === 'voice_memo') {
      content = `[Voice Memo Sent] ${item.description}`
      contentType = 'voice_memo'
    } else if (item.type === 'video') {
      content = `[PPV Video Sent - $${item.price}]`
      contentType = 'video'
    } else {
      content = `[Teaser Video Sent] ${item.description}`
      contentType = 'teaser'
    }

    sendMessage(content, contentType, item.id, item.price)
  }

  const endConversation = useCallback(async () => {
    setTimerActive(false)
    setPhase('evaluating')
    recordEvent('session_end', '')

    try {
      const allMessages = messagesRef.current.map(m => ({
        role: m.role,
        content: m.contentType === 'voice_memo' ? `[VOICE MEMO] ${m.content}` :
          m.contentType === 'video' && m.price ? `[PPV VIDEO - $${m.price}]${m.unlocked ? ' [UNLOCKED]' : ' [NOT PURCHASED]'}` :
          m.contentType === 'teaser' ? `[TEASER VIDEO] ${m.content}` : m.content,
        stage: m.stage,
      }))

      const response = await fetch('/api/evaluate-combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, notes }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to evaluate' }))
        throw new Error(data.error || 'Failed to evaluate')
      }

      const data = await response.json()
      setEvaluation(data.evaluation)
      setPhase('results')

      if (simUser && data.evaluation) {
        const weighted = calculateWeightedScore(data.evaluation.categories || [])
        try {
          await fetch('/api/simulation/save-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramUsername: simUser.telegramUsername,
              email: simUser.email,
              overallScore: Math.round(weighted),
              categories: data.evaluation.categories,
              overallFeedback: data.evaluation.overallFeedback,
              notes,
              conversation: messages.map(m => ({ role: m.role, content: m.content, contentType: m.contentType, price: m.price, unlocked: m.unlocked })),
              durationMode: '35min',
              messageCount,
              typedCount,
              pasteCount,
              simulationType: 'combined',
              wpm: totalTypingTimeMs > 0 ? Math.round((totalWordsTyped / (totalTypingTimeMs / 60000)) * 10) / 10 : 0,
              sessionRecording: recordingRef.current,
            }),
          })
        } catch {
          console.error('Failed to save report')
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong.'
      setError(errorMessage)
      setPhase('chatting')
    }
  }, [simUser, notes, messages, messageCount, typedCount, pasteCount, totalWordsTyped, totalTypingTimeMs, recordEvent])

  const toggleCategory = (index: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const resetSimulation = () => {
    setPhase('intro')
    setMessages([])
    setInputValue('')
    setIsTyping(false)
    setEvaluation(null)
    setExpandedCategories(new Set())
    setError(null)
    setMessageCount(0)
    setNotes('')
    setPasteCount(0)
    setTypedCount(0)
    setTotalWordsTyped(0)
    setTotalTypingTimeMs(0)
    setCurrentStage('relationship')
    setStageTimeLeft(STAGE_DURATIONS.relationship * 60)
    setTimerActive(false)
    setStageTransitioning(false)
    setVault(VAULT_ITEMS.map(v => ({ ...v })))
    setShowVault(false)
    transitionTriggeredRef.current = false
    recordingRef.current = []
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const totalElapsed = () => {
    const relElapsed = currentStage === 'relationship' ? (STAGE_DURATIONS.relationship * 60 - stageTimeLeft) : STAGE_DURATIONS.relationship * 60
    const sexElapsed = currentStage === 'sexting' ? (STAGE_DURATIONS.sexting * 60 - stageTimeLeft) : currentStage === 'aftercare' ? STAGE_DURATIONS.sexting * 60 : 0
    const aftElapsed = currentStage === 'aftercare' ? (STAGE_DURATIONS.aftercare * 60 - stageTimeLeft) : 0
    return relElapsed + sexElapsed + aftElapsed
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const exportPDF = async () => {
    if (!resultsRef.current || !evaluation) return
    setExportingPdf(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      let heightLeft = pdfHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pdf.internal.pageSize.getHeight()
      while (heightLeft > 0) {
        position = -(pdfHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
        heightLeft -= pdf.internal.pageSize.getHeight()
      }
      pdf.save(`combined-simulation-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch { /* ignore */ }
    setExportingPdf(false)
  }

  const StageIcon = STAGE_ICONS[currentStage]

  // ==================== LOGIN ====================
  if (phase === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Full Session Simulation</h1>
              <p className="text-sm text-gray-500 mt-1">35 Minutes &middot; All 3 Stages</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telegram Username</label>
                <input type="text" value={loginTelegram} onChange={e => setLoginTelegram(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="@username" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none transition-colors text-gray-900"
                  placeholder="your@email.com" required />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" disabled={loginLoading}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><LogIn className="w-5 h-5 inline mr-2" />Login</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  // ==================== INTRO ====================
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
          <div className="rounded-3xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.97)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">Full Session Simulation</h1>
                  <p className="text-sm text-gray-500">Logged in as {simUser?.telegramUsername}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">Logout</button>
            </div>

            <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #ddd6fe' }}>
              <h3 className="font-bold text-gray-900 mb-3">How it works</h3>
              <p className="text-sm text-gray-700 mb-4">
                This simulation combines all 3 chatting stages into one continuous session. You will chat with the same subscriber through the full journey — from first message to aftercare. The subscriber will also throw random objections at you to test your handling skills.
              </p>
              <div className="space-y-3">
                {(['relationship', 'sexting', 'aftercare'] as const).map((stage, i) => {
                  const Icon = STAGE_ICONS[stage]
                  return (
                    <div key={stage} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white" style={{ border: `1px solid ${STAGE_COLORS[stage]}30` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: STAGE_COLORS[stage] }}>
                        {i + 1}
                      </div>
                      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: STAGE_COLORS[stage] }} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{STAGE_LABELS[stage]}</p>
                        <p className="text-xs text-gray-500">{STAGE_DURATIONS[stage]} minutes</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Total: 35 minutes &middot; 20 scoring categories across all stages
              </p>
            </div>

            <div className="rounded-2xl p-4 mb-6" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
              <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Random objections will appear during the conversation. Handle them as if they were real!
              </p>
            </div>

            <button onClick={startSimulation}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-3"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Play className="w-6 h-6" /> Start Full Session
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ==================== EVALUATING ====================
  if (phase === 'evaluating') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-16 h-16 text-violet-400 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-2">Evaluating Your Full Session...</h2>
          <p className="text-violet-300">Analyzing all 3 stages with Claude AI</p>
          <p className="text-violet-400/60 text-sm mt-2">This may take 15-30 seconds</p>
        </motion.div>
      </div>
    )
  }

  // ==================== RESULTS ====================
  if (phase === 'results' && evaluation) {
    const weightedScore = calculateWeightedScore(evaluation.categories)
    const overallFb = typeof evaluation.overallFeedback === 'object' ? evaluation.overallFeedback : null

    return (
      <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
        <div className="max-w-4xl mx-auto" ref={resultsRef}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${getScoreColor(weightedScore)}, ${getScoreColor(weightedScore)}dd)` }}>
                <span className="text-3xl font-black text-white">{Math.round(weightedScore)}</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Full Session Results</h1>
              <p className="text-lg font-semibold" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
              <p className="text-sm text-gray-500 mt-1">{messageCount} messages &middot; {typedCount} typed &middot; {pasteCount} pasted</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <button onClick={exportPDF} disabled={exportingPdf}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
              <button onClick={resetSimulation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all">
                <RotateCcw className="w-4 h-4" /> New Session
              </button>
            </div>

            {/* Score Overview — Grouped by Stage */}
            {(() => {
              const STAGE_GROUPS = [
                { label: 'Relationship Building', color: '#f97316', icon: MessageCircle, cats: ['Giving Him What He Wants to Hear', 'Making the Subscriber Feel Special', 'Caring About the Subscriber', 'Asking the Right Questions', 'American Texting Style', 'Grammar & Natural Flow', 'Note-Taking & Information Tracking'], totalPts: 30 },
                { label: 'Sexting & PPV Sales', color: '#e11d48', icon: Flame, cats: ['Correct Framework Order', 'Language Mirroring', 'Tension Building Between PPVs', 'Response Speed & Engagement'], totalPts: 28 },
                { label: 'Aftercare', color: '#ec4899', icon: Heart, cats: ['Emotional Authenticity & Vulnerability', 'Personalization Using His Notes', 'Name Usage & Intimacy Anchoring', 'Re-engagement Seed Planting', 'Pacing & Message Timing', 'No Hard-Sell / No Desperation'], totalPts: 24 },
                { label: 'Cross-Stage Skills', color: '#7c3aed', icon: Award, cats: ['Objection Handling', 'Stage Transitions', 'Cross-Stage Consistency'], totalPts: 18 },
              ]
              return STAGE_GROUPS.map((group) => {
                const groupCats = evaluation.categories.filter(c => group.cats.includes(c.name))
                const groupScore = groupCats.reduce((s, c) => s + (c.score / 10) * (CATEGORY_WEIGHTS[c.name] || 0), 0)
                const GroupIcon = group.icon
                return (
                  <div key={group.label} className="rounded-2xl p-6 mb-4 bg-white shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <GroupIcon className="w-5 h-5" style={{ color: group.color }} /> {group.label}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: group.color }}>{Math.round(groupScore * 10) / 10}/{group.totalPts} pts</span>
                        <div className="w-20 rounded-full h-2" style={{ background: '#e5e7eb' }}>
                          <div className="h-2 rounded-full transition-all" style={{ width: `${(groupScore / group.totalPts) * 100}%`, background: group.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {groupCats.map((cat) => {
                        const globalIdx = evaluation.categories.indexOf(cat)
                        const weight = CATEGORY_WEIGHTS[cat.name] || 0
                        const isOpen = expandedCategories.has(globalIdx)
                        return (
                          <div key={globalIdx} className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                            <button onClick={() => toggleCategory(globalIdx)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                                {cat.score}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{cat.name}</p>
                                <p className="text-xs text-gray-400">{weight} pts weight</p>
                              </div>
                              <div className="w-24 rounded-full h-2" style={{ background: '#e5e7eb' }}>
                                <div className="h-2 rounded-full transition-all" style={{ width: `${cat.score * 10}%`, background: getCategoryScoreColor(cat.score) }} />
                              </div>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                  <div className="px-4 pb-4 space-y-3">
                                    <p className="text-sm text-gray-700">{cat.feedback}</p>
                                    {cat.examples.good.length > 0 && (
                                      <div>
                                        <p className="text-xs font-bold text-green-600 mb-1">Good examples:</p>
                                        {cat.examples.good.map((ex, j) => (
                                          <p key={j} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={{ background: '#f0fdf4', color: '#166534' }}>&ldquo;{ex}&rdquo;</p>
                                        ))}
                                      </div>
                                    )}
                                    {cat.examples.needsWork.length > 0 && (
                                      <div>
                                        <p className="text-xs font-bold text-red-600 mb-1">Needs work:</p>
                                        {cat.examples.needsWork.map((ex, j) => (
                                          <p key={j} className="text-xs px-3 py-1.5 rounded-lg mb-1" style={{ background: '#fef2f2', color: '#991b1b' }}>&ldquo;{ex}&rdquo;</p>
                                        ))}
                                      </div>
                                    )}
                                    {cat.advice && (
                                      <div className="px-3 py-2 rounded-lg text-xs leading-relaxed" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d40' }}>
                                        <span className="font-bold">Advice:</span> {cat.advice}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()}

            {/* Overall Feedback */}
            {overallFb && (
              <div className="rounded-2xl p-6 bg-white shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" /> Overall Feedback
                </h3>

                {overallFb.summary && (
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">{overallFb.summary}</p>
                )}

                {overallFb.strengths?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-green-600 mb-2">Strengths</h4>
                    <div className="space-y-1.5">
                      {overallFb.strengths.map((s, i) => (
                        <div key={i} className="text-xs px-3 py-2 rounded-lg leading-relaxed" style={{ background: '#f0fdf4', color: '#166534' }}>+ {s}</div>
                      ))}
                    </div>
                  </div>
                )}

                {overallFb.weaknesses?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-red-600 mb-2">Weaknesses</h4>
                    <div className="space-y-1.5">
                      {overallFb.weaknesses.map((w, i) => (
                        <div key={i} className="text-xs px-3 py-2 rounded-lg leading-relaxed" style={{ background: '#fef2f2', color: '#991b1b' }}>- {w}</div>
                      ))}
                    </div>
                  </div>
                )}

                {overallFb.missedOpportunities?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-amber-600 mb-2">Missed Opportunities</h4>
                    <div className="space-y-1.5">
                      {overallFb.missedOpportunities.map((m, i) => (
                        <div key={i} className="text-xs px-3 py-2 rounded-lg leading-relaxed" style={{ background: '#fffbeb', color: '#92400e' }}>! {m}</div>
                      ))}
                    </div>
                  </div>
                )}

                {overallFb.practiceScenarios?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-violet-600 mb-2">Practice Scenarios</h4>
                    <div className="space-y-1.5">
                      {overallFb.practiceScenarios.map((p, i) => (
                        <div key={i} className="text-xs px-3 py-2 rounded-lg leading-relaxed" style={{ background: '#f5f3ff', color: '#4c1d95' }}>{i + 1}. {p}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Full Conversation Replay */}
            <div className="rounded-2xl p-6 mt-6 bg-white shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-500" /> Full Conversation
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'creator' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                    {msg.role === 'system' ? (
                      <div className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: `${STAGE_COLORS[msg.stage]}15`, color: STAGE_COLORS[msg.stage] }}>
                        {msg.content}
                      </div>
                    ) : (
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.role === 'creator' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-200 text-gray-900 rounded-bl-md'}`}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // ==================== CHATTING ====================
  return (
    <div className="h-screen flex flex-col" style={{ background: '#f0f0f0' }}>
      {/* Stage Progress Bar */}
      <div className="flex-shrink-0 px-3 py-2" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }}>
        <div className="max-w-3xl mx-auto">
          {/* Stage indicators */}
          <div className="flex items-center gap-2 mb-2">
            {(['relationship', 'sexting', 'aftercare'] as const).map((stage, i) => {
              const Icon = STAGE_ICONS[stage]
              const isActive = currentStage === stage
              const isPast = (['relationship', 'sexting', 'aftercare'] as const).indexOf(currentStage) > i
              return (
                <div key={stage} className="flex items-center gap-1.5 flex-1">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'ring-2 ring-white/50' : ''}`}
                    style={{ background: isActive ? STAGE_COLORS[stage] : isPast ? `${STAGE_COLORS[stage]}80` : 'rgba(255,255,255,0.1)' }}>
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 hidden sm:block">
                    <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-white/50'}`}>{STAGE_LABELS[stage]}</p>
                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-white/30'}`}>{STAGE_DURATIONS[stage]}m</p>
                  </div>
                  {i < 2 && <ArrowRight className="w-3 h-3 text-white/30 flex-shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* Timer & Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: `${STAGE_COLORS[currentStage]}30` }}>
                <StageIcon className="w-4 h-4" style={{ color: STAGE_COLORS[currentStage] }} />
                <span className="text-sm font-bold" style={{ color: STAGE_COLORS[currentStage] }}>{STAGE_LABELS[currentStage]}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${stageTimeLeft < 60 ? 'animate-pulse' : ''}`} style={{ background: stageTimeLeft < 60 ? '#ef444430' : 'rgba(255,255,255,0.1)' }}>
                <Timer className="w-3.5 h-3.5" style={{ color: stageTimeLeft < 60 ? '#ef4444' : '#94a3b8' }} />
                <span className="text-sm font-mono font-bold" style={{ color: stageTimeLeft < 60 ? '#ef4444' : '#94a3b8' }}>{formatTime(stageTimeLeft)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">{messageCount} msgs</span>
              <span className="text-xs text-white/30">{formatTime(totalElapsed())} elapsed</span>
              <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/60 ml-2">Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden max-w-5xl mx-auto w-full">
        {/* Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'creator' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
                {msg.role === 'system' ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-2 rounded-full text-xs font-bold my-2" style={{ background: `${STAGE_COLORS[msg.stage]}15`, color: STAGE_COLORS[msg.stage], border: `1px solid ${STAGE_COLORS[msg.stage]}30` }}>
                    {msg.content}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'creator'
                        ? msg.contentType === 'voice_memo' ? 'bg-green-500 text-white rounded-br-md'
                        : msg.contentType === 'video' ? 'bg-purple-500 text-white rounded-br-md'
                        : msg.contentType === 'teaser' ? 'bg-pink-500 text-white rounded-br-md'
                        : 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                    }`}>
                    {msg.contentType === 'voice_memo' && <Mic className="w-3.5 h-3.5 inline mr-1" />}
                    {msg.contentType === 'video' && <>{msg.unlocked ? <Unlock className="w-3.5 h-3.5 inline mr-1" /> : <Lock className="w-3.5 h-3.5 inline mr-1" />}</>}
                    {msg.contentType === 'teaser' && <Play className="w-3.5 h-3.5 inline mr-1" />}
                    {msg.content}
                    {msg.price && (
                      <span className={`ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full ${msg.unlocked ? 'bg-green-400/30' : 'bg-white/20'}`}>
                        ${msg.price} {msg.unlocked ? '✓' : ''}
                      </span>
                    )}
                  </motion.div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {stageTransitioning && (
              <div className="flex justify-center my-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-5 py-2.5 rounded-full" style={{ background: 'linear-gradient(135deg, #7c3aed20, #6d28d920)', border: '1px solid #7c3aed30' }}>
                  <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                  <span className="text-sm font-semibold text-violet-700">Transitioning...</span>
                </motion.div>
              </div>
            )}
          </div>

          {/* Vault Panel (sexting stage) */}
          <AnimatePresence>
            {showVault && currentStage === 'sexting' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-200">
                <div className="px-3 py-2 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-gray-700">Content Vault</span>
                    <button onClick={() => setShowVault(false)} className="ml-auto text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {vault.map(item => (
                      <button key={item.id} onClick={() => sendVaultItem(item)} disabled={item.sent || isTyping}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          item.sent
                            ? item.unlocked ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        }`}>
                        {item.type === 'voice_memo' ? <Mic className="w-3 h-3 inline mr-1" /> : item.type === 'video' ? <Lock className="w-3 h-3 inline mr-1" /> : <Play className="w-3 h-3 inline mr-1" />}
                        {item.label}
                        {item.price ? ` $${item.price}` : ''}
                        {item.sent && item.unlocked && ' ✓'}
                        {item.sent && !item.unlocked && item.type === 'video' && ' ✗'}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              {currentStage === 'sexting' && !showVault && (
                <button onClick={() => setShowVault(true)} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
                  <Package className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowNotesMobile(!showNotesMobile)} className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors md:hidden">
                <StickyNote className="w-4 h-4" />
              </button>
              <input ref={inputRef} type="text" value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                  if (!lastInputWasPaste.current && typingStartRef.current === 0 && e.target.value) typingStartRef.current = Date.now()
                }}
                onPaste={() => { lastInputWasPaste.current = true }}
                onKeyDown={handleKeyDown}
                disabled={isTyping || stageTransitioning}
                placeholder={currentStage === 'relationship' ? 'Chat with subscriber...' : currentStage === 'sexting' ? 'Sext with subscriber...' : 'Aftercare response...'}
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-violet-500 focus:outline-none text-sm text-gray-900 transition-colors" />
              <button onClick={() => sendMessage(inputValue)} disabled={!inputValue.trim() || isTyping || stageTransitioning}
                className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-50"
                style={{ background: STAGE_COLORS[currentStage] }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Notes */}
          <AnimatePresence>
            {showNotesMobile && (
              <motion.div initial={{ height: 0 }} animate={{ height: 200 }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-200 md:hidden">
                <div className="h-full p-2">
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full h-full p-3 rounded-xl border border-amber-200 bg-amber-50 text-sm resize-none focus:outline-none text-gray-900"
                    placeholder="Take notes about the subscriber here..." />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notes Panel (Desktop) */}
        <div className="hidden md:flex flex-col w-72 border-l border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-gray-700">Notes</span>
          </div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            className="flex-1 p-4 text-sm resize-none focus:outline-none text-gray-900 placeholder-gray-400"
            placeholder="Take notes about the subscriber here — name, age, job, hobbies, etc. These will persist across all 3 stages and be evaluated." />
          <div className="px-4 py-3 border-t border-gray-200">
            <button onClick={() => endConversation()}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              End Session Early
            </button>
          </div>
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-lg flex items-center gap-2 z-50">
            <AlertCircle className="w-4 h-4" />
            {error}
            <button onClick={() => setError(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
