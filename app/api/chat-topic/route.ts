import { NextRequest, NextResponse } from 'next/server'
import { CLAUDE_MODEL, CLAUDE_CHAT_SETTINGS, claudeRefused, claudeStopInfo, claudeText } from '@/lib/claude'
import { callClaude } from '@/lib/claude-server'

export const dynamic = 'force-dynamic'

const OPENERS = ['hey', 'sup', 'hey how are u', 'hi', 'hey whats up']

function systemPrompt(objections: string[]): string {
  const plan = objections.map((o, i) => `${i + 1}. "${o}"`).join('\n')
  return `You are simulating a real OnlyFans subscriber for a training exercise about handling objections. You are a blue-collar American man, 35-50, a bit skeptical and testing whether the creator (a woman) is real and worth his time.

NORMAL CHAT: short casual messages, 1-8 words, lowercase American texting ("yeah", "lol", "not much", "work was long"). Answer her questions briefly. Do not ask questions unless she just handled an objection well.

YOUR OBJECTION PLAN. Raise these, in this exact order, ONE per message, roughly every second reply of yours, starting with your second reply. Read the conversation to see which ones you already raised and never repeat one:
${plan}

HOW YOU REACT TO HER ANSWER TO AN OBJECTION:
- She handled it WELL = she stays soft or playful (no arguing), admits a human flaw or gives a relatable excuse, and ENDS WITH A QUESTION about you: accept it ("haha ok fair", "lol alright") and answer her question briefly. Warm up a little.
- She handled it BADLY = she gets defensive, argues, lectures, ignores the objection, or does not ask you anything back: push once more, harder and shorter ("idk man thats sus", "u didnt answer me"). If she fails a second time, go cold: one-word replies for the next two messages, then continue the plan.
- After all objections are done, chat normally and slightly warmer.
Never break character, never mention the plan, the exercise or the guide. Never more than 2 sentences.`
}

export async function POST(request: NextRequest) {
  try {
    const { messages, objections } = await request.json()
    const plan = Array.isArray(objections) && objections.length ? objections.map(String).slice(0, 8) : ['You sound like a bot.', 'Why are you always online? Don\'t you sleep?', 'You only care about money.']
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: OPENERS[Math.floor(Math.random() * OPENERS.length)] })
    }
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))
    const response = await callClaude('chat-topic', {
      model: CLAUDE_MODEL,
      ...CLAUDE_CHAT_SETTINGS,
      max_tokens: 160,
      system: systemPrompt(plan),
      messages: claudeMessages,
    })
    if (!response.ok) {
      console.error('Claude API error after retries:', response.errorText)
      return NextResponse.json({ error: 'AI is temporarily busy. Please wait a moment and try again.' }, { status: 500 })
    }
    if (claudeRefused(response.data)) {
      console.error('Topic chat: Claude declined the request:', claudeStopInfo(response.data))
      return NextResponse.json({ error: 'AI could not respond to that message. Please rephrase and try again.' }, { status: 500 })
    }
    return NextResponse.json({ reply: claudeText(response.data) })
  } catch (error) {
    console.error('Topic chat API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable. Please try again in a few seconds.' }, { status: 500 })
  }
}
