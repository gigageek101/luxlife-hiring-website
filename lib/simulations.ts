// Configs for the guide-practice simulations rendered by components/simulation/PracticeSimulation.tsx.
// The subscriber prompts and grading rubrics live server-side in the chat/evaluate routes.

export type SimulationType = 'connection' | 'topic-change'

export interface SimulationConfig {
  type: SimulationType
  path: string
  title: string
  emoji: string
  color: string
  gradient: string
  guideSlug: string
  guideTitle: string
  chatApi: string
  evaluateApi: string
  /** Who writes first. */
  opener: 'creator' | 'subscriber'
  /** Grey note shown at the start of the chat. */
  startNote: string
  intro: string
  howItWorks: string[]
  inputHint: string
  notesPlaceholder: string
  categoryWeights: Record<string, number>
  /** Random session extras sent with every request (kept consistent for the whole chat). */
  createSession: () => Record<string, unknown>
}

export const CONNECTION_WEIGHTS: Record<string, number> = {
  'Pulling the Thread (Why / How / What)': 25,
  'Digging Into Feeling, Cause & Impact': 25,
  'Mirroring & Naming His Values': 20,
  'Staying on One Thread (No Topic Jumping)': 15,
  'Short Openers & One Question at a Time': 10,
  'What You Learned About Him': 5,
}

export const TOPIC_WEIGHTS: Record<string, number> = {
  'Soft Acknowledgement, Never Defensive': 25,
  'Flip the Script & Redirect With a Question': 25,
  'Humanizing Detail or Flaw': 20,
  'Keeps the Vibe Flowing After Each Objection': 15,
  'Playful Tone, Emojis, Not Scripted': 15,
}

export const CONNECTION_PROFILE_COUNT = 6

/** The 18 objections from the Changing the Topic guide, grouped like the guide. */
export const OBJECTIONS: string[][] = [
  ["Why are you always online? Don't you sleep?", 'You reply so slow. Are you talking to other people?', 'Your messages sound too perfect. Are you copying and pasting?'],
  ["That voice memo is prerecorded because you didn't say my name.", "Why don't you ever say my name in voice notes?", "Send me a video right now to prove it's you."],
  ['Girl are you reading off a script be honest lol', 'You sound like a bot.', "This feels like you're interviewing me."],
  ['Why do you take so long to reply?', "You said you'd message and didn't.", 'When can we actually meet up?'],
  ['Why do you keep asking for tips?', 'You only care about money.', "Other girls don't charge for that."],
  ["Aren't I too old for you?", 'Why do you like talking to older guys?', "You're probably talking to tons of guys."],
]

function pickObjections(): string[] {
  const groups = [...OBJECTIONS].sort(() => Math.random() - 0.5).slice(0, 5)
  return groups.map((group) => group[Math.floor(Math.random() * group.length)])
}

export const SIMULATIONS: Record<SimulationType, SimulationConfig> = {
  connection: {
    type: 'connection',
    path: '/chattingsimulation5',
    title: 'Connection Building',
    emoji: '📶',
    color: '#0891b2',
    gradient: 'linear-gradient(135deg, #0891b2, #0e7490)',
    guideSlug: 'connection-guide',
    guideTitle: 'Connection Guide',
    chatApi: '/api/chat-connection',
    evaluateApi: '/api/evaluate-connection',
    opener: 'creator',
    startNote: "*he subscribed and is looking at your page, but he hasn't written anything. you open the chat*",
    intro: 'A closed-off subscriber who answers with one word. He only opens up if you pull the thread of what he just said, dig into feeling, cause and impact, and mirror his values. Find out what actually matters to him.',
    howItWorks: [
      'You open with a short question (7 words or less). He answers with one word.',
      'Pull ONE thread: why / how / what about the thing he just said. Do not change the topic until he has fully opened up on it.',
      'Dig deeper: "How did that feel?", "Why is that?", "How did that change you?". Then mirror: "so X really matters to you".',
      'Write what you learn about him in the notes. The grader checks whether you uncovered his real values.',
    ],
    inputHint: 'AI responds after 2s of no typing • ONE question at a time • pull the thread, never jump topics',
    notesPlaceholder: 'What you learned about him...\n\n• Values: \n• Pattern: \n• What shaped him: \n• Key details: ',
    categoryWeights: CONNECTION_WEIGHTS,
    createSession: () => ({ profileId: Math.floor(Math.random() * CONNECTION_PROFILE_COUNT) }),
  },
  'topic-change': {
    type: 'topic-change',
    path: '/chattingsimulation6',
    title: 'Changing the Topic',
    emoji: '👒',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    guideSlug: 'changing-the-topic',
    guideTitle: 'Changing the Topic Guide',
    chatApi: '/api/chat-topic',
    evaluateApi: '/api/evaluate-topic',
    opener: 'subscriber',
    startNote: '*a skeptical subscriber. he will test you with objections during the chat*',
    intro: 'A skeptical subscriber who chats normally but keeps throwing objections: "are you a bot?", "why are you always online?", "send a video to prove it\'s you", "you only care about money". Handle every one of them the way the guide teaches, then get him talking about himself again.',
    howItWorks: [
      'He messages first. Chat normally; every couple of messages he raises an objection from the guide.',
      'Acknowledge with vulnerability or humor, never defensive. Add a human flaw ("i\'m awkward over text", "i fell asleep with my phone lol").',
      'Flip the script and end with a question about HIM. That is what redirects the conversation.',
      'If you argue, ignore it, or forget the question, he pushes harder and goes cold. If you handle it, he accepts it and moves on.',
    ],
    inputHint: 'AI responds after 2s of no typing • soften with emojis • always end with a question about him',
    notesPlaceholder: 'Objections he raised and how you handled them...\n\n• Objection: \n• My answer: \n• Did he accept it? ',
    categoryWeights: TOPIC_WEIGHTS,
    createSession: () => ({ objections: pickObjections() }),
  },
}

export function weightedScore(categories: { name: string; score: number }[], weights: Record<string, number>): number {
  const total = categories.reduce((sum, cat) => sum + (cat.score / 10) * (weights[cat.name] ?? 0), 0)
  return Math.round(total)
}
