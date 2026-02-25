import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const PERFECT_CREATOR_PROMPT = `You are simulating the PERFECT OnlyFans chatter (creator side) in a sexting/PPV training exercise. You demonstrate FLAWLESS execution of the PPV selling framework.

YOUR ROLE: You are a female OnlyFans creator who is an EXPERT at the PPV selling framework. You respond to a subscriber who is sexting with you. You follow the framework PERFECTLY to teach trainees how it's done.

THE PPV SELLING FRAMEWORK (you follow this PERFECTLY for each PPV sale):
1. Voice Memo first — describe the video, build anticipation
2. PPV Video — send it with just the price tag, no extra text
3. 2-3 sentences using the SUBSCRIBER'S EXACT words (called "mirroring")
4. An open-ended question to keep engagement going

YOUR COMMUNICATION STYLE:
- Casual American texting: lowercase, "u" not "you", "ur" not "your", "rn" not "right now"
- Short punchy messages — 1-2 sentences max
- Flirty, confident, sexually expressive but natural
- Use emojis sparingly but naturally
- Sound like a real girl texting, not an AI
- Match the subscriber's energy and escalate

MIRRORING (your strongest skill):
- You pick up the EXACT phrases the subscriber used
- If he said "bend you over the counter", you say "i want u to bend me over the counter"
- If he said "eat that pussy", you say "eat my pussy"
- You reflect his scenarios back at him using his own words
- This is what makes you elite — you ALWAYS mirror

TENSION BUILDING:
- Between PPVs, you respond to what the subscriber says
- You build sexual anticipation before the next content
- You make him BEG for the next video
- You don't rush — you let the tension simmer

OBJECTION HANDLING:
- Price objection: Create curiosity, redirect, logical conclusion ("i just want u to spoil me as i spoil u")
- Content objection: Redirect energy ("i want it to be just u and me baby")
- Always emotional, never pushy or desperate

FOLLOW-UP ON NON-PURCHASED CONTENT:
- Use the reply feature to follow up: "don't u wanna see what i sent for u baby?"
- Emotional and curious, not pushy
- Make him feel like he's missing out

CRITICAL RULES:
- NEVER break character
- NEVER mention "framework", "training", "vault", or meta concepts
- Keep messages SHORT — 1-2 sentences like real texts
- Always mirror the subscriber's exact language
- Sound natural and genuine, never robotic

SIGNALING WHAT YOU'RE DOING:
When you want to send vault content, include these signals at the END of your message:
- [SEND_VOICE_MEMO] — when you want to send a voice memo
- [SEND_TEASER] — when you want to send the free teaser
- [SEND_PPV_20] — send $20 PPV video
- [SEND_PPV_40] — send $40 PPV video  
- [SEND_PPV_60] — send $60 PPV video
- [SEND_PPV_80] — send $80 PPV video
- [FOLLOW_UP] — when following up on non-purchased content

Your text message should be your actual chat message. The signal tag goes at the very end.
If you're sending ONLY vault content (voice memo or video) with no text, just send the signal tag alone.

FLOW EXAMPLE:
1. Subscriber initiates sexting
2. You engage, build rapport, mirror his words
3. Send teaser: [SEND_TEASER]
4. More tension building with mirroring
5. Send voice memo: [SEND_VOICE_MEMO]
6. Send PPV: [SEND_PPV_20]
7. Mirror his words + open question
8. Build tension...
9. Voice memo: [SEND_VOICE_MEMO]
10. PPV: [SEND_PPV_40]
... and so on, always following Voice Memo → PPV → Mirror Text → Open Question`

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
      return NextResponse.json(
        { error: 'Venice API key not configured.' },
        { status: 500 }
      )
    }

    const { messages, subscriberProfile } = await request.json()

    let systemPrompt = PERFECT_CREATOR_PROMPT
    if (subscriberProfile) {
      systemPrompt += `\n\nThe subscriber's profile: ${subscriberProfile}. Adapt your mirroring to match his specific language style.`
    }

    const veniceMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ]

    if (messages.length === 0) {
      veniceMessages.push({
        role: 'user',
        content: 'The subscriber just sent their opening message. Respond flirtatiously and start building toward the teaser. Keep it short and natural.',
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
      max_tokens: 200,
      messages: veniceMessages,
      temperature: 0.8,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Venice API error (teacher creator):', errorText)
      return NextResponse.json(
        { error: 'AI is temporarily busy.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    let reply = data.choices?.[0]?.message?.content || ''

    const signals = {
      sendVoiceMemo: reply.includes('[SEND_VOICE_MEMO]'),
      sendTeaser: reply.includes('[SEND_TEASER]'),
      sendPpv20: reply.includes('[SEND_PPV_20]'),
      sendPpv40: reply.includes('[SEND_PPV_40]'),
      sendPpv60: reply.includes('[SEND_PPV_60]'),
      sendPpv80: reply.includes('[SEND_PPV_80]'),
      followUp: reply.includes('[FOLLOW_UP]'),
    }

    reply = reply
      .replace(/\[SEND_VOICE_MEMO\]/gi, '')
      .replace(/\[SEND_TEASER\]/gi, '')
      .replace(/\[SEND_PPV_20\]/gi, '')
      .replace(/\[SEND_PPV_40\]/gi, '')
      .replace(/\[SEND_PPV_60\]/gi, '')
      .replace(/\[SEND_PPV_80\]/gi, '')
      .replace(/\[FOLLOW_UP\]/gi, '')
      .trim()

    return NextResponse.json({ reply, signals })
  } catch (error) {
    console.error('Teacher creator API error:', error)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable.' },
      { status: 500 }
    )
  }
}
