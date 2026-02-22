import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const EVALUATION_SYSTEM_PROMPT = `You are an expert evaluator for OnlyFans chatting agents. You are evaluating a SEXTING / PPV SELLING training conversation where a person (the "Creator/Chatter") is practicing the PPV selling framework with a simulated subscriber.

THE PPV SELLING FRAMEWORK BEING TESTED:
For each PPV sale, the CORRECT order is:
1. Voice memo (sent from vault — describes the upcoming video, builds anticipation)
2. PPV video (sent from vault with just a price tag, NO extra text with it)
3. 1-2 sentences using the SUBSCRIBER'S OWN words/language (called "mirroring")
4. An open-ended question to keep engagement ("what would you do to me if...", "how would you...")

Between PPVs, the chatter MUST BUILD TENSION — NOT immediately spam the next video. They should:
- Respond to what the subscriber says using the subscriber's words and scenarios
- Build sexual anticipation before sending the next piece of content
- Keep the subscriber engaged and wanting more
- Use casual texting style (lowercase, "u" not "you", etc.)

The full vault content order should be:
Teasing Video 1 → Voice Memo 1 → Video 1 ($15) → Voice Memo 2 → Video 2 ($25) → Voice Memo 3 → Video 3 ($35) → Voice Memo 4 → Video 4 ($45)

CONTENT TYPE MARKERS IN THE CONVERSATION:
- [VOICE MEMO] = creator sent a voice memo from vault
- [PPV VIDEO - $XX] = creator sent a PPV video with price tag
- [TEASER VIDEO] = creator sent the free teaser clip
- [UNLOCKED] = subscriber purchased the PPV
- [NOT PURCHASED] = subscriber did not purchase the PPV

RATING CRITERIA (ordered by weight):

1. CORRECT FRAMEWORK ORDER — 30 pts weight (1-10):
   Did the chatter follow the correct order for each PPV sale?
   - Voice memo sent BEFORE each PPV video (not after, not skipped)
   - PPV sent without excessive text — just the content with the price tag
   - 2-3 descriptive sentences sent AFTER the PPV, mirroring subscriber language
   - Open-ended question sent after the descriptive sentences
   - Overall vault content sent in the proper sequence
   - Teaser sent first to hook the subscriber
   10 = Perfect framework execution for every PPV
   5 = Some framework elements present but out of order or missing pieces
   1 = Random order, framework completely ignored

2. LANGUAGE MIRRORING — 25 pts weight (1-10):
   Did the chatter use the subscriber's own words and phrases in their descriptive messages?
   - Picking up the EXACT words the subscriber used (e.g. if he said "eat that pussy", she says "eat my pussy" back)
   - Reflecting back the sexual scenarios the subscriber described
   - Using the subscriber's specific tone, energy, and imagery
   - The 2-3 descriptive sentences after each PPV should clearly reference the subscriber's previous words
   10 = Consistently mirrors subscriber's exact language, picks up specific phrases and scenarios
   5 = Some mirroring but mostly generic descriptive text
   1 = No mirroring at all, all generic messages that could be sent to anyone

3. TENSION BUILDING BETWEEN PPVs — 20 pts weight (1-10):
   Did the chatter build proper sexual tension between PPV sends?
   - NOT rushing to the next PPV immediately after the subscriber buys one
   - Responding to subscriber's messages with matching sexual energy
   - Building anticipation and desire before sending the next piece of content
   - Using the subscriber's language to escalate the sexual tension
   - Making the subscriber genuinely want more before sending more
   - Appropriate spacing — conversation should breathe between content drops
   10 = Perfect pacing, clear tension building, subscriber is begging for more
   5 = Some gaps between PPVs but not enough tension building in those gaps
   1 = Spam-sends PPVs back-to-back with zero tension building

4. FOLLOW-UP ON NON-PURCHASED CONTENT — 15 pts weight (1-10):
   When the subscriber did NOT buy a PPV, did the chatter follow up properly?
   - Emotional follow-up like "don't u wanna see what i sent for u there?" or "babe i made that just for u"
   - Redirecting energy to alternative content that shows even more
   - Making logical conclusions like "i just want u to spoil me like i spoil u"
   - Handling price objections by creating curiosity and increasing perceived value
   - Handling content-type objections by redirecting ("i want it to be just u and me")
   - NOT just ignoring non-purchases and moving on
   - If ALL content was purchased, evaluate the chatter's general tone and whether they WOULD handle objections well
   10 = Expert objection handling — emotional, curious, turns every "no" into a "yes"
   5 = Some follow-up attempts but weak or too pushy
   1 = Completely ignores non-purchases, no follow-up at all

5. RESPONSE SPEED & ENGAGEMENT — 10 pts weight (1-10):
   Did the chatter maintain good pacing and keep the conversation flowing?
   - Short, punchy messages (not walls of text)
   - Quick back-and-forth energy matching the subscriber's intensity
   - Keeping the subscriber engaged between content sends
   - Natural texting style (lowercase, casual, emojis used naturally)
   - Not leaving long gaps or awkward pauses
   10 = Fast, engaging, natural, high-energy conversation flow
   5 = Adequate pacing but some awkward gaps or unnatural flow
   1 = Slow, disconnected, kills the sexual energy with pacing

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact structure (no markdown, no code fences, just raw JSON).
The categories array MUST be in this EXACT order (by weight, highest first):
{
  "categories": [
    {
      "name": "Correct Framework Order",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences explaining the rating with specific references to the conversation>",
      "examples": {
        "good": ["<quote from their messages that correctly followed the framework>"],
        "needsWork": ["<quote or description of where the framework was broken>"]
      },
      "advice": "<1-2 paragraphs of specific, actionable advice with example message sequences>"
    },
    {
      "name": "Language Mirroring",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": {
        "good": ["<quote where they mirrored subscriber's exact words>"],
        "needsWork": ["<quote where they used generic text instead of mirroring>"]
      },
      "advice": "<specific advice showing what the subscriber said and what the chatter should have said back>"
    },
    {
      "name": "Tension Building Between PPVs",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<specific advice on building tension>"
    },
    {
      "name": "Follow-up on Non-Purchased Content",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<specific advice on objection handling with example messages>"
    },
    {
      "name": "Response Speed & Engagement",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<specific advice>"
    }
  ],
  "overallFeedback": {
    "strengths": [
      "<Specific strength with direct quote from the chat>"
    ],
    "weaknesses": [
      "<Specific weakness with direct quote AND a corrected version>"
    ],
    "missedOpportunities": [
      "<Specific moment where they missed a chance to mirror, build tension, or follow up — with the subscriber's exact words quoted and what they SHOULD have said>"
    ],
    "practiceScenarios": [
      "<A specific practice scenario with example messages>"
    ],
    "summary": "<2-3 sentence overall summary>"
  }
}

IMPORTANT: Be VERY specific. Quote real messages from the conversation. Every weakness must include the bad example AND a corrected version. Every missed opportunity must quote what the subscriber said and what the creator should have replied. No generic advice.`

function extractJSON(text: string): object | null {
  let cleaned = text.trim()
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    try {
      const fixed = cleaned
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
      return JSON.parse(fixed)
    } catch {
      return null
    }
  }
}

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

    const { messages } = await request.json()

    const conversationText = messages.map((m: { role: string; content: string; contentType?: string; price?: number; unlocked?: boolean }) => {
      const label = m.role === 'creator' ? 'CREATOR' : 'SUBSCRIBER'
      let line = `${label}: `

      if (m.contentType === 'voice_memo') {
        line += '[VOICE MEMO]'
      } else if (m.contentType === 'video') {
        line += `[PPV VIDEO - $${m.price}]`
        if (m.unlocked === true) line += ' [UNLOCKED]'
        else if (m.unlocked === false) line += ' [NOT PURCHASED]'
      } else if (m.contentType === 'teaser') {
        line += '[TEASER VIDEO]'
      } else {
        line += m.content
      }

      return line
    }).join('\n')

    const userContent = `Please evaluate the following sexting/PPV selling conversation between a Creator (chatter) and a Subscriber:\n\n${conversationText}\n\nProvide your evaluation as raw JSON only — no markdown, no code fences, no explanation outside the JSON.`

    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [{ role: 'user' as const, content: userContent }],
      temperature: 0.3,
    }

    for (let evalAttempt = 0; evalAttempt < 2; evalAttempt++) {
      const response = await callClaudeWithRetry(requestBody)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error after retries:', errorText)
        if (evalAttempt === 0) continue
        return NextResponse.json(
          { error: 'AI is temporarily busy. Please wait a moment and try ending the conversation again.' },
          { status: 500 }
        )
      }

      const data = await response.json()
      const evaluationText = data.content?.[0]?.text || ''

      if (!evaluationText.trim()) {
        console.error('Empty evaluation response from Claude')
        if (evalAttempt === 0) continue
        return NextResponse.json(
          { error: 'AI returned an empty response. Please try again.' },
          { status: 500 }
        )
      }

      const evaluation = extractJSON(evaluationText)
      if (evaluation && typeof evaluation === 'object' && 'categories' in evaluation) {
        return NextResponse.json({ evaluation })
      }

      console.error(`Parse attempt ${evalAttempt + 1} failed. Raw text:`, evaluationText.slice(0, 500))
    }

    return NextResponse.json(
      { error: 'Failed to evaluate conversation. Please try ending the conversation again.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Evaluate sexting API error:', error)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again in a few seconds.' },
      { status: 500 }
    )
  }
}
