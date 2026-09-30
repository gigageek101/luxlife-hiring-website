// Registry of the chatting guides hosted under /guides/<slug>.
// Content lives in content/guides/<slug>.html (converted from the Notion "Chatting Skills" export
// with scripts/convert-notion-guide.py). Order inside a step is the order on the index page.

export type GuideStep = 'simulation' | 'general' | 'score' | 'systems'

export interface Guide {
  slug: string
  title: string
  emoji: string
  step: GuideStep
  /** Simulation this guide prepares for (Step 1 guides only). */
  simulation?: string
  simulationLabel?: string
  /** Weight in the MyChattersDream 100-point score (Step 3 guides only). */
  points?: number
}

export const STEP_INFO: Record<GuideStep, { title: string; subtitle: string; anchor: string }> = {
  simulation: { title: 'Step 1 — Simulation guides', subtitle: 'Read these before the matching simulation. The graders score you on exactly this material.', anchor: 'step-1' },
  general: { title: 'Step 2 — General guides', subtitle: 'No simulation for these, but every chat uses them. Read them all.', anchor: 'step-2' },
  score: { title: 'Step 3 — How to reach a 100 score', subtitle: 'The MyChattersDream categories and their weight in your daily score.', anchor: 'step-3' },
  systems: { title: 'Systems', subtitle: 'Tools that make you faster.', anchor: 'systems' },
}

const SIM_1 = { simulation: '/chattingsimulation', simulationLabel: 'Relationship Building Simulation' }
const SIM_2 = { simulation: '/chattingsimulation2', simulationLabel: 'Sexting & PPV Simulation' }
const SIM_3 = { simulation: '/chattingsimulation3', simulationLabel: 'Aftercare Simulation' }

export const GUIDES: Guide[] = [
  { slug: 'relationship-building', title: 'Complete PRACTICAL Subscriber Relationship Building Guide', emoji: '📋', step: 'simulation', ...SIM_1 },
  { slug: 'sexting', title: 'Sexting Guide', emoji: '👄', step: 'simulation', ...SIM_2 },
  { slug: 'aftercare-full-guide', title: 'AFTERCARE - THE FULL GUIDE', emoji: '🔅', step: 'simulation', ...SIM_3 },
  { slug: 'aftercare-keywords', title: 'AFTERCARE KEYWORDS', emoji: '🆕', step: 'simulation', ...SIM_3 },
  { slug: 'complete-aftercare-keyword-guide', title: 'COMPLETE AFTERCARE KEYWORD GUIDE', emoji: '🫂', step: 'simulation', ...SIM_3 },
  { slug: 'connection-guide', title: 'Connection Guide - How to Build an Emotional Connection with subs', emoji: '📶', step: 'general' },
  { slug: 'changing-the-topic', title: 'Changing the Topic Guide', emoji: '👒', step: 'general' },
  { slug: 'stop-selling-ppvs', title: 'When to STOP selling PPVs after multiple purchases', emoji: '✋🏻', step: 'general' },
  { slug: 'not-pushing-to-sell', title: 'When to NOT push to selling content', emoji: '🙅🏻', step: 'general' },
  { slug: 'objection-handling', title: 'Objection Handling Guide', emoji: '📛', step: 'score', points: 5 },
  { slug: 'tip-extraction', title: 'Tip Extraction & Organic Monetization Guide', emoji: '💰', step: 'score', points: 5 },
  { slug: 're-engagement-seeding', title: 'Re-engagement Seeding Guide', emoji: '↪️', step: 'score', points: 10 },
  { slug: 'texting-style', title: 'Texting Style & Natural Flow Guide', emoji: '💬', step: 'score', points: 15 },
  { slug: 'name-usage', title: 'Name Usage & Personalization Guide', emoji: '🏷️', step: 'score', points: 15 },
  { slug: 'conversation-flow', title: 'Conversation Flow & Question Strategy', emoji: '🔄', step: 'score', points: 15 },
  { slug: 'subscriber-validation', title: 'Subscriber Validation Guide', emoji: '👑', step: 'score', points: 10 },
  { slug: 'ppv-selling-framework', title: 'PPV Selling Framework', emoji: '🎬', step: 'score', points: 10 },
  { slug: 'message-pacing', title: 'Message Pacing & Reply Speed Guide', emoji: '⚡', step: 'score', points: 10 },
  { slug: 'no-hard-sell', title: 'No Hard-Sell & Professional Compliance Guide', emoji: '🚫', step: 'score', points: 5 },
  { slug: 'wholesomeness', title: '💖 Wholesomeness — The Missing Soul in Your Chats', emoji: '💖', step: 'score' },
  { slug: 'hotkey-system', title: 'HOTKEY SYSTEM (IN PROGRESS)', emoji: '🤓', step: 'systems' },
]

export const STEP_ORDER: GuideStep[] = ['simulation', 'general', 'score', 'systems']

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug)
}

export function guidesForStep(step: GuideStep): Guide[] {
  return GUIDES.filter((guide) => guide.step === step)
}
