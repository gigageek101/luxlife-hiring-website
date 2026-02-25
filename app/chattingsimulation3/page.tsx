'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, RotateCcw, MessageCircle, Award, ChevronDown, ChevronUp, Sparkles, AlertCircle, Clock, Timer, StickyNote, X, LogIn, Loader2, Download, FileText, ExternalLink, Heart, GraduationCap, Brain, Pause, SkipForward, Eye, Play } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'creator' | 'subscriber' | 'system'
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

interface TeacherMessage {
  role: 'creator' | 'subscriber'
  content: string
  annotation?: string
}

interface AfterCareScenario {
  id: string
  label: string
  description: string
  icon: string
  chatterGoesFirst: boolean
  subscriberProfile: string
  prePopulatedNotes: string
  subscriberOpener: string
  scenarioContext: string
}

const DURATION_OPTIONS = [
  { label: 'Free Mode', minutes: 0, description: 'End when you want', icon: '∞' },
  { label: 'Quick', minutes: 1, description: 'Fast aftercare practice', icon: '1' },
  { label: 'Standard', minutes: 3, description: 'Full aftercare flow', icon: '3' },
  { label: 'Extended', minutes: 5, description: 'Deep aftercare session', icon: '5' },
  { label: 'Marathon', minutes: 10, description: 'Full aftercare + re-entry', icon: '10' },
] as const

const AFTERCARE_SCENARIOS: AfterCareScenario[] = [
  {
    id: 'goes-quiet',
    label: 'He Goes Quiet After PPV',
    description: 'Most common scenario (7/10 cases) — he just bought a PPV and went completely silent',
    icon: '😶',
    chatterGoesFirst: true,
    subscriberProfile: "Name: Mike, Age: 42, Job: Electrician/Lineman, Location: Texas, Hobbies: Fishing and watching football, Has a dog named Duke, Drives a lifted F-250, Height: 5'9\", Recently told you he's been doing electrical work for 15 years, mentioned his shifts are brutal in the summer heat",
    prePopulatedNotes: "• Name: Mike\n• Age: 42\n• Location: Texas\n• Job: Electrician / Lineman (15 years)\n• Hobbies: Fishing, watching football\n• Pets: Dog named Duke\n• Vehicle: Lifted F-250\n• Height: 5'9\"\n• Key details: Works brutal summer shifts in the heat, proud of his trade, said he's been doing it 15 years\n• Previous convo: Opened up about work being exhausting, seemed genuinely engaged before the PPV",
    subscriberOpener: '',
    scenarioContext: 'The subscriber just purchased and watched a PPV. He has gone COMPLETELY SILENT. This is the most common post-PPV behavior — 7 out of 10 men do this. He just climaxed and is now in a vulnerable post-orgasm state. He is reading messages but not responding. The creator must bring him back emotionally with warm, personalized aftercare. Do NOT send any message first — wait for the creator to initiate.',
  },
  {
    id: 'compliments',
    label: 'He Sends a Compliment',
    description: 'He just watched the PPV and tells you it was amazing',
    icon: '😍',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Brandon, Age: 38, Job: Mechanic, Location: Ohio, Hobbies: Working on trucks and hunting, Divorced, has a 12-year-old son named Tyler, Height: 5'8\", Mentioned he owns his own garage",
    prePopulatedNotes: "• Name: Brandon\n• Age: 38\n• Location: Ohio\n• Job: Mechanic (owns his own garage)\n• Hobbies: Working on trucks, hunting\n• Family: Divorced, son Tyler (12)\n• Height: 5'8\"\n• Key details: Self-made, built his garage business from nothing, proud of it, gets his son every other weekend\n• Previous convo: Talked about how he built his shop from scratch, seemed proud when you asked about it",
    subscriberOpener: 'that was amazing',
    scenarioContext: 'The subscriber just purchased and watched a PPV. He sent a compliment — "that was amazing" or similar. He is in a positive post-PPV state but still vulnerable. He needs the creator to make this feel like more than a transaction. The creator should respond with genuine breathless energy and not just say "thanks".',
  },
  {
    id: 'feels-guilty',
    label: 'He Feels Guilty After Spending',
    description: 'He just spent money on the PPV and is second-guessing it',
    icon: '😤',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Tommy, Age: 47, Job: Truck Driver (long haul), Location: Kentucky, Hobbies: Fishing and camping, Owns his home, Has two dogs named Buddy and Bear, Height: 5'10\", Mentioned money is tight sometimes with fuel costs",
    prePopulatedNotes: "• Name: Tommy\n• Age: 47\n• Location: Kentucky\n• Job: Long haul truck driver\n• Hobbies: Fishing, camping\n• Pets: Two dogs — Buddy and Bear\n• Height: 5'10\"\n• Owns his home\n• Key details: Money can be tight with fuel costs, drives long routes alone, gets lonely on the road, mentioned missing his dogs when on long hauls\n• Previous convo: Opened up about how lonely the road gets, seemed to really connect when you asked about his dogs",
    subscriberOpener: 'i probably shouldnt have spent that',
    scenarioContext: 'The subscriber just purchased a PPV but is now feeling GUILTY about spending the money. He said something like "i probably shouldnt have spent that" or "damn i never spend money like that". He needs reassurance — not that the PPV was worth it (transactional), but that HE deserves to feel good. Frame it around his hard work and what he deserves.',
  },
  {
    id: 'never-does-this',
    label: 'He Says "I Never Do This"',
    description: 'He\'s embarrassed and wants you to know this isn\'t typical for him',
    icon: '🫣',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Austin, Age: 35, Job: Construction Worker/Welder, Location: Florida, Hobbies: Going to the shooting range and working on his truck, Single, Height: 5'11\", Recently told you he's been single for 2 years after a bad breakup",
    prePopulatedNotes: "• Name: Austin\n• Age: 35\n• Location: Florida\n• Job: Construction worker / Welder\n• Hobbies: Shooting range, working on his truck\n• Status: Single (2 years after bad breakup)\n• Height: 5'11\"\n• Key details: Been single 2 years after a rough breakup, throws himself into work, seemed guarded at first but opened up about the breakup\n• Previous convo: Talked about how he stays busy with work to keep his mind off things, mentioned he doesn't usually open up to people",
    subscriberOpener: 'i never do this kind of thing honestly',
    scenarioContext: 'The subscriber just purchased a PPV and is now feeling embarrassed. He said "i never do this kind of thing honestly" — he wants the creator to know this is not typical behavior for him. He needs to feel validated, not judged. The creator should make him feel like this makes it even MORE special, not less. Frame his vulnerability as something that makes him different from other guys.',
  },
  {
    id: 'opens-up-lonely',
    label: 'He Opens Up About Being Lonely',
    description: 'The PPV unlocked something emotional — he admits he gets lonely',
    icon: '💔',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Scott, Age: 44, Job: Plumber, Location: Indiana, Hobbies: Deer hunting and grilling steaks, Has two kids (ages 8 and 11), Owns his home, Height: 5'7\", Wife left him last year",
    prePopulatedNotes: "• Name: Scott\n• Age: 44\n• Location: Indiana\n• Job: Plumber\n• Hobbies: Deer hunting, grilling steaks\n• Family: Two kids (8 and 11), wife left him last year\n• Height: 5'7\"\n• Owns his home\n• Key details: Going through a rough time since his wife left, has the kids most of the time, tries to stay strong for them, loves grilling on weekends with the kids\n• Previous convo: Mentioned his wife leaving, seemed emotional when talking about it, really lit up when you asked about his kids",
    subscriberOpener: 'honestly i just get real lonely sometimes',
    scenarioContext: 'The subscriber just finished a PPV exchange and the emotional vulnerability unlocked something deeper. He opened up about being lonely — "honestly i just get real lonely sometimes". His wife left him last year, he has two kids, and he is in a very raw emotional state. The creator must handle this with genuine empathy. Do NOT make it sexual. Do NOT be dismissive. Show real care and make him feel like he deserves connection.',
  },
  {
    id: 'deflects-humor',
    label: 'He Deflects With a Joke',
    description: 'He makes a joke right after to cover up that he actually felt something',
    icon: '😂',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Jake, Age: 40, Job: Carpenter, Location: Montana, Hobbies: Hunting elk and camping, Has a German Shepherd named Moose, Height: 6'0\", Mentioned he builds custom furniture on the side",
    prePopulatedNotes: "• Name: Jake\n• Age: 40\n• Location: Montana\n• Job: Carpenter (also builds custom furniture)\n• Hobbies: Elk hunting, camping\n• Pets: German Shepherd named Moose\n• Height: 6'0\"\n• Key details: Builds custom furniture on the side — really proud of his craftsmanship, lives in a cabin area, very outdoorsy, quiet type who doesn't open up easily\n• Previous convo: Showed you a pic of a table he built, seemed proud when you complimented his work, mentioned Moose goes everywhere with him",
    subscriberOpener: 'lmao well that was something',
    scenarioContext: 'The subscriber just finished a PPV exchange and immediately deflected with humor — "lmao well that was something". He is using comedy to mask that he actually felt something real. He is the quiet, strong type who does not like showing vulnerability. The creator must see through the joke, acknowledge the humor warmly, but gently pull him back to the emotional moment. Do NOT let the joke redirect the conversation away from the aftercare.',
  },
  {
    id: 'late-night',
    label: 'Late Night Conversation',
    description: 'It\'s 2am and he just watched the PPV — he should be sleeping',
    icon: '🌙',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Dustin, Age: 36, Job: HVAC Technician, Location: Georgia, Hobbies: Bass fishing and NASCAR, Recently divorced, Height: 5'8\", Has to be up at 5am for work",
    prePopulatedNotes: "• Name: Dustin\n• Age: 36\n• Location: Georgia\n• Job: HVAC Technician\n• Hobbies: Bass fishing, NASCAR\n• Status: Recently divorced\n• Height: 5'8\"\n• Key details: Has to be up at 5am for work most days, recently divorced, adjusting to living alone, mentioned he usually falls asleep watching NASCAR replays\n• Previous convo: Talked about how weird it is living alone after the divorce, mentioned he can't sleep most nights, seemed to really enjoy the conversation",
    subscriberOpener: 'its like 2am i should probably sleep lol',
    scenarioContext: 'It is very late at night (around 2am). The subscriber just finished a PPV exchange and mentioned the time — "its like 2am i should probably sleep lol". He has to work early in the morning as an HVAC tech. The creator should acknowledge the late hour with warmth, show concern for his rest and early morning, express gratitude that he stayed up, and plant a re-entry seed for the next day. Do NOT try to keep him up longer.',
  },
  {
    id: 'has-to-go',
    label: 'He Says He Has to Go',
    description: 'He needs to leave right after the PPV — handle the goodbye',
    icon: '👋',
    chatterGoesFirst: false,
    subscriberProfile: "Name: Travis, Age: 50, Job: Farmer/Rancher, Location: Oklahoma, Hobbies: Hunting and horseback riding, Has 3 kids, Owns 200 acres, Height: 5'9\", Mentioned he gets up at 4am to feed the cattle",
    prePopulatedNotes: "• Name: Travis\n• Age: 50\n• Location: Oklahoma\n• Job: Farmer / Rancher (200 acres)\n• Hobbies: Hunting, horseback riding\n• Family: 3 kids\n• Height: 5'9\"\n• Key details: Gets up at 4am to feed cattle, 200 acres is a lot of work, oldest kid is starting to help on the ranch, mentioned he misses having someone to come home to\n• Previous convo: Really opened up about ranch life, seemed proud of teaching his oldest about farming, mentioned his late wife briefly",
    subscriberOpener: 'i gotta get up early but that was... wow',
    scenarioContext: 'The subscriber just finished a PPV exchange and immediately says he has to go — "i gotta get up early but that was... wow". He is a farmer who gets up at 4am. He WANTS to stay but physically cannot. The creator must handle the goodbye beautifully — no clinging, no desperation, but plant a strong re-entry seed. Make him feel like the connection continues even when he leaves. Express playful sadness about him leaving but understanding of his schedule.',
  },
]

const CATEGORY_WEIGHTS: Record<string, number> = {
  'Emotional Authenticity & Vulnerability': 25,
  'Personalization Using His Notes': 22,
  'Name Usage & Intimacy Anchoring': 18,
  'Re-engagement Seed Planting': 15,
  'Texting Style & Casual American Flow': 10,
  'Pacing & Message Timing': 7,
  'No Hard-Sell / No Desperation': 3,
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

export default function AfterCareSimulationPage() {
  const [phase, setPhase] = useState<'login' | 'intro' | 'chatting' | 'evaluating' | 'results' | 'teacher-loading' | 'teacher-watching' | 'teacher-evaluating' | 'teacher-results'>('login')
  const [simUser, setSimUser] = useState<SimUser | null>(null)
  const [loginTelegram, setLoginTelegram] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<AfterCareScenario | null>(null)
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
  const [exportingPdf, setExportingPdf] = useState(false)
  const [totalWordsTyped, setTotalWordsTyped] = useState(0)
  const [totalTypingTimeMs, setTotalTypingTimeMs] = useState(0)
  const lastInputWasPaste = useRef(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endConversationRef = useRef<(() => Promise<void>) | null>(null)
  const replyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const scenarioRef = useRef<AfterCareScenario | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const typingStartRef = useRef<number>(0)
  const recordingRef = useRef<{t:number;e:string;d:string}[]>([])
  const sessionStartRef = useRef<number>(0)

  const [teacherConversation, setTeacherConversation] = useState<TeacherMessage[]>([])
  const [teacherDisplayIndex, setTeacherDisplayIndex] = useState(0)
  const [teacherPlaying, setTeacherPlaying] = useState(false)
  const [teacherEvaluation, setTeacherEvaluation] = useState<EvaluationResult | null>(null)
  const [teacherError, setTeacherError] = useState<string | null>(null)
  const [teacherExpandedCategories, setTeacherExpandedCategories] = useState<Set<number>>(new Set())
  const [teacherScenarioNotes, setTeacherScenarioNotes] = useState<string>('')
  const [teacherScenarioLabel, setTeacherScenarioLabel] = useState<string>('')
  const teacherChatRef = useRef<HTMLDivElement>(null)
  const teacherPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const recordEvent = useCallback((eventType: string, data: string = '') => {
    if (sessionStartRef.current === 0) return
    recordingRef.current.push({
      t: Date.now() - sessionStartRef.current,
      e: eventType,
      d: data,
    })
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
    scenarioRef.current = selectedScenario
  }, [selectedScenario])

  const resetReplyTimer = useCallback(() => {
    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current)
    }
  }, [])

  const fetchAIReply = useCallback(async () => {
    const currentMessages = messagesRef.current.filter(m => m.role !== 'system')
    const lastMsg = currentMessages[currentMessages.length - 1]
    if (!lastMsg || lastMsg.role !== 'creator') return

    setWaitingForIdle(false)
    setIsTyping(true)
    recordEvent('y')
    setError(null)

    try {
      const allMessages = currentMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const scenario = scenarioRef.current

      const response = await fetch('/api/chat-aftercare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          subscriberProfile: scenario?.subscriberProfile || '',
          scenarioContext: scenario?.scenarioContext || '',
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
        const line = subscriberLines[i].trim()
        recordEvent('r', line)
        setMessages(prev => [...prev, {
          id: `sub-${Date.now()}-${i}`,
          role: 'subscriber',
          content: line,
          timestamp: new Date(),
        }])
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
      setError(errorMessage)
    } finally {
      setIsTyping(false)
      recordEvent('z')
      typingStartRef.current = 0
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [recordEvent])

  const scheduleReply = useCallback(() => {
    resetReplyTimer()
    setWaitingForIdle(true)
    replyTimeoutRef.current = setTimeout(() => {
      fetchAIReply()
    }, 2000)
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
    const scenario = AFTERCARE_SCENARIOS[Math.floor(Math.random() * AFTERCARE_SCENARIOS.length)]
    setSelectedScenario(scenario)

    sessionStartRef.current = Date.now()
    recordingRef.current = []

    setPhase('chatting')
    setMessages([])
    setMessageCount(0)
    setError(null)
    setNotes(scenario.prePopulatedNotes)
    setPasteCount(0)
    setTypedCount(0)
    setTotalWordsTyped(0)
    setTotalTypingTimeMs(0)
    typingStartRef.current = 0
    lastInputWasPaste.current = false

    if (selectedDuration > 0) {
      setTimeLeft(selectedDuration * 60)
      setTimerActive(true)
    } else {
      setTimeLeft(0)
      setTimerActive(false)
    }

    if (scenario.chatterGoesFirst) {
      const contextLabel = scenario.id === 'goes-quiet'
        ? '*goes quiet after purchasing PPV*'
        : `*${scenario.label.toLowerCase()}*`

      setMessages([{
        id: 'system-context-0',
        role: 'system',
        content: contextLabel,
        timestamp: new Date(),
      }])
      recordEvent('x', contextLabel)
      typingStartRef.current = 0
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setIsTyping(true)
      recordEvent('y')
      try {
        const response = await fetch('/api/chat-aftercare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [],
            subscriberProfile: scenario.subscriberProfile,
            scenarioContext: scenario.scenarioContext,
            scenarioOpener: scenario.subscriberOpener,
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
          const line = subscriberLines[i].trim()
          recordEvent('r', line)
          setMessages(prev => [...prev, {
            id: `sub-init-${i}`,
            role: 'subscriber',
            content: line,
            timestamp: new Date(),
          }])
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
        setError(errorMessage)
      } finally {
        setIsTyping(false)
        recordEvent('z')
        typingStartRef.current = 0
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }

  const sendMessage = () => {
    if (!inputValue.trim() || isTyping) return

    if (lastInputWasPaste.current) {
      setPasteCount(prev => prev + 1)
    } else {
      setTypedCount(prev => prev + 1)
    }

    const now = Date.now()
    if (typingStartRef.current > 0) {
      setTotalTypingTimeMs(prev => prev + (now - typingStartRef.current))
    }
    typingStartRef.current = 0

    const words = inputValue.trim().split(/\s+/).filter(w => w.length > 0).length
    setTotalWordsTyped(prev => prev + words)

    const userMessage: ChatMessage = {
      id: `creator-${Date.now()}`,
      role: 'creator',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setMessageCount(prev => prev + 1)
    setInputValue('')
    recordEvent('s', inputValue.trim())
    recordEvent('i', '')
    setError(null)
    lastInputWasPaste.current = false
    scheduleReply()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleInputChange = (value: string) => {
    if (typingStartRef.current === 0 && value.length > 0) {
      typingStartRef.current = Date.now()
    }
    setInputValue(value)
    recordEvent('i', value)
    if (waitingForIdle && value.length > 0) {
      scheduleReply()
    }
  }

  const endConversation = useCallback(async () => {
    setTimerActive(false)
    resetReplyTimer()
    setWaitingForIdle(false)

    const realMessages = messages.filter(m => m.role !== 'system')
    if (realMessages.length < 4) {
      setError('Please exchange at least a few more messages before ending the conversation.')
      return
    }

    setPhase('evaluating')
    setError(null)

    try {
      const allMessages = realMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/evaluate-aftercare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          notes,
          scenarioLabel: selectedScenario?.label || '',
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to evaluate conversation' }))
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
              notes,
              conversation: messages.map(m => ({ role: m.role, content: m.content })),
              durationMode: selectedDuration === 0 ? 'free' : `${selectedDuration}min`,
              messageCount,
              typedCount,
              pasteCount,
              simulationType: 'aftercare',
              wpm: totalTypingTimeMs > 0 ? Math.round((totalWordsTyped / (totalTypingTimeMs / 60000)) * 10) / 10 : 0,
              sessionRecording: recordingRef.current,
            })
          })
        } catch {
          console.error('Failed to save simulation report')
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please wait a moment and try again.'
      setError(errorMessage)
      setPhase('chatting')
    }
  }, [messages, resetReplyTimer, simUser, notes, selectedScenario, selectedDuration, messageCount, typedCount, pasteCount, totalWordsTyped, totalTypingTimeMs])

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

  // === TEACHER MODE ===
  const startTeacherMode = async () => {
    setPhase('teacher-loading')
    setTeacherError(null)
    setTeacherConversation([])
    setTeacherDisplayIndex(0)
    setTeacherPlaying(false)
    setTeacherEvaluation(null)
    setTeacherExpandedCategories(new Set())

    const scenario = AFTERCARE_SCENARIOS[Math.floor(Math.random() * AFTERCARE_SCENARIOS.length)]
    const nameMatch = scenario.subscriberProfile.match(/Name:\s*(\w+)/)
    const subName = nameMatch ? nameMatch[1] : 'Mike'
    const jobMatch = scenario.subscriberProfile.match(/Job:\s*([^,]+)/)
    const subJob = jobMatch ? jobMatch[1].trim() : 'Electrician'

    setTeacherScenarioNotes(scenario.prePopulatedNotes)
    setTeacherScenarioLabel(scenario.label)

    try {
      const response = await fetch('/api/teacher-aftercare-orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: {
            subscriberName: subName,
            subscriberJob: subJob,
            subscriberDetails: scenario.subscriberProfile,
            scenarioType: scenario.id,
            subscriberOpener: scenario.subscriberOpener,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to generate teacher demo' }))
        throw new Error(data.error || 'Failed to run teacher simulation')
      }

      const data = await response.json()
      setTeacherConversation(data.conversation)
      setTeacherDisplayIndex(0)
      setTeacherPlaying(true)
      setPhase('teacher-watching')
    } catch (err) {
      setTeacherError(err instanceof Error ? err.message : 'Something went wrong')
      setPhase('intro')
    }
  }

  useEffect(() => {
    if (phase === 'teacher-watching' && teacherPlaying && teacherDisplayIndex < teacherConversation.length) {
      teacherPlayIntervalRef.current = setTimeout(() => {
        setTeacherDisplayIndex(prev => prev + 1)
        if (teacherChatRef.current) teacherChatRef.current.scrollTop = teacherChatRef.current.scrollHeight
      }, 2200)
      return () => { if (teacherPlayIntervalRef.current) clearTimeout(teacherPlayIntervalRef.current) }
    }
    if (phase === 'teacher-watching' && teacherDisplayIndex >= teacherConversation.length && teacherConversation.length > 0) {
      setTeacherPlaying(false)
      const t = setTimeout(() => { evaluateTeacherConversation() }, 2000)
      return () => clearTimeout(t)
    }
  }, [phase, teacherPlaying, teacherDisplayIndex, teacherConversation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (teacherChatRef.current) teacherChatRef.current.scrollTop = teacherChatRef.current.scrollHeight
  }, [teacherDisplayIndex])

  const toggleTeacherPause = () => setTeacherPlaying(prev => !prev)
  const skipToEnd = () => {
    if (teacherPlayIntervalRef.current) clearTimeout(teacherPlayIntervalRef.current)
    setTeacherDisplayIndex(teacherConversation.length)
    setTeacherPlaying(false)
  }

  const evaluateTeacherConversation = async () => {
    setPhase('teacher-evaluating')
    setTeacherError(null)

    try {
      const allMessages = teacherConversation.map(m => ({ role: m.role, content: m.content }))

      const evalResponse = await fetch('/api/evaluate-aftercare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, notes: teacherScenarioNotes, scenarioLabel: teacherScenarioLabel || 'Teacher Demo' }),
      })

      if (!evalResponse.ok) {
        const errData = await evalResponse.json().catch(() => ({ error: 'Failed to evaluate' }))
        throw new Error(errData.error || 'Failed to evaluate')
      }

      const data = await evalResponse.json()
      setTeacherEvaluation(data.evaluation)
      setPhase('teacher-results')

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
              notes: '[TEACHER DEMO - AFTERCARE] AI vs AI aftercare demo',
              conversation: teacherConversation.map(m => ({ role: m.role, content: m.content })),
              durationMode: 'teacher',
              messageCount: teacherConversation.length,
              typedCount: 0,
              pasteCount: 0,
              simulationType: 'aftercare-teacher',
              wpm: 0,
              sessionRecording: null,
            }),
          })
        } catch {
          console.error('Failed to save teacher report')
        }
      }
    } catch (err) {
      setTeacherError(err instanceof Error ? err.message : 'Evaluation failed')
      setPhase('teacher-watching')
    }
  }

  const toggleTeacherCategory = (index: number) => {
    setTeacherExpandedCategories(prev => {
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
    setTotalWordsTyped(0)
    setTotalTypingTimeMs(0)
    typingStartRef.current = 0
    lastInputWasPaste.current = false
    setSelectedScenario(null)
    recordingRef.current = []
    sessionStartRef.current = 0
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
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
      })

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
      pdf.save(`aftercare-simulation-results_${name}_${date}.pdf`)
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setExpandedCategories(previousExpanded)
      setExportingPdf(false)
    }
  }

  const subscriberName = selectedScenario
    ? selectedScenario.subscriberProfile.match(/Name:\s*(\w+)/)?.[1] || 'Subscriber'
    : 'Subscriber'

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
                style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
              >
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Aftercare Simulation
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
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#e84393' }}
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
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#e84393' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)', opacity: loginLoading ? 0.7 : 1 }}
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

              <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(232, 67, 147, 0.06)', border: '1px solid rgba(232, 67, 147, 0.15)' }}>
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
                style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
              >
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Aftercare Simulation
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-3" style={{ color: 'var(--text-secondary)' }}>
                Practice your aftercare skills after a PPV exchange.
                The subscriber is in his most emotionally vulnerable state — what you do next determines if he comes back.
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

            {/* MANDATORY GUIDE WARNING */}
            <div
              className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left"
              style={{ background: '#fef2f2', border: '2px solid #fca5a5', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: '#fee2e2' }}>
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2" style={{ color: '#dc2626' }}>
                    DO NOT start this simulation before reading the guide
                  </h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: '#991b1b' }}>
                    You <strong>must</strong> read the full Aftercare Guide <strong>MULTIPLE times</strong> and take notes before attempting this simulation. You won&apos;t remember the stages, the message variations, or the correct tone if you don&apos;t study first. This simulation will score you on all 5 stages — if you haven&apos;t read the guide, you will fail.
                  </p>
                  <a
                    href="https://pentagonal-thief-156.notion.site/AFTERCARE-THE-FULL-GUIDE-310b6586b06d80238d3fc74454ca73fe?source=copy_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
                    style={{ background: '#dc2626', color: '#ffffff' }}
                  >
                    <FileText className="w-4 h-4" />
                    Read the Full Aftercare Guide
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div
              className="max-w-2xl mx-auto rounded-2xl p-8 mb-8 text-left"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e84393' }}>1</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Random Scenario Assigned</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>You&apos;ll be dropped into a random post-PPV situation — he might go quiet, compliment you, feel guilty, open up, deflect with humor, or need to leave. You must handle it.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e84393' }}>2</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notes Are Pre-Populated</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>The notes panel already has his info from earlier phases — name, job, hobbies, personal details. Use these to personalize your aftercare through all 5 stages.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e84393' }}>3</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Follow the 5-Stage Aftercare Flow</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Every aftercare session follows these stages in order:</p>
                    <ol className="text-sm mt-2 space-y-1.5 list-none" style={{ color: 'var(--text-secondary)' }}>
                      <li className="flex items-center gap-2"><span className="font-bold" style={{ color: '#e84393' }}>A.</span> <strong>Breath Moment</strong> — breathless, like it got to you too</li>
                      <li className="flex items-center gap-2"><span className="font-bold" style={{ color: '#e84393' }}>B.</span> <strong>Vulnerability Drop</strong> — soft, honest, hesitant</li>
                      <li className="flex items-center gap-2"><span className="font-bold" style={{ color: '#e84393' }}>C.</span> <strong>Personal Callback</strong> — reference his job, hobbies, details from notes</li>
                      <li className="flex items-center gap-2"><span className="font-bold" style={{ color: '#e84393' }}>D.</span> <strong>Gratitude Close</strong> — warm close, plant the re-entry seed</li>
                      <li className="flex items-center gap-2"><span className="font-bold" style={{ color: '#e84393' }}>E.</span> <strong>Next Day Re-Entry</strong> — seed for tomorrow (planted in D)</li>
                    </ol>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#e84393' }}>4</div>
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Get Scored on 7 Categories</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Emotional authenticity, personalization using notes, name usage, re-engagement seeds, texting style, pacing, and no hard-sell.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(232, 67, 147, 0.08)', border: '1px solid rgba(232, 67, 147, 0.2)' }}>
                <p className="text-sm font-medium" style={{ color: '#e84393' }}>
                  Remember: Aftercare is not the end — it&apos;s the beginning of the next conversation. Any chatter can sell a PPV. Only elite chatters make him feel something after it&apos;s over.
                </p>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="max-w-2xl mx-auto mb-8">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                <Clock className="w-5 h-5 inline-block mr-2 mb-0.5" />
                Choose Duration
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.minutes}
                    onClick={() => setSelectedDuration(opt.minutes)}
                    className="rounded-2xl p-5 text-center transition-all duration-200 hover:scale-[1.03]"
                    style={{
                      background: selectedDuration === opt.minutes ? '#e84393' : 'var(--bg-primary)',
                      color: selectedDuration === opt.minutes ? '#ffffff' : 'var(--text-primary)',
                      border: selectedDuration === opt.minutes ? '2px solid #e84393' : '2px solid var(--border)',
                      boxShadow: selectedDuration === opt.minutes ? '0 4px 20px rgba(232, 67, 147, 0.3)' : 'var(--shadow-sm)',
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

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={startSimulation}
                className="text-lg px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 inline-flex items-center gap-2 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
              >
                <Sparkles className="w-5 h-5" />
                {selectedDuration === 0 ? 'Start Aftercare Simulation' : `Start ${selectedDuration}-Minute Simulation`}
              </button>
              <button onClick={startTeacherMode}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                <GraduationCap className="w-5 h-5" />
                Watch Teacher Demo
              </button>
            </div>
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
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base" style={{ background: '#e84393' }}>👤</div>
                  <div>
                    <p className="font-semibold text-white text-sm">{subscriberName} — Aftercare</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted-on-black)' }}>
                      {selectedScenario?.label || 'Post-PPV scenario'}
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
                    style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)', color: 'white' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">End & Get Score</span>
                      <span className="sm:hidden">End</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4"
                style={{ background: '#f0f0f0', overflowAnchor: 'none' }}
              >
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.role === 'system' ? (
                      <div className="flex justify-center mb-3">
                        <div
                          className="px-4 py-2 rounded-full text-sm italic"
                          style={{ background: 'rgba(232, 67, 147, 0.1)', color: '#e84393', border: '1px solid rgba(232, 67, 147, 0.2)' }}
                        >
                          {message.content}
                        </div>
                      </div>
                    ) : (
                      <div className={`flex ${message.role === 'creator' ? 'justify-end' : 'justify-start'} mb-1.5`}>
                        <div
                          className="max-w-[75%] px-4 py-2.5 rounded-2xl"
                          style={{
                            background: message.role === 'creator' ? '#e84393' : '#ffffff',
                            color: message.role === 'creator' ? '#ffffff' : '#000000',
                            borderBottomRightRadius: message.role === 'creator' ? '4px' : '18px',
                            borderBottomLeftRadius: message.role === 'subscriber' ? '4px' : '18px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          }}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    )}
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
                    onPaste={() => { lastInputWasPaste.current = true; recordEvent('p') }}
                    placeholder="Type your aftercare message..."
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 rounded-full text-[15px] outline-none transition-all duration-200"
                    style={{ background: '#f0f0f0', color: '#000000', border: '1px solid transparent' }}
                    onFocus={(e) => { e.currentTarget.style.border = '1px solid #e84393'; e.currentTarget.style.background = '#ffffff' }}
                    onBlur={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = '#f0f0f0' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                    style={{ background: inputValue.trim() ? '#e84393' : '#d1d5db' }}
                  >
                    <Send className="w-5 h-5 text-white" style={{ transform: 'rotate(-45deg)', marginLeft: '2px' }} />
                  </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: '#999' }}>
                  AI responds after 2s of no typing &bull; use his name from the notes &bull; reference personal details &bull; lowercase everything
                </p>
              </div>
            </div>

            {/* Notes Panel — Desktop (pre-populated, editable) */}
            <div className="hidden lg:flex flex-col w-80 flex-shrink-0">
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-t-2xl flex-shrink-0"
                style={{ background: 'var(--color-black)', color: 'white' }}
              >
                <StickyNote className="w-4 h-4" />
                <span className="font-semibold text-sm">Subscriber Notes (Pre-Populated)</span>
              </div>
              <div className="flex-1 flex flex-col" style={{ background: '#fffef0', border: '1px solid #e8e4c9', borderTop: 'none', borderRadius: '0 0 16px 16px' }}>
                <div className="px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold" style={{ color: '#9a8c5c' }}>
                    These notes were gathered during earlier phases. Use them to personalize your aftercare.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-xs font-semibold" style={{ color: '#9a8c5c' }}>
                        Use these notes to personalize your aftercare.
                      </p>
                    </div>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
              style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Analyzing Your Aftercare...
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Our AI is reviewing your aftercare skills across 7 categories
            </p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#e84393', animationDelay: `${i * 150}ms` }} />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div ref={resultsRef} style={{ background: '#ffffff', padding: '2rem', borderRadius: '1rem' }}>
            {/* Overall Weighted Score */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-36 h-36 rounded-full mb-6 relative"
                style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}
              >
                <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                  <span className="text-4xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>/100</span>
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Aftercare Score: {weightedScore}/100</h2>
              <p className="text-lg font-semibold mb-1" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
              {selectedScenario && (
                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  Scenario: {selectedScenario.icon} {selectedScenario.label}
                </p>
              )}

              {totalTypingTimeMs > 0 && (
                <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl mb-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="text-center">
                    <div className="text-2xl font-black" style={{ color: '#e84393' }}>{Math.round((totalWordsTyped / (totalTypingTimeMs / 60000)) * 10) / 10}</div>
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

            {/* Category Scores with Weights */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {evaluation.categories.map((cat, idx) => {
                const weight = CATEGORY_WEIGHTS[cat.name] || 0
                const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-primary)',
                    border: `2px solid ${expandedCategories.has(idx) ? getCategoryScoreColor(cat.score) : 'var(--border)'}`,
                    boxShadow: expandedCategories.has(idx) ? `0 4px 20px ${getCategoryScoreColor(cat.score)}20` : 'var(--shadow-sm)',
                  }}
                  onClick={() => toggleCategory(idx)}
                >
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

            {/* Detailed Category Breakdowns */}
            <div className="space-y-4 mb-10">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h3>
              {evaluation.categories.map((cat, idx) => {
                const weight = CATEGORY_WEIGHTS[cat.name] || 0
                const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                return (
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
                          <div className="p-4 rounded-xl" style={{ background: 'rgba(232, 67, 147, 0.06)', border: '1px solid rgba(232, 67, 147, 0.15)' }}>
                            <p className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#e84393' }}><Sparkles className="w-4 h-4" />Practice Advice</p>
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
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#e84393' }}>
                        <Sparkles className="w-4 h-4" /> Practice These Scenarios
                      </h4>
                      <div className="space-y-2">
                        {evaluation.overallFeedback.practiceScenarios.map((p, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed" style={{ background: 'rgba(232, 67, 147, 0.06)', border: '1px solid rgba(232, 67, 147, 0.15)', color: '#7c2d12' }}>
                            <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: '#e84393' }}>{i + 1}.</span>
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
                  Subscriber Notes Used
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#5a5530' }}>{notes}</p>
              </div>
            )}

            {/* Conversation Review */}
            <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Your Conversation</h3>
              <div className={`space-y-2 pr-2 ${exportingPdf ? '' : 'max-h-96 overflow-y-auto'}`}>
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.role === 'system' ? (
                      <div className="flex justify-center my-2">
                        <span className="text-xs italic px-3 py-1 rounded-full" style={{ background: 'rgba(232, 67, 147, 0.1)', color: '#e84393' }}>
                          {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                          style={{
                            background: msg.role === 'creator' ? '#e84393' : '#ffffff',
                            color: msg.role === 'creator' ? '#ffffff' : '#000000',
                            borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                            borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            </div>{/* close resultsRef */}

            {/* Export PDF Button */}
            <div className="flex justify-center gap-4 mt-8 mb-8">
              <button
                onClick={exportResultsAsPdf}
                disabled={exportingPdf}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
              >
                {exportingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {exportingPdf ? 'Generating PDF...' : 'Export Results as PDF'}
              </button>
            </div>

            {/* Ways to Get Better */}
            <div className="rounded-2xl p-8 mb-8" style={{ background: 'linear-gradient(135deg, #fdf2f8, #fce7f3)', border: '1px solid #f9a8d4' }}>
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#831843' }}>
                <Sparkles className="w-5 h-5" style={{ color: '#e84393' }} />
                How to Improve
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e84393', color: '#ffffff' }}>1</div>
                  <div>
                    <p className="font-semibold" style={{ color: '#831843' }}>Read your report carefully</p>
                    <p className="text-sm mt-1" style={{ color: '#9d174d' }}>Scroll through the detailed breakdown above. Pay close attention to the &quot;Areas to improve&quot; and &quot;Practice Advice&quot; for each category.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e84393', color: '#ffffff' }}>2</div>
                  <div>
                    <p className="font-semibold" style={{ color: '#831843' }}>Write down what you need to improve</p>
                    <p className="text-sm mt-1" style={{ color: '#9d174d' }}>
                      Grab a piece of paper or open a notes app and write down your specific weak points. You won&apos;t remember them otherwise. Be specific — note the exact category, your score, and what the feedback said.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e84393', color: '#ffffff' }}>3</div>
                  <div>
                    <p className="font-semibold" style={{ color: '#831843' }}>Re-read the Aftercare Guide</p>
                    <p className="text-sm mt-1" style={{ color: '#9d174d' }}>
                      Go back to the full aftercare guide and re-read the stages where you scored lowest. Focus on the specific message variations for each stage.
                    </p>
                    <a
                      href="https://pentagonal-thief-156.notion.site/AFTERCARE-THE-FULL-GUIDE-310b6586b06d80238d3fc74454ca73fe?source=copy_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-[1.02]"
                      style={{ background: '#e84393', color: '#ffffff' }}
                    >
                      <FileText className="w-4 h-4" />
                      Re-read the Aftercare Guide
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#e84393', color: '#ffffff' }}>4</div>
                  <div>
                    <p className="font-semibold" style={{ color: '#831843' }}>Come back and try again</p>
                    <p className="text-sm mt-1" style={{ color: '#9d174d' }}>
                      Once you&apos;ve studied your weak points and re-read the guide, come back and run the simulation again. <strong>Repeat until you&apos;re scoring Elite consistently.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Try Again Button */}
            <div className="text-center">
              <button
                onClick={resetSimulation}
                className="text-lg px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 inline-flex items-center gap-2 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}
              >
                <RotateCcw className="w-5 h-5" />
                Try Another Scenario
              </button>
            </div>
          </motion.div>
          )
        })()}

        {/* TEACHER LOADING */}
        {phase === 'teacher-loading' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Generating Perfect Aftercare...</h2>
            <p className="text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>Two AIs are demonstrating flawless aftercare through all 5 stages. This may take 30-60 seconds.</p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#7c3aed', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
            {teacherError && (
              <div className="mt-6 p-4 rounded-xl max-w-md" style={{ background: '#fef2f2' }}>
                <p className="text-red-600 flex items-center gap-2"><AlertCircle className="w-5 h-5" />{teacherError}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* TEACHER WATCHING */}
        {phase === 'teacher-watching' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white' }}>
                <Eye className="w-4 h-4" />
                <span className="font-bold text-sm">TEACHER DEMO — Aftercare Stages A-E</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {teacherDisplayIndex}/{teacherConversation.length} messages
              </p>
            </div>

            <div ref={teacherChatRef} className="rounded-2xl p-4 mb-4 overflow-y-auto" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', height: '60vh' }}>
              <div className="space-y-3">
                {teacherConversation.slice(0, teacherDisplayIndex).map((msg, idx) => (
                  <div key={idx}>
                    {msg.annotation && (
                      <div className="text-xs px-3 py-1.5 mb-1 rounded-lg mx-auto max-w-[90%] text-center" style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                        {msg.annotation}
                      </div>
                    )}
                    <div className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex flex-col gap-0.5" style={{ maxWidth: '75%' }}>
                        <span className="text-[10px] font-bold px-1" style={{ color: msg.role === 'creator' ? '#7c3aed' : 'var(--text-muted)', textAlign: msg.role === 'creator' ? 'right' : 'left' }}>
                          {msg.role === 'creator' ? 'AI Creator' : 'AI Subscriber'}
                        </span>
                        <div className="px-4 py-2 rounded-2xl text-sm"
                          style={{
                            background: msg.role === 'creator' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#ffffff',
                            color: msg.role === 'creator' ? '#ffffff' : '#000000',
                            borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                            borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                            border: msg.role === 'subscriber' ? '1px solid var(--border)' : 'none',
                          }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {teacherPlaying && teacherDisplayIndex < teacherConversation.length && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-2xl text-sm" style={{ background: '#f3f4f6' }}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button onClick={toggleTeacherPause}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: teacherPlaying ? '#f59e0b' : '#10b981' }}>
                {teacherPlaying ? <><Pause className="w-4 h-4" />Pause</> : <><Play className="w-4 h-4" />Play</>}
              </button>
              <button onClick={skipToEnd}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: '#6b7280' }}>
                <SkipForward className="w-4 h-4" />Skip to End
              </button>
              <button onClick={() => setPhase('intro')}
                className="px-4 py-2.5 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* TEACHER EVALUATING */}
        {phase === 'teacher-evaluating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Evaluating Aftercare Demo...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing emotional authenticity, personalization, and re-engagement</p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 rounded-full animate-bounce" style={{ background: '#7c3aed', animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* TEACHER RESULTS */}
        {phase === 'teacher-results' && teacherEvaluation && (() => {
          const weightedScore = calculateWeightedScore(teacherEvaluation.categories)
          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white' }}>
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-bold text-sm">TEACHER&apos;S RESULTS — AFTERCARE DEMO</span>
                </div>
              </div>

              <div className="text-center mb-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-36 h-36 rounded-full mb-6 relative"
                  style={{ background: `conic-gradient(${getScoreColor(weightedScore)} ${weightedScore}%, #e5e7eb ${weightedScore}%)` }}>
                  <div className="w-28 h-28 rounded-full flex flex-col items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
                    <span className="text-4xl font-black" style={{ color: getScoreColor(weightedScore) }}>{weightedScore}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Teacher Score: {weightedScore}/100</h2>
                <p className="text-lg font-semibold mb-4" style={{ color: getScoreColor(weightedScore) }}>{getScoreLabel(weightedScore)}</p>
              </div>

              <div className="rounded-2xl overflow-hidden mb-10" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
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
                    {teacherEvaluation.categories.map((cat, idx) => {
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

              <div className="space-y-4 mb-10">
                {teacherEvaluation.categories.map((cat, idx) => {
                  const weight = CATEGORY_WEIGHTS[cat.name] || 0
                  const earned = Math.round(((cat.score / 10) * weight) * 10) / 10
                  return (
                    <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * idx }}
                      className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                      <button onClick={() => toggleTeacherCategory(idx)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors duration-200"
                        style={{ background: teacherExpandedCategories.has(idx) ? 'var(--bg-secondary)' : 'transparent' }}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${getCategoryScoreColor(cat.score)}15`, color: getCategoryScoreColor(cat.score) }}>
                            {cat.score}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{earned}/{weight} pts</p>
                          </div>
                        </div>
                        {teacherExpandedCategories.has(idx) ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
                      </button>
                      <AnimatePresence>
                        {teacherExpandedCategories.has(idx) && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-6 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{cat.feedback}</p>
                              {cat.examples?.good?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold uppercase mb-1" style={{ color: '#10b981' }}>What the AI did well:</p>
                                  {cat.examples.good.map((g, i) => (
                                    <p key={i} className="text-sm pl-3 border-l-2" style={{ borderColor: '#10b981', color: 'var(--text-secondary)' }}>{g}</p>
                                  ))}
                                </div>
                              )}
                              {cat.examples?.needsWork?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold uppercase mb-1" style={{ color: '#f59e0b' }}>Could improve:</p>
                                  {cat.examples.needsWork.map((n, i) => (
                                    <p key={i} className="text-sm pl-3 border-l-2" style={{ borderColor: '#f59e0b', color: 'var(--text-secondary)' }}>{n}</p>
                                  ))}
                                </div>
                              )}
                              {cat.advice && (
                                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(124, 58, 237, 0.05)', border: '1px solid rgba(124, 58, 237, 0.15)', color: '#5b21b6' }}>
                                  <strong>Key Takeaway:</strong> {cat.advice}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>

              <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Teacher Conversation</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {teacherConversation.map((msg, idx) => (
                    <div key={idx}>
                      {msg.annotation && (
                        <div className="text-xs px-3 py-1 mb-1 rounded-lg text-center" style={{ background: 'rgba(124, 58, 237, 0.06)', color: '#7c3aed' }}>
                          {msg.annotation}
                        </div>
                      )}
                      <div className={`flex ${msg.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm"
                          style={{
                            background: msg.role === 'creator' ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#ffffff',
                            color: msg.role === 'creator' ? '#ffffff' : '#000000',
                            borderBottomRightRadius: msg.role === 'creator' ? '4px' : '18px',
                            borderBottomLeftRadius: msg.role === 'subscriber' ? '4px' : '18px',
                            border: msg.role === 'subscriber' ? '1px solid var(--border)' : 'none',
                          }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button onClick={() => setPhase('intro')}
                  className="text-lg px-10 py-4 rounded-xl font-semibold text-white transition-all duration-200 inline-flex items-center gap-2 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #e84393, #fd79a8)' }}>
                  <RotateCcw className="w-5 h-5" />
                  Back to Menu
                </button>
              </div>
            </motion.div>
          )
        })()}
      </div>
    </div>
  )
}
