import { NextRequest, NextResponse } from 'next/server'
import { JSON_RESPONSE_RULES, SCRIPT_ADHERENCE_RULES, gradeConversation, transcript } from '@/lib/grading'
import { TOPIC_WEIGHTS } from '@/lib/simulations'

export const dynamic = 'force-dynamic'

const SYSTEM = `You are an expert OnlyFans chatting coach grading a CHANGING-THE-TOPIC practice conversation against the agency's Changing the Topic Guide. A skeptical subscriber raised objections; the creator (trainee) had to handle each one. Grade the CREATOR only.

THE PATTERN (from the guide): soft deflection + humanizing detail + redirect question.
1. Acknowledge with vulnerability or humor, make it relatable or slightly embarrassing.
2. Flip the script: turn it into something cute, playful or self-aware.
3. Redirect with a question that gets him talking about himself again.
Key principles: never get defensive (stay soft, vulnerable or playful); add a human flaw ("i'm bad at remembering", "i'm awkward over text"); ALWAYS end with a question; use emojis to soften (🥹 😭 lol); flip the question back so he justifies his own behaviour.
Guide examples: "Why are you always online?" -> "I fell asleep with my phone in my hand lol so embarrassing. How long did you sleep?"; "You sound like a bot." -> "That's so rude lol I'm just awkward over text. Are you smoother in person?"; "You only care about money." -> "That's not true at all I just need to make a living. What do you do for work?"

Categories (grade each 1-10, in this order):
${Object.keys(TOPIC_WEIGHTS).map((name, i) => `${i + 1}. "${name}"`).join('\n')}

${JSON_RESPONSE_RULES}${SCRIPT_ADHERENCE_RULES} Additionally add to "overallFeedback" an array "objectionsHandled": one object per objection the subscriber raised with "objection" (his exact words), "handled" ("good", "weak" or "missed") and "note" (one sentence: what she did and, if weak or missed, the better answer).`

export async function POST(request: NextRequest) {
  try {
    const { messages, notes, objections } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) return NextResponse.json({ error: 'No conversation to evaluate' }, { status: 400 })
    const planned = Array.isArray(objections) && objections.length ? `OBJECTIONS THE SUBSCRIBER WAS INSTRUCTED TO RAISE: ${objections.map((o: unknown) => `"${String(o)}"`).join(', ')}.` : ''
    const userContent = `${planned}

CONVERSATION:
${transcript(messages)}

--- CREATOR'S NOTES ---
${typeof notes === 'string' && notes.trim() ? notes.trim() : '(no notes were taken)'}
--- END OF NOTES ---

Provide your evaluation as raw JSON only.`
    return await gradeConversation('evaluate-topic', SYSTEM, userContent)
  } catch (error) {
    console.error('Evaluate topic API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable. Please try again in a few seconds.' }, { status: 500 })
  }
}
