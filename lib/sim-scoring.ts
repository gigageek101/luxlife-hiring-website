// Single source of truth for simulation scoring: weights, weighted score, colours, labels.
import { CONNECTION_WEIGHTS, TOPIC_WEIGHTS } from '@/lib/simulations'

export interface SimCategory {
  name: string
  score: number
  feedback: string
  examples: { good: string[]; needsWork: string[] }
  advice: string
}

/** Added by every grader inside overallFeedback: did the trainee follow the guide's flow? */
export interface ScriptAdherence {
  score: number
  verdict: string
  followed: string[]
  deviations: string[]
}

export interface OverallFeedback {
  strengths: string[]
  weaknesses: string[]
  missedOpportunities: string[]
  practiceScenarios: string[]
  summary: string
  scriptAdherence?: ScriptAdherence
  objectionsHandled?: { objection: string; handled: string; note: string }[]
}

export const CHATTING_CATEGORY_WEIGHTS: Record<string, number> = {
  'Giving Him What He Wants to Hear': 25,
  'Making the Subscriber Feel Special': 20,
  'Caring About the Subscriber': 15,
  'Asking the Right Questions': 15,
  'American Accent & Texting Style': 10,
  'Grammar & Natural Flow': 10,
  'Note-Taking & Information Tracking': 5,
}

export const SEXTING_CATEGORY_WEIGHTS: Record<string, number> = {
  'Correct Framework Order': 35,
  'Language Mirroring': 30,
  'Tension Building Between PPVs': 25,
  'Response Speed & Engagement': 10,
}

export const AFTERCARE_CATEGORY_WEIGHTS: Record<string, number> = {
  'Emotional Authenticity & Vulnerability': 25,
  'Personalization Using His Notes': 22,
  'Name Usage & Intimacy Anchoring': 18,
  'Re-engagement Seed Planting': 15,
  'Texting Style & Casual American Flow': 10,
  'Pacing & Message Timing': 7,
  'No Hard-Sell / No Desperation': 3,
}

export const COMBINED_CATEGORY_WEIGHTS: Record<string, number> = {
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

export function getWeightsForType(simType?: string): Record<string, number> {
  if (simType === 'sexting' || simType === 'sexting-teacher') return SEXTING_CATEGORY_WEIGHTS
  if (simType === 'aftercare') return AFTERCARE_CATEGORY_WEIGHTS
  if (simType === 'combined') return COMBINED_CATEGORY_WEIGHTS
  if (simType === 'connection') return CONNECTION_WEIGHTS
  if (simType === 'topic-change') return TOPIC_WEIGHTS
  return CHATTING_CATEGORY_WEIGHTS
}

export function getWeightsForReport(report: { simulationType: string }): Record<string, number> {
  return getWeightsForType(report.simulationType)
}

export function calculateWeightedScore(categories: SimCategory[], simType?: string): number {
  const weights = getWeightsForType(simType)
  let total = 0
  for (const cat of categories) total += (cat.score / 10) * (weights[cat.name] || 0)
  return Math.round(total * 10) / 10
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981'
  if (score >= 70) return '#f59e0b'
  if (score >= 55) return '#f97316'
  if (score >= 40) return '#ef4444'
  return '#dc2626'
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Elite'
  if (score >= 70) return 'Strong'
  if (score >= 55) return 'Developing'
  if (score >= 40) return 'Below Average'
  return 'Needs Immediate Coaching'
}

export function getCategoryScoreColor(score: number): string {
  if (score >= 8) return '#10b981'
  if (score >= 6) return '#f59e0b'
  if (score >= 4) return '#f97316'
  return '#ef4444'
}

export function getSimTypeLabel(type: string): string {
  switch (type) {
    case 'chatting': return 'Relationship Building'
    case 'sexting': return 'Sexting'
    case 'aftercare': return 'Aftercare'
    case 'combined': return 'Full Session'
    case 'connection': return 'Connection'
    case 'topic-change': return 'Changing the Topic'
    case 'chat-teacher': return 'Chat Teacher'
    case 'sexting-teacher': return 'Sexting Teacher'
    case 'aftercare-teacher': return 'Aftercare Teacher'
    default: return type
  }
}

/** overall_feedback is stored as JSON text; older rows may hold plain text. */
export function parseFeedback(raw: unknown): OverallFeedback | null {
  if (!raw) return null
  if (typeof raw === 'object') return raw as OverallFeedback
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? (parsed as OverallFeedback) : null
    } catch {
      return null
    }
  }
  return null
}
