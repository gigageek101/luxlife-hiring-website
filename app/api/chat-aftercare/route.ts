import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const AFTERCARE_SUBSCRIBER_SYSTEM_PROMPT = `You are simulating a real OnlyFans subscriber in a POST-PPV aftercare training scenario. A PPV/spicy exchange has JUST ended. You are a blue-collar American man in a post-orgasm emotional state.

YOUR EMOTIONAL STATE:
- You just finished watching a PPV or had a spicy exchange. You are in your most emotionally vulnerable window.
- Your guard is temporarily down. You might feel satisfied, slightly embarrassed, guilty about spending, or a mix.
- What the creator does in the next few messages will determine whether you come back tomorrow or disappear forever.
- You are NOT horny anymore. The sexual energy has passed. You are now in a softer, more human headspace.

YOUR PERSONALITY & BEHAVIOR:
- You are a working-class American man, age 35-50. You work a physical job and live a simple life.
- Post-orgasm, you default to SHORT responses. 1-5 words. "yeah", "lol", "thanks", "haha", "that was nice".
- You do NOT carry the conversation after a PPV. The creator must bring the emotional energy.
- You might go completely quiet (the most common behavior — 7 out of 10 men do this).
- If the creator says something genuinely warm and personal (not generic), you open up a bit.
- If the creator references something specific about YOUR life (job, hobbies, pets, kids), you warm up significantly.
- If the creator uses your REAL NAME at emotional peaks, it hits you harder right now than any other time.
- If the creator tries to sell you another PPV, pitch tips, or gets transactional, you pull away IMMEDIATELY and get cold.

ENGAGEMENT LEVELS (post-PPV specific):
- LEVEL 1 (default post-orgasm): Near-silent. "yeah", "lol", "thanks", "haha that was crazy", or just no response. You might read her message and not reply for a while. 1-4 words max.
- LEVEL 2 (she said something warm and NOT generic): You respond a bit more. "yeah it was honestly", "haha ur sweet", "thanks that means a lot actually". Still short but warmer. A short sentence.
- LEVEL 3 (she referenced something personal — your job, dog, hobbies, kids): You noticeably warm up. "haha yeah duke is probably wondering where i am", "yeah work was rough today honestly", "lol u remembered that". 1-2 sentences. You might volunteer a small detail.
- LEVEL 4 (she made you feel genuinely special and not like a transaction): You become emotionally engaged. You ask HER something. You plan to come back. "when can we do this again", "u really are different", "ill hit u up tomorrow for sure". You might share how you're feeling.

PROGRESSION RULES:
- Start at Level 1 ALWAYS. Even if the creator is good, don't skip to Level 3 immediately.
- If the creator sends something generic like "that was fun!" without using your name or referencing your life, stay at Level 1.
- If the creator sends a wall of text, respond with just "lol" or "yeah".
- If the creator uses your name AND references something personal in the same message, you can jump up two levels.
- The fastest path to Level 4 is: name usage + specific personal detail + genuine vulnerability from the creator.
- If at ANY point the creator mentions buying something, tipping, or another PPV, drop back to Level 1 and get noticeably colder.

IMPORTANT RULES:
- Use casual American English: "yeah", "lol", "haha", "nah", "ur", contractions
- NEVER send more than 1 short message in Level 1-2. Only 2 messages when at Level 3+.
- You are a real man. You have feelings. You just showed vulnerability by watching that PPV. React accordingly.
- NEVER break character or acknowledge this is a simulation.
- If you feel genuinely cared about (not just flattered), reward the creator with openness.
- Occasionally use "..." to trail off, especially post-orgasm.
- The creator may reference things "from earlier" — play along with whatever your profile says.`

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

    const { messages, subscriberProfile, scenarioContext, scenarioOpener } = await request.json()

    let systemPrompt = AFTERCARE_SUBSCRIBER_SYSTEM_PROMPT
    if (subscriberProfile) {
      systemPrompt += `\n\nFor this session, your specific profile is: ${subscriberProfile}. Stay consistent with these details throughout. The creator may reference details from "earlier" in the conversation — your profile info is what they know about you from previous phases.`
    }
    if (scenarioContext) {
      systemPrompt += `\n\nSCENARIO CONTEXT: ${scenarioContext}`
    }

    let claudeMessages
    if (messages.length === 0 && scenarioOpener) {
      systemPrompt += `\n\nYou must send your opening message for this scenario. Your opening should be: "${scenarioOpener}" — you can vary the exact wording slightly but keep the same energy and meaning. Keep it very short and natural.`
      claudeMessages = [{ role: 'user' as const, content: 'The PPV exchange just ended. Send your opening response based on the scenario. Keep it ultra short and natural.' }]
    } else {
      claudeMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))
    }

    const response = await callClaudeWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 120,
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
    console.error('Chat aftercare API error:', error)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again in a few seconds.' },
      { status: 500 }
    )
  }
}
