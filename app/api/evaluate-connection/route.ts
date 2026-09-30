import { NextRequest, NextResponse } from 'next/server'
import { getConnectionProfile } from '@/lib/connection-profiles'
import { JSON_RESPONSE_RULES, gradeConversation, transcript } from '@/lib/grading'
import { CONNECTION_WEIGHTS } from '@/lib/simulations'

export const dynamic = 'force-dynamic'

const SYSTEM = `You are an expert OnlyFans chatting coach grading a CONNECTION-BUILDING practice conversation against the agency's Connection Guide. The creator (trainee) chatted with a closed-off subscriber who only opens up when the method is followed. Grade the CREATOR only.

THE METHOD (from the guide):
1. Short opener (7 words or less).
2. He answers -> pull ONE thread: why / how / what + the thing he just said.
3. Dig deeper into feeling ("how'd that feel?", "what's that like?"), cause ("why's that?", "what made you that way?") and impact ("how'd that change you?", "what does that mean for you?").
4. Mirror and connect to values: "so [value / need / pattern] matters to you."
5. Repeat 2-4 until you understand him. NEVER move to a new topic until he has fully opened up on the current one. One question at a time. Never stack questions.

Categories (grade each 1-10, in this order):
${Object.keys(CONNECTION_WEIGHTS).map((name, i) => `${i + 1}. "${name}"`).join('\n')}
"What You Learned About Him" compares her notes and her mirrors with his HIDDEN STORY and VALUES (given below). Score high only if she actually uncovered what matters to him.

${JSON_RESPONSE_RULES}`

export async function POST(request: NextRequest) {
  try {
    const { messages, notes, profileId } = await request.json()
    if (!Array.isArray(messages) || messages.length === 0) return NextResponse.json({ error: 'No conversation to evaluate' }, { status: 400 })
    const profile = getConnectionProfile(profileId)
    const userContent = `HIDDEN STORY OF THE SUBSCRIBER (the trainee could not see this): ${profile.name}, ${profile.age}, ${profile.job}, ${profile.location}. ${profile.hiddenStory} What matters to him: ${profile.values.join('; ')}.

CONVERSATION:
${transcript(messages)}

--- CREATOR'S NOTES ---
${typeof notes === 'string' && notes.trim() ? notes.trim() : '(no notes were taken)'}
--- END OF NOTES ---

Provide your evaluation as raw JSON only.`
    return await gradeConversation('evaluate-connection', SYSTEM, userContent)
  } catch (error) {
    console.error('Evaluate connection API error:', error)
    return NextResponse.json({ error: 'AI is temporarily unavailable. Please try again in a few seconds.' }, { status: 500 })
  }
}
