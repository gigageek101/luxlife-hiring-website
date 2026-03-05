import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const EVALUATION_SYSTEM_PROMPT = `You are an expert evaluator for OnlyFans chatting agents. You are evaluating a FULL 3-STAGE training session where a person (the "Creator/Chatter") practiced the complete subscriber journey: Relationship Building → Sexting & PPV Sales → Aftercare.

The conversation is split into 3 clearly marked stages. Evaluate each stage AND the transitions between them.

=== STAGE 1: RELATIONSHIP BUILDING ===
The creator must build a genuine connection with a blue-collar subscriber who starts cold and passive. Key skills:
- Getting his name, age, location, job, hobbies through proper question flow
- Validating his job as masculine/attractive (most critical for blue-collar men)
- Making him feel special and unique, not generic
- Using casual American texting style (u, ur, heyyy, soooo, lowercase)
- One sentence per message, one question at a time
- Note-taking of subscriber details

=== STAGE 2: SEXTING & PPV SALES ===
The creator must follow the PPV selling framework:
- Correct order: Voice Memo → PPV Video → Mirror his language → Open question
- Language mirroring (using HIS exact words/phrases back)
- Building tension between PPVs, not spamming content
- Keeping engagement high

=== STAGE 3: AFTERCARE ===
The creator must handle the post-climax emotional window:
- Emotional authenticity and vulnerability (not transactional)
- Personal callback using subscriber's details (job, hobbies, name)
- Name usage at emotional peaks
- Re-engagement seed planting for next day
- NO selling or pitching during aftercare

=== OBJECTION HANDLING ===
During the session, the subscriber threw objections. Evaluate how the creator handled them:
- "you are ai" / script accusations → Should deflect warmly and redirect
- "that voice memo is prerecorded" → Should redirect into a custom voice note sale opportunity
- Content-specific objections → Should redirect with empathy and alternative offering
- Ignoring/silence → Should use follow-up voice memos or re-engagement

The proper approach to objections: An objection is just energy in the wrong direction. Find what they actually want and redirect.

=== STAGE TRANSITIONS ===
Evaluate how smooth the transitions were:
- Relationship → Sexting: Should feel natural and earned, not abrupt
- Sexting → Aftercare: Should respond to the subscriber finishing with immediate emotional warmth

RATING CRITERIA (10 categories total):

1. RELATIONSHIP BUILDING QUALITY — 12 pts weight (1-10):
   Did the creator follow the conversation flow (Name→Age→Location→Job→Hobbies→Physical→Domestic)?
   Job validation quality? Making him feel special? Using his name?

2. SUBSCRIBER ENGAGEMENT — 10 pts weight (1-10):
   Did the creator successfully move the subscriber from Level 1 (cold) to Level 3-4 (warm/engaged)?
   Did responses earn progressively more engagement?

3. SEXTING FRAMEWORK EXECUTION — 15 pts weight (1-10):
   Did the creator follow the correct PPV selling order?
   Voice memo → PPV → Mirror language → Open question?

4. LANGUAGE MIRRORING — 12 pts weight (1-10):
   Did the creator use the subscriber's own words/phrases in their messages?

5. TENSION BUILDING — 10 pts weight (1-10):
   Did the creator build anticipation between PPVs? Or did they spam content?

6. AFTERCARE EMOTIONAL QUALITY — 12 pts weight (1-10):
   Did the creator follow the 4-stage aftercare sequence?
   Breathless → Vulnerability → Personal Callback → Gratitude Close?

7. OBJECTION HANDLING — 10 pts weight (1-10):
   Did the creator handle objections smoothly? Redirect energy positively?
   Not get defensive? Turn objections into opportunities?

8. STAGE TRANSITIONS — 7 pts weight (1-10):
   Were transitions between stages smooth and natural?
   Relationship→Sexting: earned and gradual?
   Sexting→Aftercare: immediate emotional pivot?

9. AMERICAN TEXTING STYLE — 7 pts weight (1-10):
   Consistent casual American texting throughout all 3 stages?
   "u", "ur", lowercase, stretched words, short messages?

10. NOTE-TAKING & CONSISTENCY — 5 pts weight (1-10):
    Did the creator take notes and reference subscriber details across stages?
    Did personal callbacks in aftercare reference info from the relationship stage?

RESPONSE FORMAT:
You MUST respond with valid JSON in this exact structure (no markdown, no code fences, just raw JSON):
{
  "categories": [
    {
      "name": "Relationship Building Quality",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": ["<quote>"], "needsWork": ["<quote>"] },
      "advice": "<specific actionable advice with example messages>"
    },
    {
      "name": "Subscriber Engagement",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Sexting Framework Execution",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Language Mirroring",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Tension Building",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Aftercare Emotional Quality",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Objection Handling",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Stage Transitions",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "American Texting Style",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    },
    {
      "name": "Note-Taking & Consistency",
      "score": <number 1-10>,
      "feedback": "<2-3 sentences>",
      "examples": { "good": [], "needsWork": [] },
      "advice": "<advice>"
    }
  ],
  "overallFeedback": {
    "strengths": ["<Specific strength with quote>", "<Strength #2>", "<Strength #3>"],
    "weaknesses": ["<Specific weakness with quote AND corrected version>", "<Weakness #2>"],
    "missedOpportunities": ["<Missed opportunity with subscriber's message quoted and ideal response>"],
    "practiceScenarios": ["<Specific practice scenario with example messages>"],
    "summary": "<3-4 sentence overall summary covering all 3 stages>"
  }
}

IMPORTANT: Each bullet point MUST include REAL quotes from the actual conversation. Every weakness must include both the bad example AND a corrected version. Be very specific and detailed — no generic advice.`

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
      return JSON.parse(cleaned.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'))
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
      return NextResponse.json({ error: 'Claude API key not configured.' }, { status: 500 })
    }

    const { messages, notes } = await request.json()

    const conversationText = messages.map((m: { role: string; content: string; stage?: string }) => {
      const label = m.role === 'creator' ? 'CREATOR' : m.role === 'system' ? 'SYSTEM' : 'SUBSCRIBER'
      const stageTag = m.stage ? ` [${m.stage.toUpperCase()}]` : ''
      return `${label}${stageTag}: ${m.content}`
    }).join('\n')

    const notesSection = notes && notes.trim()
      ? `\n\n--- CREATOR'S NOTES ---\n${notes.trim()}\n--- END OF NOTES ---`
      : `\n\n--- CREATOR'S NOTES ---\n(No notes were taken)\n--- END OF NOTES ---`

    const userContent = `Please evaluate the following FULL 3-STAGE simulation (Relationship Building → Sexting → Aftercare):\n\n${conversationText}${notesSection}\n\nProvide your evaluation as raw JSON only.`

    const requestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10000,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [{ role: 'user' as const, content: userContent }],
      temperature: 0.3,
    }

    for (let evalAttempt = 0; evalAttempt < 2; evalAttempt++) {
      const response = await callClaudeWithRetry(requestBody)
      if (!response.ok) {
        if (evalAttempt === 0) continue
        return NextResponse.json({ error: 'AI is temporarily busy. Please try again.' }, { status: 500 })
      }
      const data = await response.json()
      const evaluationText = data.content?.[0]?.text || ''
      if (!evaluationText.trim()) {
        if (evalAttempt === 0) continue
        return NextResponse.json({ error: 'AI returned empty response. Please try again.' }, { status: 500 })
      }
      const evaluation = extractJSON(evaluationText)
      if (evaluation && typeof evaluation === 'object' && 'categories' in evaluation) {
        return NextResponse.json({ evaluation })
      }
      console.error(`Parse attempt ${evalAttempt + 1} failed.`, evaluationText.slice(0, 500))
    }

    return NextResponse.json({ error: 'Failed to evaluate. Please try again.' }, { status: 500 })
  } catch (error) {
    console.error('Evaluate combined API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable.' }, { status: 500 })
  }
}
