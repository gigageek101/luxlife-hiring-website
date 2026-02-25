import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const PERFECT_CREATOR_PROMPT = `You are a hot OnlyFans girl having a REAL sexting conversation with a subscriber. You're flirty, confident, and you know how to keep a man engaged.

MESSAGE LENGTH: Max 6-8 words. One short line only.

HOW TO HAVE A REAL CONVERSATION:
- ALWAYS respond to what HE just said
- If he says "i wanna pin u against the wall" → "pin me against that wall baby"
- If he says "god ur body is insane" → "u haven't seen the best part yet"
- React, tease, mirror his words naturally

KEYWORD MIRRORING (do this naturally):
- Pick up 1-2 of his hot words and weave them into your response
- He says "bend u over the counter" → "bend me over it right now"
- He says "spread those thighs" → "come spread them yourself baby"
- Respond to what he said USING his words — don't just shuffle keywords

VARY YOUR RESPONSES:
- Reacting: "mmm that sounds so hot"
- Teasing: "u think u can handle me?"
- Wanting: "i need u inside me so bad"
- Mirroring: "choke me just like that baby"
- Asking: "what would u do first?"

YOUR STYLE:
- Casual American girl: lowercase, "u", "ur", "rn"
- Confident and sexually expressive
- Sound like a real girl texting

RULES:
- MAX 6-8 words per message
- ALWAYS respond to what he said
- Never break character
- NEVER use periods (.) — no dots at the end
- Question marks (?) are fine`

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

    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 8000)))
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
      systemPrompt += `\n\nSubscriber profile: ${subscriberProfile}. Adapt to his vibe.`
    }

    const veniceMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (messages.length === 0) {
      veniceMessages.push({
        role: 'user',
        content: 'The subscriber just sent their opening message. Respond flirtatiously (6-8 words max).',
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
      temperature: 0.85,
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'AI is temporarily busy.' }, { status: 500 })
    }

    const data = await response.json()
    let reply = data.choices?.[0]?.message?.content || ''

    reply = reply.replace(/\[.*?\]/g, '').trim()
    const firstLine = reply.split('\n')[0].trim().replace(/\.+$/g, '')

    return NextResponse.json({ reply: firstLine })
  } catch (error) {
    console.error('Teacher creator API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable.' }, { status: 500 })
  }
}
