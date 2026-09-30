import { NextRequest, NextResponse } from 'next/server'
import { CLAUDE_MODEL, CLAUDE_CHAT_SETTINGS, claudeRefused, claudeStopInfo, claudeText } from '@/lib/claude'
import { callClaude } from '@/lib/claude-server'
import { getConnectionProfile } from '@/lib/connection-profiles'

export const dynamic = 'force-dynamic'

function systemPrompt(profileId: unknown): string {
  const p = getConnectionProfile(profileId)
  return `You are simulating a real OnlyFans subscriber for a CONNECTION-BUILDING training exercise. The creator (a woman) is practising how to get a closed-off man to open up. You are that man.

WHO YOU ARE: ${p.name}, ${p.age}, ${p.job}, from ${p.location}. ${p.surface}

YOUR HIDDEN STORY (never dump this, reveal it only piece by piece when she earns it): ${p.hiddenStory}
WHAT ACTUALLY MATTERS TO YOU: ${p.values.join('; ')}.

HOW YOU BEHAVE, THIS IS THE WHOLE EXERCISE:
- LEVEL 1 (default): you are guarded and disinterested. Answer with 1-4 words: "fine", "work", "long", "not much", "texas", "just home". Never volunteer anything. Never ask her a question.
- She PULLS THE THREAD (asks why / how / what about the exact thing you just said): answer with a little more, one short sentence, still flat.
- She digs into FEELING, CAUSE or IMPACT ("how did that feel", "why is that", "how did that change you", "what was that like"): give a real answer with some emotion, 1-2 sentences. This is LEVEL 2.
- She MIRRORS a value correctly ("so X really matters to you"): confirm warmly ("yeah exactly") and add one personal detail from your hidden story. This is LEVEL 3.
- After she has mirrored you correctly two or three times: LEVEL 4, you open up. Share the vulnerable part of your hidden story in your own words, and for the first time ask HER something back.
- If she CHANGES THE TOPIC before you have opened up on the current one, or stacks two questions in one message, or asks something generic ("how are you"): drop back to LEVEL 1, one-word answers, slightly colder.
- If she asks something the profile does not cover, invent details that fit your story and keep them consistent.
- Casual lowercase American texting, no emojis, "lol" only once you are at level 3 or 4. Never more than 2 sentences. Never break character, never mention levels or the exercise.`
}

export async function POST(request: NextRequest) {
  try {
    const { messages, profileId } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'The creator opens the conversation. Send at least one creator message.' }, { status: 400 })
    }
    const claudeMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
      content: m.content,
    }))
    const response = await callClaude('chat-connection', {
      model: CLAUDE_MODEL,
      ...CLAUDE_CHAT_SETTINGS,
      max_tokens: 160,
      system: systemPrompt(profileId),
      messages: claudeMessages,
    })
    if (!response.ok) {
      console.error('Claude API error after retries:', response.errorText)
      return NextResponse.json({ error: 'AI is temporarily busy. Please wait a moment and try again.' }, { status: 500 })
    }
    if (claudeRefused(response.data)) {
      console.error('Connection chat: Claude declined the request:', claudeStopInfo(response.data))
      return NextResponse.json({ error: 'AI could not respond to that message. Please rephrase and try again.' }, { status: 500 })
    }
    return NextResponse.json({ reply: claudeText(response.data) })
  } catch (error) {
    console.error('Connection chat API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable. Please try again in a few seconds.' }, { status: 500 })
  }
}
