'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, RotateCcw, MessageCircle, Award, ChevronDown, ChevronUp, Sparkles,
  AlertCircle, Clock, Timer, X, LogIn, Loader2, Download, FileText,
  ExternalLink, Mic, Play, Lock, Unlock, Package, Flame, Reply, Zap,
} from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'creator' | 'subscriber'
  content: string
  timestamp: Date
  contentType: 'text' | 'voice_memo' | 'video' | 'teaser'
  vaultItemId?: string
  price?: number
  unlocked?: boolean
  isFollowUp?: boolean
  followUpPpvId?: string
}

interface VaultItem {
  id: string
  type: 'teaser' | 'voice_memo' | 'video'
  label: string
  price?: number
  description: string
  sent: boolean
  unlocked: boolean
  followedUp: boolean
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

const DURATION_OPTIONS = [
  { label: 'Free Mode', minutes: 0, description: 'End when you want', icon: '∞' },
  { label: 'Quick', minutes: 3, description: 'Fast practice', icon: '3' },
  { label: 'Standard', minutes: 5, description: 'Full flow', icon: '5' },
  { label: 'Extended', minutes: 10, description: 'Deep session', icon: '10' },
  { label: 'Marathon', minutes: 15, description: 'Full session', icon: '15' },
] as const

const SUBSCRIBER_SEXTING_PROFILES = [
  "Name: Mike, Age: 42, Electrician from Texas. Dominant. Naturally uses phrases like 'bend you over the counter', 'spank that ass till its red', 'pull your hair while i hit it from the back', 'make you gag on this cock'. Always graphic and specific.",
  "Name: Brandon, Age: 38, Mechanic from Ohio. Romantic-dirty mix. Naturally uses phrases like 'eat that pussy till u shake', 'wrap those thighs around my head', 'kiss my way down your stomach then bury my face between your legs'. Paints vivid scenarios.",
  "Name: Tommy, Age: 47, Truck driver from Kentucky. Intense and possessive. Naturally uses phrases like 'slide deep inside you slow', 'fill you up till it drips out', 'pin you down and fuck you till you scream'. Likes control.",
  "Name: Austin, Age: 35, Construction worker from Florida. Aggressive energy. Naturally uses phrases like 'pound that pussy from behind', 'grab those hips and pull you back onto me', 'choke you while i fuck you hard'. Very explicit and direct.",
  "Name: Scott, Age: 44, Plumber from Indiana. Daddy energy. Naturally uses phrases like 'spread those legs for daddy', 'ride my face till you cum', 'cum all over daddy's cock'. Possessive and commanding.",
  "Name: Jake, Age: 40, Carpenter from Montana. Tender and raw mix. Naturally uses phrases like 'taste every inch of you', 'pin you against the wall and kiss your neck', 'slide my hands all over that body then fuck you slow'. Vivid and physical.",
]

function createVaultItems(): VaultItem[] {
  return [
    { id: 'teaser-1', type: 'teaser', label: 'Teasing Video 1', description: 'Short teasing clip — lingerie, curves, suggestive but not explicit', sent: false, unlocked: false, followedUp: false },
    { id: 'vm-1', type: 'voice_memo', label: 'Voice Memo 1', description: 'Breathy voice describing anticipation, what she wants to do to him', sent: false, unlocked: false, followedUp: false },
    { id: 'video-1', type: 'video', label: 'Video 1', price: 20, description: 'Lingerie strip tease — slow and sensual', sent: false, unlocked: false, followedUp: false },
    { id: 'vm-2', type: 'voice_memo', label: 'Voice Memo 2', description: 'Moaning, describing how turned on she is, touching herself thinking of him', sent: false, unlocked: false, followedUp: false },
    { id: 'video-2', type: 'video', label: 'Video 2', price: 40, description: 'Solo play — more explicit, using fingers', sent: false, unlocked: false, followedUp: false },
    { id: 'vm-3', type: 'voice_memo', label: 'Voice Memo 3', description: 'Intense moaning — wants him inside her, filling her up until it leaks', sent: false, unlocked: false, followedUp: false },
    { id: 'video-3', type: 'video', label: 'Video 3', price: 60, description: 'Solo play with toy — very explicit', sent: false, unlocked: false, followedUp: false },
    { id: 'vm-4', type: 'voice_memo', label: 'Voice Memo 4', description: 'Begging for him, saying she is about to cum, intense', sent: false, unlocked: false, followedUp: false },
    { id: 'video-4', type: 'video', label: 'Video 4', price: 80, description: 'Full explicit solo climax — premium content', sent: false, unlocked: false, followedUp: false },
  ]
}

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Correct Framework Order': 30,
  'Language Mirroring': 25,
  'Tension Building Between PPVs': 20,
  'Follow-up on Non-Purchased Content': 15,
  'Response Speed & Engagement': 10,
}

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

export default function SextingSimulationPage() {
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
  const [waitingForIdle, setWaitingForIdle] = useState(false)
  const [pasteCount, setPasteCount] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [subscriberFinished, setSubscriberFinished] = useState(false)
  const [totalWordsTyped, setTotalWordsTyped] = useState(0)
  const [totalTypingTimeMs, setTotalTypingTimeMs] = useState(0)

  const [vaultItems, setVaultItems] = useState<VaultItem[]>(createVaultItems())
  const [showVault, setShowVault] = useState(false)
  const [pendingPpvId, setPendingPpvId] = useState<string | null>(null)
  const [replyingToPpv, setReplyingToPpv] = useState<string | null>(null)

  const lastInputWasPaste = useRef(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endConversationRef = useRef<(() => Promise<void>) | null>(null)
  const replyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const profileRef = useRef('')
  const resultsRef = useRef<HTMLDivElement>(null)
  const typingStartRef = useRef<number>(0)
  const vaultRef = useRef<VaultItem[]>([])
  const pendingPpvRef = useRef<string | null>(null)

  useEffect(() => { vaultRef.current = vaultItems }, [vaultItems])
  useEffect(() => { pendingPpvRef.current = pendingPpvId }, [pendingPpvId])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { profileRef.current = subscriberProfile }, [subscriberProfile])

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

  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom())
  }, [messages, isTyping, scrollToBottom])

  const resetReplyTimer = useCallback(() => {
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current)
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
        contentType: m.contentType,
        price: m.price,
        vaultLabel: m.vaultItemId,
        isFollowUp: m.isFollowUp,
        followUpPpvId: m.followUpPpvId,
      }))

      const response = await fetch('/api/sexting-chat', {
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
      const { reply, purchased, passed, finished } = data

      if (pendingPpvRef.current && (purchased || passed)) {
        const ppvId = pendingPpvRef.current
        setVaultItems(prev => prev.map(item =>
          item.id === ppvId ? { ...item, unlocked: purchased === true } : item
        ))
        setMessages(prev => prev.map(msg =>
          msg.vaultItemId === ppvId && msg.contentType === 'video'
            ? { ...msg, unlocked: purchased === true }
            : msg
        ))
        setPendingPpvId(null)
      }

      const subscriberLines = reply.split('\n').filter((l: string) => l.trim())
      for (let i = 0; i < subscriberLines.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 600))
        setMessages(prev => [...prev, {
          id: `sub-${Date.now()}-${i}`,
          role: 'subscriber',
          content: subscriberLines[i].trim(),
          timestamp: new Date(),
          contentType: 'text',
        }])
      }

      if (finished) {
        setSubscriberFinished(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsTyping(false)
      typingStartRef.current = Date.now()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [])

  const scheduleReply = useCallback(() => {
    resetReplyTimer()
    setWaitingForIdle(true)
    replyTimeoutRef.current = setTimeout(() => {
      fetchAIReply()
    }, 10000)
  }, [resetReplyTimer, fetchAIReply])

  const triggerQuickReply = useCallback(() => {
    resetReplyTimer()
    fetchAIReply()
  }, [resetReplyTimer, fetchAIReply])

  useEffect(() => {
    return () => { if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current) }
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
    const profile = SUBSCRIBER_SEXTING_PROFILES[Math.floor(Math.random() * SUBSCRIBER_SEXTING_PROFILES.length)]
    setSubscriberProfile(profile)
    setPhase('chatting')
    setMessages([])
    setMessageCount(0)
    setError(null)
    setVaultItems(createVaultItems())
    setPasteCount(0)
    setTypedCount(0)
    setTotalWordsTyped(0)
    setTotalTypingTimeMs(0)
    typingStartRef.current = 0
    setSubscriberFinished(false)
    setPendingPpvId(null)
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
      const response = await fetch('/api/sexting-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], subscriberProfile: profile }),
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
          contentType: 'text',
        }])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsTyping(false)
      typingStartRef.current = Date.now()
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const sendMessage = () => {
    if (!inputValue.trim() || isTyping) return
    if (lastInputWasPaste.current) setPasteCount(prev => prev + 1)
    else setTypedCount(prev => prev + 1)

    const now = Date.now()
    if (typingStartRef.current > 0) {
      setTotalTypingTimeMs(prev => prev + (now - typingStartRef.current))
    }
    const words = inputValue.trim().split(/\s+/).filter(w => w.length > 0).length
    setTotalWordsTyped(prev => prev + words)

    const userMessage: ChatMessage = {
      id: `creator-${Date.now()}`,
      role: 'creator',
      content: inputValue.trim(),
      timestamp: new Date(),
      contentType: 'text',
      isFollowUp: replyingToPpv !== null,
      followUpPpvId: replyingToPpv || undefined,
    }

    if (replyingToPpv) {
      setVaultItems(prev => prev.map(v => v.id === replyingToPpv ? { ...v, followedUp: true } : v))
      setReplyingToPpv(null)
    }

    setMessages(prev => [...prev, userMessage])
    setMessageCount(prev => prev + 1)
    setInputValue('')
    setError(null)
    lastInputWasPaste.current = false
    scheduleReply()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const sendVaultItem = (item: VaultItem) => {
    if (item.sent || isTyping) return

    setVaultItems(prev => prev.map(v => v.id === item.id ? { ...v, sent: true } : v))

    const message: ChatMessage = {
      id: `vault-${item.id}-${Date.now()}`,
      role: 'creator',
      content: item.type === 'voice_memo'
        ? item.label
        : item.type === 'teaser'
          ? 'Teasing Video'
          : `PPV Video`,
      timestamp: new Date(),
      contentType: item.type,
      vaultItemId: item.id,
      price: item.price,
      unlocked: undefined,
    }

    setMessages(prev => [...prev, message])
    setMessageCount(prev => prev + 1)

    if (item.type === 'video') {
      setPendingPpvId(item.id)
    }

    setShowVault(false)
    scheduleReply()
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

    if (messages.length < 6) {
      setError('Please exchange more messages before ending. Practice the full PPV framework first.')
      return
    }

    setPhase('evaluating')
    setError(null)

    try {
      const allMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        contentType: m.contentType,
        price: m.price,
        unlocked: m.unlocked,
        isFollowUp: m.isFollowUp,
        followUpPpvId: m.followUpPpvId,
      }))

      const followUpData = vaultItems
        .filter(v => v.type === 'video' && v.id !== 'video-1')
        .map(v => ({ id: v.id, label: v.label, sent: v.sent, unlocked: v.unlocked, followedUp: v.followedUp }))

      const response = await fetch('/api/evaluate-sexting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, followUpData }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to evaluate conversation')
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
              notes: `[SEXTING SIMULATION] Vault items sent: ${vaultItems.filter(v => v.sent).map(v => v.label).join(', ')}`,
              conversation: messages.map(m => ({ role: m.role, content: m.content, contentType: m.contentType })),
              durationMode: selectedDuration === 0 ? 'free' : `${selectedDuration}min`,
              messageCount,
              typedCount,
              pasteCount,
              simulationType: 'sexting',
              wpm: totalTypingTimeMs > 0 ? Math.round((totalWordsTyped / (totalTypingTimeMs / 60000)) * 10) / 10 : 0,
            }),
          })
        } catch {
          console.error('Failed to save simulation report')
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase('chatting')
    }
  }, [messages, resetReplyTimer, simUser, vaultItems, selectedDuration, messageCount, typedCount, pasteCount, totalWordsTyped, totalTypingTimeMs])

  useEffect(() => { endConversationRef.current = endConversation }, [endConversation])

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
    setWaitingForIdle(false)
    setPasteCount(0)
    setTypedCount(0)
    setTotalWordsTyped(0)
    setTotalTypingTimeMs(0)
    typingStartRef.current = 0
    setVaultItems(createVaultItems())
    setShowVault(false)
    setSubscriberFinished(false)
    setPendingPpvId(null)
    setReplyingToPpv(null)
    lastInputWasPaste.current = false
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const exportResultsAsPdf = async () => {
    if (!resultsRef.current || !evaluation) return
    setExportingPdf(true)
    const previousExpanded = new Set(expandedCategories)
    const allIndices = new Set(evaluation.categories.map((_, i) => i))
    setExpandedCategories(allIndices)
    await new Promise(r => setTimeout(r, 600))
    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')
      const el = resultsRef.current!
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: -window.scrollY, windowWidth: el.scrollWidth })
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const pdf = new jsPDF('p', 'mm', 'a4')
      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      const name = simUser?.telegramUsername || 'simulation'
      const date = new Date().toISOString().slice(0, 10)
      pdf.save(`sexting-simulation-results_${name}_${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExpandedCategories(previousExpanded)
      setExportingPdf(false)
    }
  }

  const nextVaultItem = vaultItems.find(v => !v.sent)
  const unlockedCount = vaultItems.filter(v => v.type === 'video' && v.unlocked).length
  const sentVideos = vaultItems.filter(v => v.type === 'video' && v.sent)
  const unpurchasedVideos = sentVideos.filter(v => !v.unlocked)

  const renderVoiceMemoBubble = (msg: ChatMessage) => (
    <div
      className="max-w-[75%] px-4 py-3 rounded-2xl"
      style={{ background: '#7c3aed', borderBottomRightRadius: '4px' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <Mic className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-0.5">
            {[3, 5, 7, 9, 7, 5, 8, 6, 4, 7, 9, 6, 4, 5, 7, 8, 6, 4, 5, 7, 9, 5, 3].map((h, i) => (
              <div key={i} className="w-[3px] rounded-full" style={{ height: `${h * 2}px`, background: 'rgba(255,255,255,0.6)' }} />
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>0:{Math.floor(Math.random() * 20 + 8).toString().padStart(2, '0')}</p>
        </div>
      </div>
    </div>
  )

  const isFirstPpv = (ppvId?: string) => ppvId === 'video-1'

  const getVaultItem = (ppvId?: string) => vaultItems.find(v => v.id === ppvId)

  const handleReplyToPpv = (ppvId: string) => {
    setReplyingToPpv(ppvId)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const renderVideoBubble = (msg: ChatMessage) => {
    const vault = msg.vaultItemId ? getVaultItem(msg.vaultItemId) : null
    const isFirst = isFirstPpv(msg.vaultItemId)
    const alreadyFollowedUp = vault?.followedUp ?? false
    const showReplyBtn = msg.unlocked === false && !isFirst && !alreadyFollowedUp

    return (
    <div className="max-w-[75%] rounded-2xl overflow-hidden" style={{ borderBottomRightRadius: '4px' }}>
      <div className="relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', minHeight: '140px', minWidth: '200px' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Play className="w-7 h-7 text-white/70 ml-1" />
        </div>
        <div className="absolute top-2.5 right-2.5">
          {msg.unlocked === true ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: '#10b981', color: 'white' }}>
              <Unlock className="w-3 h-3" /> Unlocked
            </span>
          ) : msg.unlocked === false ? (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: '#ef4444', color: 'white' }}>
              <Lock className="w-3 h-3" /> Not Purchased
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
              <Lock className="w-3 h-3" /> Pending
            </span>
          )}
        </div>
        <div className="absolute bottom-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-lg text-sm font-black" style={{ background: 'rgba(0,0,0,0.6)', color: '#10b981' }}>
            ${msg.price}
          </span>
        </div>
        {msg.contentType === 'teaser' && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'var(--accent)', color: 'white' }}>FREE TEASER</span>
          </div>
        )}
      </div>
      {msg.unlocked === false && (
        <div className="px-3 py-2 flex items-center justify-between" style={{ background: '#fef3c7', borderTop: '1px solid #fbbf24' }}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#d97706' }} />
            <p className="text-xs font-medium" style={{ color: '#92400e' }}>
              {alreadyFollowedUp ? 'Followed up' : 'Not purchased'}
            </p>
          </div>
          {showReplyBtn && (
            <button
              onClick={(e) => { e.stopPropagation(); handleReplyToPpv(msg.vaultItemId!) }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all hover:scale-[1.05]"
              style={{ background: '#e11d48', color: 'white' }}
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
          )}
          {alreadyFollowedUp && (
            <span className="text-xs font-semibold" style={{ color: '#059669' }}>Replied</span>
          )}
        </div>
      )}
    </div>
    )
  }

  const renderTeaserBubble = () => (
    <div className="max-w-[75%] rounded-2xl overflow-hidden" style={{ borderBottomRightRadius: '4px' }}>
      <div className="relative flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ff6b35, #ff4757)', minHeight: '120px', minWidth: '200px' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <Play className="w-6 h-6 text-white/80 ml-0.5" />
        </div>
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}>FREE TEASER</span>
        </div>
        <div className="absolute bottom-2.5 right-2.5">
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>0:08</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className={phase === 'chatting' ? 'max-w-5xl mx-auto px-4' : 'max-w-4xl mx-auto px-4'}>

        {/* LOGIN PHASE */}
        {phase === 'login' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Sexting Simulation</h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Sign in with your training account to continue</p>
            </div>
            <div className="rounded-2xl p-8" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="p-4 rounded-xl text-sm" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{loginError}</div>
                )}
                <div>
                  <label htmlFor="sim2-telegram" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Telegram Username</label>
                  <input type="text" id="sim2-telegram" value={loginTelegram} onChange={(e) => setLoginTelegram(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#e11d48' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    placeholder="@username" required />
                </div>
                <div>
                  <label htmlFor="sim2-email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Email Address</label>
                  <input type="email" id="sim2-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '2px solid var(--border)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#e11d48' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    placeholder="your.email@example.com" required />
                </div>
                <button type="submit" disabled={loginLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', opacity: loginLoading ? 0.7 : 1 }}>
                  {loginLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />Verifying...</>) : (<><LogIn className="w-5 h-5" />Continue to Simulation</>)}
                </button>
              </form>
              <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.15)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Use the same Telegram username and email you registered with in the training portal.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* INTRO PHASE */}
        {phase === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Sexting &amp; PPV Simulation</h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }}>
                Practice the PPV selling framework in a realistic sexting simulation. A subscriber will initiate — follow the framework to sell content from your vault.
              </p>
              {simUser && (
                <div className="flex items-center justify-center gap-3">
                  <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    Signed in as {simUser.telegramUsername}
                  </span>
                  <button onClick={handleLogout} className="text-sm font-medium underline" style={{ color: 'var(--text-muted)' }}>Logout</button>
                </div>
              )}
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>The PPV Framework</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                For EACH PPV sale, follow this exact order. This framework increased our openrate to ~50%.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e11d48' }}>1</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Voice Memo</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send a voice memo describing the video content. Build anticipation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e11d48' }}>2</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>PPV Video (No Text — Just Price Tag)</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Send the video from the vault. No extra text needed — just the content with its price.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e11d48' }}>3</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>2-3 Sentences — Mirror His Language</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Use the EXACT words the subscriber used. If he said &quot;eat that pussy&quot;, you write it back. This is called mirroring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e11d48' }}>4</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Open Question</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ask an open-ended question: &quot;what would u do to me if...&quot; or &quot;how would u...&quot; — keeps the energy going.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.15)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#e11d48' }}>Between PPVs — Build Tension!</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Don&apos;t spam the next PPV immediately. Respond to what the subscriber says, use his words, build desire. Make him BEG for the next video.
                </p>
              </div>

              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#2563eb' }}>The Vault</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Click the <strong>Vault</strong> button in the chat to send content in the right order: Teaser → Voice Memo 1 → Video 1 → VM 2 → Video 2 → VM 3 → Video 3 → VM 4 → Video 4.
                  If a subscriber doesn&apos;t purchase, follow up emotionally!
                </p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Objection Handling</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(249, 115, 22, 0.06)', border: '1px solid rgba(249, 115, 22, 0.15)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#ea580c' }}>Price Objection</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Create curiosity → redirect to alternative content → logical conclusion (&quot;i just want u to spoil me as i spoil u&quot;)</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
                  <p className="text-sm font-semibold" style={{ color: '#9333ea' }}>Content Objection</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Redirect energy with a logical conclusion (&quot;i want it to be just u and me, no one else&quot;)</p>
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-5 h-5 inline-block mr-2 mb-0.5" />Choose Duration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button key={opt.minutes} onClick={() => setSelectedDuration(opt.minutes)}
                    className="rounded-2xl p-5 text-center transition-all duration-200 hover:scale-[1.03]"
                    style={{
                      background: selectedDuration === opt.minutes ? '#e11d48' : 'var(--bg-primary)',
                      color: selectedDuration === opt.minutes ? '#ffffff' : 'var(--text-primary)',
                      border: selectedDuration === opt.minutes ? '2px solid #e11d48' : '2px solid var(--border)',
                      boxShadow: selectedDuration === opt.minutes ? '0 4px 20px rgba(225, 29, 72, 0.3)' : 'var(--shadow-sm)',
                    }}>
                    <div className="text-3xl font-black mb-1">{opt.icon}</div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{opt.label}</div>
                    <div className="text-xs mt-2" style={{ color: selectedDuration === opt.minutes ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={startSimulation} className="text-lg px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              <Flame className="w-5 h-5" />
              {selectedDuration === 0 ? 'Start Free Simulation' : `Start ${selectedDuration}-Minute Simulation`}
            </button>
          </motion.div>
        )}

        {/* CHATTING PHASE */}
        {phase === 'chatting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>

            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 rounded-t-2xl flex-shrink-0"
              style={{ background: '#1a1a2e', color: 'white' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: '#e11d48' }}>🔥</div>
                <div>
                  <p className="font-semibold text-white text-sm">Subscriber</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {subscriberFinished ? 'Session complete' : messageCount > 0 ? `${messageCount} messages · ${unlockedCount} unlocked` : 'Sexting mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedDuration > 0 ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold"
                    style={{
                      background: timeLeft <= 30 ? 'rgba(239, 68, 68, 0.2)' : timeLeft <= 60 ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: timeLeft <= 30 ? '#fca5a5' : timeLeft <= 60 ? '#fdba74' : '#ffffff',
                      border: `1px solid ${timeLeft <= 30 ? 'rgba(239, 68, 68, 0.4)' : timeLeft <= 60 ? 'rgba(249, 115, 22, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                    }}>
                    <Timer className="w-3.5 h-3.5" />
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    <Timer className="w-3.5 h-3.5" />Free
                  </div>
                )}
                <button onClick={endConversation}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', color: 'white' }}>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">End &amp; Get Score</span>
                    <span className="sm:hidden">End</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Subscriber Finished Banner */}
            {subscriberFinished && (
              <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ background: '#ecfdf5', borderBottom: '1px solid #a7f3d0' }}>
                <p className="text-sm font-semibold" style={{ color: '#065f46' }}>
                  ✅ The subscriber has finished! Click &quot;End &amp; Get Score&quot; to see your evaluation.
                </p>
              </div>
            )}

            {/* Unpurchased Content Warning */}
            {unpurchasedVideos.length > 0 && !subscriberFinished && (
              <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#d97706' }} />
                <p className="text-xs font-medium" style={{ color: '#92400e' }}>
                  {unpurchasedVideos.length} video{unpurchasedVideos.length > 1 ? 's' : ''} not purchased — follow up! (&quot;don&apos;t u wanna see what i sent for u?&quot;)
                </p>
              </div>
            )}

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-4" style={{ background: '#f0f0f0', overflowAnchor: 'none' }}>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'creator' ? 'justify-end' : 'justify-start'} mb-1.5`}>
                  {message.role === 'creator' && message.contentType === 'voice_memo' && renderVoiceMemoBubble(message)}
                  {message.role === 'creator' && message.contentType === 'video' && renderVideoBubble(message)}
                  {message.role === 'creator' && message.contentType === 'teaser' && renderTeaserBubble()}
                  {message.contentType === 'text' && (
                    <div className="max-w-[75%]">
                      {message.isFollowUp && message.role === 'creator' && (
                        <div className="flex items-center gap-1 mb-0.5 justify-end">
                          <Reply className="w-3 h-3" style={{ color: '#999' }} />
                          <span className="text-[10px] font-medium" style={{ color: '#999' }}>
                            Replying to {vaultItems.find(v => v.id === message.followUpPpvId)?.label || 'PPV'}
                          </span>
                        </div>
                      )}
                      <div className="px-4 py-2.5 rounded-2xl"
                        style={{
                          background: message.role === 'creator' ? (message.isFollowUp ? '#be123c' : '#e11d48') : '#ffffff',
                          color: message.role === 'creator' ? '#ffffff' : '#000000',
                          borderBottomRightRadius: message.role === 'creator' ? '4px' : '18px',
                          borderBottomLeftRadius: message.role === 'subscriber' ? '4px' : '18px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          border: message.isFollowUp ? '1px solid rgba(225, 29, 72, 0.4)' : 'none',
                        }}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start mb-1.5">
                  <div className="px-4 py-3 rounded-2xl" style={{ background: '#ffffff', borderBottomLeftRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
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
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </p>
              </div>
            )}

            {/* Vault Panel */}
            <AnimatePresence>
              {showVault && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="overflow-hidden flex-shrink-0" style={{ background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Package className="w-4 h-4" /> Content Vault
                      </h4>
                      <button onClick={() => setShowVault(false)} className="p-1 rounded-lg hover:bg-white/10"><X className="w-4 h-4 text-white/60" /></button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                      {vaultItems.map((item) => {
                        const isNext = nextVaultItem?.id === item.id
                        const isVideo = item.type === 'video'
                        return (
                          <button key={item.id} onClick={() => sendVaultItem(item)} disabled={item.sent || isTyping}
                            className="rounded-xl p-2.5 text-center transition-all duration-200 disabled:opacity-40 relative"
                            style={{
                              background: item.sent
                                ? (isVideo ? (item.unlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)') : 'rgba(255,255,255,0.05)')
                                : isNext ? 'rgba(225, 29, 72, 0.3)' : 'rgba(255,255,255,0.08)',
                              border: isNext && !item.sent ? '2px solid #e11d48' : '2px solid transparent',
                            }}>
                            <div className="text-lg mb-1">
                              {item.type === 'voice_memo' ? '🎤' : item.type === 'teaser' ? '🎬' : '📹'}
                            </div>
                            <p className="text-[10px] font-semibold leading-tight" style={{ color: item.sent ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.9)' }}>
                              {item.label}
                            </p>
                            {item.price && (
                              <p className="text-[10px] font-bold mt-0.5" style={{ color: '#10b981' }}>${item.price}</p>
                            )}
                            {item.sent && (
                              <div className="absolute top-1 right-1">
                                {isVideo ? (
                                  item.unlocked
                                    ? <Unlock className="w-3 h-3" style={{ color: '#10b981' }} />
                                    : <Lock className="w-3 h-3" style={{ color: '#ef4444' }} />
                                ) : (
                                  <span className="text-[10px]">✓</span>
                                )}
                              </div>
                            )}
                            {isNext && !item.sent && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ background: '#e11d48' }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="px-4 py-3 rounded-b-2xl flex-shrink-0" style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setShowVault(!showVault)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    background: showVault ? '#e11d48' : '#1a1a2e',
                    color: 'white',
                    border: showVault ? '2px solid #e11d48' : '2px solid transparent',
                  }}>
                  <Package className="w-3.5 h-3.5" />
                  Vault
                  {nextVaultItem && (
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10b981' }} />
                  )}
                </button>
                <span className="text-xs" style={{ color: '#999' }}>
                  {vaultItems.filter(v => v.sent).length}/{vaultItems.length} sent · {unlockedCount} unlocked
                </span>
                {waitingForIdle && !isTyping && (
                  <button onClick={triggerQuickReply}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-[1.05] animate-pulse"
                    style={{ background: '#f59e0b', color: 'white' }}>
                    <Zap className="w-3.5 h-3.5" />
                    Quick Reply
                  </button>
                )}
              </div>
              {replyingToPpv && (
                <div className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(225, 29, 72, 0.08)', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                  <div className="flex items-center gap-2">
                    <Reply className="w-3.5 h-3.5" style={{ color: '#e11d48' }} />
                    <p className="text-xs font-semibold" style={{ color: '#e11d48' }}>
                      Replying to {vaultItems.find(v => v.id === replyingToPpv)?.label || 'PPV'} — follow up to get them to unlock!
                    </p>
                  </div>
                  <button onClick={() => setReplyingToPpv(null)} className="p-0.5 rounded hover:bg-red-100 transition-colors">
                    <X className="w-3.5 h-3.5" style={{ color: '#e11d48' }} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <input ref={inputRef} type="text" value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onPaste={() => { lastInputWasPaste.current = true }}
                  placeholder={replyingToPpv ? `Follow up on ${vaultItems.find(v => v.id === replyingToPpv)?.label || 'PPV'}...` : subscriberFinished ? 'Session complete — end to get your score' : 'Type your message...'}
                  disabled={isTyping || subscriberFinished}
                  className="flex-1 px-4 py-3 rounded-full text-[15px] outline-none transition-all duration-200"
                  style={{ background: '#f0f0f0', color: '#000000', border: '1px solid transparent' }}
                  onFocus={(e) => { e.currentTarget.style.border = '1px solid #e11d48'; e.currentTarget.style.background = '#ffffff' }}
                  onBlur={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = '#f0f0f0' }} />
                <button onClick={sendMessage} disabled={!inputValue.trim() || isTyping || subscriberFinished}
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                  style={{ background: inputValue.trim() ? '#e11d48' : '#d1d5db' }}>
                  <Send className="w-5 h-5 text-white" style={{ transform: 'rotate(-45deg)', marginLeft: '2px' }} />
                </button>
              </div>
              <p className="text-center text-xs mt-2" style={{ color: '#999' }}>
                Sub responds after 10s of no typing &bull; send voice memo + PPV + descriptive text, then wait &bull; mirror his exact words
              </p>
            </div>
          </motion.div>
        )}

        {/* EVALUATING PHASE */}
        {phase === 'evaluating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Analyzing Your Sexting Session...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Evaluating framework execution, mirroring, tension building, and objection handling</p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#e11d48', animationDelay: `${i * 150}ms` }} />
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
        {phase === 'results' && evaluation && (() => {
          const weightedScore = calculateWeightedScore(evaluation.categories)
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div ref={resultsRef} style={{ background: '#ffffff', padding: '2rem', borderRadius: '1rem' }}>

                {/* Overall Score */}
                <div className="text-center mb-10">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-36 h-36 rounded-full mb-6 relative"
                    style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}>
                    <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                      <span className="text-4xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Your Score: {weightedScore}/100</h2>
                  <p className="text-lg font-semibold mb-4" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>

                  {totalTypingTimeMs > 0 && (
                    <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <div className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#e11d48' }}>{Math.round((totalWordsTyped / (totalTypingTimeMs / 60000)) * 10) / 10}</div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Words/Min</div>
                      </div>
                      <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                      <div className="text-center">
                        <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{totalWordsTyped}</div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Words</div>
                      </div>
                      <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                      <div className="text-center">
                        <div className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{Math.round(totalTypingTimeMs / 1000)}s</div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Typing Time</div>
                      </div>
                    </div>
                  )}

                  <div className="inline-flex flex-wrap gap-3 justify-center text-xs font-medium">
                    <span className="px-2.5 py-1 rounded-full" style={{ background: '#10b98115', color: '#10b981' }}>85-100 Elite</span>
                    <span className="px-2.5 py-1 rounded-full" style={{ background: '#f59e0b15', color: '#f59e0b' }}>70-84 Strong</span>
                    <span className="px-2.5 py-1 rounded-full" style={{ background: '#f9731615', color: '#f97316' }}>55-69 Developing</span>
                    <span className="px-2.5 py-1 rounded-full" style={{ background: '#ef444415', color: '#ef4444' }}>40-54 Below Avg</span>
                    <span className="px-2.5 py-1 rounded-full" style={{ background: '#dc262615', color: '#dc2626' }}>0-39 Needs Coaching</span>
                  </div>
                </div>

                {/* Weighted Score Table */}
                <div className="rounded-2xl overflow-hidden mb-10" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--bg-secondary)' }}>
                        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>#</th>
                        <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Category</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Weight</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Raw</th>
                        <th className="text-center px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evaluation.categories.map((cat, idx) => {
                        const weight = CATEGORY_WEIGHTS[cat.name] || 0
                        const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                        return (
                          <tr key={idx} style={{ borderTop: '1px solid var(--border)' }}>
                            <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</td>
                            <td className="px-4 py-3 text-center" style={{ color: 'var(--text-muted)' }}>{weight} pts</td>
                            <td className="px-4 py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}/10</td>
                            <td className="px-4 py-3 text-center font-bold" style={{ color: getCategoryScoreColor(cat.score) }}>{earned}</td>
                          </tr>
                        )
                      })}
                      <tr style={{ borderTop: '2px solid var(--border)', background: 'var(--bg-secondary)' }}>
                        <td colSpan={2} className="px-4 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>TOTAL</td>
                        <td className="px-4 py-3 text-center font-bold" style={{ color: 'var(--text-muted)' }}>100 pts</td>
                        <td className="px-4 py-3 text-center"></td>
                        <td className="px-4 py-3 text-center font-black text-lg" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}/100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Vault Summary */}
                <div className="rounded-2xl p-6 mb-8" style={{ background: '#1a1a2e' }}>
                  <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><Package className="w-5 h-5" /> Vault Summary</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                    {vaultItems.map((item) => (
                      <div key={item.id} className="rounded-xl p-2.5 text-center"
                        style={{
                          background: item.sent
                            ? (item.type === 'video' ? (item.unlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'rgba(255,255,255,0.1)')
                            : 'rgba(255,255,255,0.03)',
                        }}>
                        <div className="text-lg mb-1">{item.type === 'voice_memo' ? '🎤' : item.type === 'teaser' ? '🎬' : '📹'}</div>
                        <p className="text-[10px] font-semibold" style={{ color: item.sent ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: item.sent ? (item.type === 'video' ? (item.unlocked ? '#10b981' : '#ef4444') : '#a78bfa') : 'rgba(255,255,255,0.2)' }}>
                          {item.sent ? (item.type === 'video' ? (item.unlocked ? '✓ Bought' : '✗ Passed') : '✓ Sent') : 'Not sent'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                  {evaluation.categories.map((cat, idx) => {
                    const weight = CATEGORY_WEIGHTS[cat.name] || 0
                    const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                    return (
                      <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}
                        className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          background: 'var(--bg-primary)',
                          border: `2px solid ${expandedCategories.has(idx) ? getCategoryScoreColor(cat.score) : 'var(--border)'}`,
                          boxShadow: expandedCategories.has(idx) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : 'var(--shadow-sm)',
                        }}
                        onClick={() => toggleCategory(idx)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-3xl font-black" style={{ color: getCategoryScoreColor(cat.score) }}>{cat.score}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/10</span>
                        </div>
                        <p className="text-sm font-semibold leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                        <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                          <span>{earned}/{weight} pts</span>
                          <span className="font-semibold" style={{ color: getCategoryScoreColor(cat.score) }}>×{weight}</span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: '#e5e7eb' }}>
                          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${cat.score * 10}%`, background: getCategoryScoreColor(cat.score) }} />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Detailed Breakdowns */}
                <div className="space-y-4 mb-10">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h3>
                  {evaluation.categories.map((cat, idx) => {
                    const weight = CATEGORY_WEIGHTS[cat.name] || 0
                    const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                    return (
                      <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * idx }}
                        className="rounded-2xl overflow-hidden"
                        style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                        <button onClick={() => toggleCategory(idx)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                          style={{ background: expandedCategories.has(idx) ? 'var(--bg-secondary)' : 'transparent' }}>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                              {cat.score}
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                              <p className="text-sm" style={{ color: getCategoryScoreColor(cat.score) }}>{earned}/{weight} pts (weight ×{weight})</p>
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
                                    <p className="text-sm font-semibold mb-2" style={{ color: '#10b981' }}>What you did well:</p>
                                    <div className="space-y-2">
                                      {cat.examples.good.map((ex, i) => (
                                        <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#065f46', border: '1px solid rgba(16, 185, 129, 0.2)' }}>&ldquo;{ex}&rdquo;</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {cat.examples.needsWork.length > 0 && (
                                  <div>
                                    <p className="text-sm font-semibold mb-2" style={{ color: '#f97316' }}>Areas to improve:</p>
                                    <div className="space-y-2">
                                      {cat.examples.needsWork.map((ex, i) => (
                                        <div key={i} className="px-4 py-2.5 rounded-xl text-sm" style={{ background: 'rgba(249, 115, 22, 0.08)', color: '#9a3412', border: '1px solid rgba(249, 115, 22, 0.2)' }}>&ldquo;{ex}&rdquo;</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                <div className="p-4 rounded-xl" style={{ background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.15)' }}>
                                  <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#e11d48' }}><Sparkles className="w-4 h-4" />Practice Advice</p>
                                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{cat.advice}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Overall Feedback */}
                <div className="rounded-2xl p-8 mb-8 space-y-6" style={{ background: '#ffffff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                  <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Overall Assessment</h3>
                  {typeof evaluation.overallFeedback === 'object' && evaluation.overallFeedback !== null ? (
                    <>
                      {evaluation.overallFeedback.summary && (
                        <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{evaluation.overallFeedback.summary}</p>
                      )}
                      {evaluation.overallFeedback.strengths?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#10b981' }}>
                            <span className="w-2 h-2 rounded-full bg-green-500" /> What You Did Well
                          </h4>
                          <div className="space-y-2">
                            {evaluation.overallFeedback.strengths.map((s, i) => (
                              <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#065f46' }}>
                                <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">+</span><span>{s}</span>
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
                                <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">−</span><span>{w}</span>
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
                                <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">!</span><span>{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {evaluation.overallFeedback.practiceScenarios?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#e11d48' }}>
                            <Sparkles className="w-4 h-4" /> Practice These Scenarios
                          </h4>
                          <div className="space-y-2">
                            {evaluation.overallFeedback.practiceScenarios.map((p, i) => (
                              <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(225, 29, 72, 0.06)', border: '1px solid rgba(225, 29, 72, 0.15)', color: '#7c2d12' }}>
                                <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#e11d48' }}>{i + 1}.</span><span>{p}</span>
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

                {/* Conversation Review */}
                <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your Conversation</h3>
                  <div className={`space-y-2 pr-2 ${exportingPdf ? '' : 'max-h-96 overflow-y-auto'}`}>
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                        {msg.contentType === 'voice_memo' && msg.role === 'creator' ? (
                          <div className="max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#7c3aed', color: 'white' }}>🎤 Voice Memo</div>
                        ) : msg.contentType === 'video' && msg.role === 'creator' ? (
                          <div className="max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
                            style={{ background: '#1a1a2e', color: 'white' }}>
                            📹 PPV ${msg.price}
                            {msg.unlocked === true && <span style={{ color: '#10b981' }}>✓ Bought</span>}
                            {msg.unlocked === false && <span style={{ color: '#ef4444' }}>✗ Passed</span>}
                          </div>
                        ) : msg.contentType === 'teaser' && msg.role === 'creator' ? (
                          <div className="max-w-[75%] px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: '#e11d48', color: 'white' }}>🎬 Free Teaser</div>
                        ) : (
                          <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                            style={{
                              background: msg.role === 'creator' ? '#e11d48' : '#ffffff',
                              color: msg.role === 'creator' ? '#ffffff' : '#000000',
                              borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                              borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                            }}>
                            {msg.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export PDF */}
              <div className="flex justify-center gap-4 mt-8 mb-8">
                <button onClick={exportResultsAsPdf} disabled={exportingPdf}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                  {exportingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {exportingPdf ? 'Generating PDF...' : 'Export Results as PDF'}
                </button>
              </div>

              {/* Ways to Get Better */}
              <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, #fef2f2, #fff1f2)', border: '1px solid #fecaca' }}>
                <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#9f1239' }}>
                  <Sparkles className="w-5 h-5" style={{ color: '#e11d48' }} /> Ways to Get Better
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e11d48', color: '#ffffff' }}>1</div>
                    <div>
                      <p className="font-semibold" style={{ color: '#9f1239' }}>Export your results as a PDF</p>
                      <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Click the blue button above to save your evaluation.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e11d48', color: '#ffffff' }}>2</div>
                    <div>
                      <p className="font-semibold" style={{ color: '#9f1239' }}>Download the learning guide PDF</p>
                      <a href="/learning-guide.pdf" download
                        className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                        style={{ background: '#e11d48', color: '#ffffff' }}>
                        <FileText className="w-4 h-4" /> Download Learning Guide PDF
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e11d48', color: '#ffffff' }}>3</div>
                    <div>
                      <p className="font-semibold" style={{ color: '#9f1239' }}>Upload both to Claude AI for personalized practice</p>
                      <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                        Go to{' '}
                        <a href="https://claude.ai/new" target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: '#e11d48' }}>
                          claude.ai/new<ExternalLink className="w-3 h-3 inline ml-0.5 mb-0.5" />
                        </a>
                        {' '}and upload both PDFs. Then use this prompt:
                      </p>
                      <div className="mt-2 p-3 rounded-lg text-sm font-mono" style={{ background: '#1e293b', color: '#e2e8f0' }}>
                        the first pdf is my sexting simulation test results and the second pdf is my learning pdf. please give me practical examples to improve my PPV framework execution, mirroring, and objection handling.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e11d48', color: '#ffffff' }}>4</div>
                    <div>
                      <p className="font-semibold" style={{ color: '#9f1239' }}>Practice, come back, repeat</p>
                      <p className="text-sm mt-1" style={{ color: '#6b7280' }}>Keep practicing until you master the framework. <strong>Repeat until elite.</strong></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Try Again */}
              <div className="text-center">
                <button onClick={resetSimulation}
                  className="text-lg px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] inline-flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)' }}>
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
              </div>
            </motion.div>
          )
        })()}
      </div>
    </div>
  )
}
