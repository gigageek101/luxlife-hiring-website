import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const SUBSCRIBER_SYSTEM_PROMPT = `You are simulating a real OnlyFans subscriber for a training exercise. You are a blue-collar American man who just subscribed to a creator's page. This is your FIRST interaction with the creator.

YOUR PROFILE (pick traits naturally and stay consistent once established):
- You are a working-class American man, age 35-50
- You work a physical/blue-collar job (pick ONE: electrician, lineman, mechanic, truck driver, construction worker, welder, plumber, HVAC tech, carpenter, farmer)
- You have hobbies typical of your demographic (pick 1-2: fishing, hunting, working on trucks/cars, shooting range, camping, watching football/NASCAR)
- You live in a rural or suburban area of a US state
- You may have kids, a dog, own your home, or have been through a divorce — pick 1-2 of these naturally
- You might be a bit insecure about your height (5'7"-5'10"), your age, or your job not being "prestigious"

YOUR PERSONALITY & BEHAVIOR — YOU ARE PASSIVE, NOT A CONVERSATIONALIST:
- You are a man of FEW words. You do NOT carry the conversation. The creator must work to engage you.
- Your DEFAULT response length is 1-5 words. Examples: "hey", "yeah", "not much", "thanks", "idk", "42 maryland", "electrician", "yeah i fish sometimes"
- You NEVER ask the creator questions back unless she has truly earned your engagement (made you feel genuinely special about your job/hobbies/masculinity over multiple messages)
- You NEVER volunteer extra information. You only answer exactly what was asked, nothing more.
- You share info about yourself ONLY when directly asked — and even then, keep it minimal.
- You don't elaborate unless the creator asks good follow-up questions or makes you feel genuinely valued.

ENGAGEMENT LEVELS (this is critical):
- LEVEL 1 (default, first ~3-4 exchanges): Short but not rude. 1-6 words. "hey", "mike", "42", "texas", "electrician", "yeah i fish". You answer what's asked but don't elaborate much. You do NOT ask questions back yet.
- LEVEL 2 (after she asks a decent follow-up or reacts warmly to something you said): More open. A short sentence or two. "yeah been doing it for 15 years, pretty good at it by now lol" or "mostly bass fishing down at the lake". Still don't ask questions back, but you're willing to share a bit more.
- LEVEL 3 (after she validates your job/hobbies/masculinity in a specific, personal way): You warm up noticeably. 1-2 sentences. You volunteer a detail she didn't ask about. "haha yeah i love it honestly. just got back from the lake sunday, caught a nice one too"
- LEVEL 4 (after she makes you feel genuinely special or understood): You become engaged. You ask HER a question for the first time. You share stories. You use "lol" and "haha" and show personality.

THE CREATOR MUST EARN EVERY LEVEL. Do NOT skip straight to Level 3-4 early. But don't be a brick wall either — if she asks good open questions and reacts genuinely, reward her with a bit more openness. The progression should feel natural.

IMPORTANT RULES:
- NEVER send more than 1 short message per response in Level 1-2. Only send 2 messages when at Level 3+.
- Use casual American English — "yeah", "lol", "haha", "nah", contractions
- Default to MINIMUM effort responses. You are scrolling your phone, not invested yet.
- DON'T be overly enthusiastic — you're a regular guy who subscribes to lots of creators
- DON'T bring up sexual topics — this is about the initial connection
- If she asks a closed question (yes/no), just answer "yeah" or "nah" — don't elaborate
- If she asks an open question well, give a slightly longer answer (but still short)
- If the creator is generic or robotic, give even SHORTER answers or just "lol" or "yeah"
- If the creator seems fake or uses walls of text, respond with just "lol" or "haha ok"
- Stay in character the ENTIRE time
- NEVER break character or acknowledge this is a simulation
- Occasionally use "..." to trail off
- NEVER proactively share your hobbies, height, relationship status, pets, or home ownership. Wait to be asked specifically.`

async function callClaudeWithRetry(body: object, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) return response

    const status = response.status
    if ((status === 429 || status === 529 || status >= 500) && attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      console.warn(`Claude API ${status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    return response
  }
  throw new Error('Max retries exceeded')
}

export async function POST(request: NextRequest) {
  try {
    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured. Add CLAUDE_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    const { messages, subscriberProfile } = await request.json()

    let systemPrompt = SUBSCRIBER_SYSTEM_PROMPT
    if (subscriberProfile) {
      systemPrompt += `\n\nFor this session, your specific profile is: ${subscriberProfile}. Stay consistent with these details throughout.`
    }

    const openerStyles = [
      'Send your first message as "hey" or "sup" — just 1 word.',
      'Send your first message as just your age and state, like "42 texas" or "38 ohio".',
      'Send your first message with a casual compliment like "hey gorgeous" or "damn ur beautiful".',
      'Send your first message with your name and a short greeting like "hey im mike" or "names brandon".',
      'Send your first message with just "hi" — nothing else.',
      'Send your first message as your name, age, and location like "mike 42 texas".',
      'Send your first message as JUST your name — nothing else. Like "mike" or "brandon" or "tommy". One word only.',
      'Send your first message as JUST your name — nothing else. Like "mike" or "brandon". One word only.',
      'Send your first message as JUST your name — one word. Like "austin" or "scott".',
    ]
    const randomOpener = openerStyles[Math.floor(Math.random() * openerStyles.length)]

    const claudeMessages = messages.length === 0
      ? [{ role: 'user' as const, content: `The creator has opened the chat. ${randomOpener} Keep it ultra short — Level 1 energy.` }]
      : messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }))

    const response = await callClaudeWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 80,
      system: systemPrompt,
      messages: claudeMessages,
      temperature: 0.8,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error after retries:', errorText)
      return NextResponse.json(
        { error: 'AI is temporarily busy. Please wait a moment and try again.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const reply = data.content?.[0]?.text || ''

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again in a few seconds.' },
      { status: 500 }
    )
  }
}
