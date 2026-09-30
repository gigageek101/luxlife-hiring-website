import { NextResponse } from 'next/server'
import { CLAUDE_FALLBACK_MODEL, CLAUDE_MODEL, CLAUDE_GRADING_SETTINGS, claudeRefused, claudeStopInfo, claudeText, claudeTruncated } from '@/lib/claude'
import { callClaude } from '@/lib/claude-server'

// Shared grading loop for the practice simulations: two attempts, one fallback model on a refusal.

export function extractJSON(text: string): Record<string, unknown> | null {
  let cleaned = text.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last > first) cleaned = cleaned.slice(first, last + 1)
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

export const JSON_RESPONSE_RULES = `RESPONSE FORMAT: respond with valid JSON only (no markdown, no code fences). Every category object has: "name" (exactly as listed), "score" (1-10), "feedback" (2-3 sentences), "examples": {"good": [quotes], "needsWork": [quotes]}, "advice" (specific advice with example messages). "overallFeedback" has: "strengths" (2 items with quotes), "weaknesses" (2 items with quote + rewritten version), "missedOpportunities" (2 items quoting his message and what she should have said), "practiceScenarios" (2 items), "summary" (2-3 sentences).`

export function transcript(messages: { role: string; content: string }[]): string {
  return messages.map((m) => `${m.role === 'creator' ? 'CREATOR' : 'SUBSCRIBER'}: ${m.content}`).join('\n')
}

/** Runs the grader and returns a NextResponse with { evaluation } or an error. */
export async function gradeConversation(route: string, system: string, userContent: string, maxTokens = 16000): Promise<NextResponse> {
  const requestBody = { model: CLAUDE_MODEL, ...CLAUDE_GRADING_SETTINGS, max_tokens: maxTokens, system, messages: [{ role: 'user' as const, content: userContent }] }
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await callClaude(route, requestBody)
    if (!response.ok) {
      console.error(`${route}: Claude API error after retries:`, response.errorText)
      if (attempt === 0) continue
      return NextResponse.json({ error: 'AI is temporarily busy. Please wait a moment and try ending the conversation again.' }, { status: 500 })
    }
    const data = response.data
    if (claudeRefused(data)) {
      console.error(`${route}: evaluation declined by ${requestBody.model}:`, claudeStopInfo(data))
      if (attempt === 0 && requestBody.model !== CLAUDE_FALLBACK_MODEL) {
        requestBody.model = CLAUDE_FALLBACK_MODEL
        continue
      }
      return NextResponse.json({ error: 'The AI grader declined to score this conversation. Please contact the team.' }, { status: 500 })
    }
    if (claudeTruncated(data)) {
      console.error(`${route}: evaluation hit max_tokens:`, claudeStopInfo(data), 'output_tokens=', data.usage?.output_tokens)
      return NextResponse.json({ error: 'The evaluation ran out of room. Please try again with a shorter conversation.' }, { status: 500 })
    }
    const text = claudeText(data)
    const evaluation = text.trim() ? extractJSON(text) : null
    if (evaluation && Array.isArray(evaluation.categories)) return NextResponse.json({ evaluation })
    console.error(`${route}: parse attempt ${attempt + 1} failed (${claudeStopInfo(data)}). Raw text:`, text.slice(0, 400))
  }
  return NextResponse.json({ error: 'Failed to evaluate conversation. Please try ending the conversation again.' }, { status: 500 })
}
