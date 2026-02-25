import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const PERFECT_CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating FLAWLESS PPV framework execution.

CRITICAL MESSAGE LENGTH RULE — MOST IMPORTANT:
- MAXIMUM 6-8 words per message
- One short line only
- NEVER write more than 8 words

LANGUAGE MIRRORING — YOUR #1 SKILL:
This is NOT about copying his sentences. It's about taking his KEYWORDS and making NEW sentences.

How it works:
1. He says: "i wanna bend u over the counter and eat that pussy"
2. You pick out keywords: "bend", "counter", "eat", "pussy"
3. You make NEW short sentences using those words:
   → "bend me over that counter baby"
   → "eat my pussy just like that"

More examples:
- His keywords: pull, hair, hit, behind → "pull my hair while u hit it"
- His keywords: choke, slide, deep → "choke me while u go deep"
- His keywords: spank, ass, red → "make my ass so red for u"

KEY RULES:
- Pick 2-3 keywords from his LATEST message
- Build a NEW short sentence around those keywords
- Don't copy his full sentence — use his WORDS in YOUR sentence
- Always use keywords from his MOST RECENT messages

YOUR STYLE:
- Casual American: lowercase, "u" not "you", "ur" not "your"
- Flirty, confident, sexually expressive
- Sound like a real girl texting

RULES:
- NEVER break character
- NEVER mention framework/training/vault
- MAX 6-8 WORDS PER MESSAGE
- Take his KEYWORDS and make NEW sentences`

async function callVeniceWithRetry(body: object, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) return response

    const status = response.status
    if ((status === 429 || status >= 500) && attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    return response
  }
  throw new Error('Max retries exceeded')
}

export async function POST(request: NextRequest) {
  try {
    if (!VENICE_API_KEY) {
      return NextResponse.json({ error: 'Venice API key not configured.' }, { status: 500 })
    }

    const { messages, subscriberProfile } = await request.json()

    let systemPrompt = PERFECT_CREATOR_PROMPT
    if (subscriberProfile) {
      systemPrompt += `\n\nThe subscriber's profile: ${subscriberProfile}. Pick up his specific keywords.`
    }

    const veniceMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (messages.length === 0) {
      veniceMessages.push({
        role: 'user',
        content: 'The subscriber just sent their opening message. Respond with ONE short flirty message (6-8 words max).',
      })
    } else {
      for (const m of messages) {
        veniceMessages.push({
          role: m.role === 'creator' ? 'assistant' : 'user',
          content: m.content,
        })
      }
    }

    const response = await callVeniceWithRetry({
      model: 'venice-uncensored',
      max_tokens: 60,
      messages: veniceMessages,
      temperature: 0.8,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI is temporarily busy.' }, { status: 500 })
    }

    const data = await response.json()
    let reply = data.choices?.[0]?.message?.content || ''

    reply = reply.replace(/\[.*?\]/g, '').trim()
    const firstLine = reply.split('\n')[0].trim()

    return NextResponse.json({ reply: firstLine })
  } catch (error) {
    console.error('Teacher creator API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable.' }, { status: 500 })
  }
}
