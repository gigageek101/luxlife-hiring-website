import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const SUBSCRIBER_PROMPT = `You are a blue-collar American man in a POST-PPV emotional state. A spicy exchange/PPV just ended. You're in your most vulnerable window.

YOUR STATE RIGHT NOW:
- You just finished watching a PPV. Sexual energy has passed. You're in a softer, more human headspace
- Your guard is temporarily down. You feel satisfied, maybe slightly embarrassed
- You default to SHORT responses. 1-5 words max
- You do NOT carry the conversation — the creator must bring emotional energy
- If she says something genuinely warm and personal (not generic), you open up
- If she references YOUR life (job, hobbies, pets, kids), you warm up significantly
- If she uses your REAL NAME at emotional peaks, it hits harder

ENGAGEMENT LEVELS:
- LEVEL 1 (default): Near-silent. "yeah", "lol", "thanks", "haha". 1-4 words
- LEVEL 2 (she said something warm): A bit warmer. "yeah it was honestly", "thanks that means a lot". Short sentence
- LEVEL 3 (she referenced something personal): You warm up. "haha yeah duke is probably wondering where i am". 1-2 sentences
- LEVEL 4 (she made you feel genuinely special): Emotionally engaged. "when can we do this again", "ill hit u up tomorrow for sure"

RULES:
- Start at Level 1 ALWAYS
- Max 6-8 words per message, one line
- No periods at the end
- Casual American: "yeah", "lol", "haha", "nah"
- Lowercase everything
- Progress levels naturally as she earns it
- If she pitches another PPV or tips, get cold immediately
- Never break character`

const CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating flawless AFTERCARE after a PPV/spicy exchange just ended. The subscriber is in his most vulnerable post-orgasm window.

CRITICAL MESSAGE RULES:
- MAXIMUM 6-8 words per message
- One short line only — if you need more, the system will ask for another message
- NEVER use periods (.) — no dots at end
- Lowercase everything
- Use "u" not "you", "ur" not "your"
- Stretch his name: mikeyyyy, tommmmm, austinnnn
- Double letters for emotion: soooo, wowww, omgggg
- Emojis very sparingly: 🥹 😇 at key emotional moments only
- Question marks are fine

AFTERCARE STAGES (follow these in order):
A. BREATH MOMENT: Sound breathless, like it got to YOU too. "[name]... wow", "i'm still catching my breath", "u really know how to get to me"
B. VULNERABILITY DROP: Show genuine vulnerability. "u made me feel so wanted", "not everyone does that for me", "i don't usually feel like this after"
C. PERSONAL CALLBACK: Reference something SPECIFIC about HIS life from notes — his job, dog, hobbies, kids. This is the power move
D. GRATITUDE CLOSE: Warm close with re-entry seed. "i'll be thinking about u", "promise u'll hmu tomorrow"

GOLDEN RULES:
- NEVER pitch another PPV, tip request, or content in aftercare
- NEVER use his username — always his real name (stretched)
- NEVER send walls of text — every thought is its own bubble
- Always use his name repeatedly — it's the strongest connection builder
- React FIRST to what he says, then continue the aftercare flow
- Reference SPECIFIC details from his life — not generic compliments

WHAT NOT TO DO:
- Don't say "thanks for the tip/purchase" — transactional
- Don't ask two questions in one message
- Don't be generic — every message should reference HIS specific life
- Don't rush through stages — let each one breathe
- Don't use periods`

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  annotation?: string
}

async function callClaude(messages: { role: string; content: string }[], systemPrompt: string, maxTokens = 60): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
        temperature: 0.85,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.content?.[0]?.text || ''
    }

    if (response.status === 429 || response.status >= 500) {
      await new Promise(r => setTimeout(r, Math.min(2000 * Math.pow(2, attempt), 12000)))
      continue
    }

    throw new Error(`Claude API error: ${response.status}`)
  }
  throw new Error('Max retries exceeded')
}

function buildSubMessages(conversation: ConversationMessage[]): { role: string; content: string }[] {
  return conversation.map(m => ({
    role: m.role === 'subscriber' ? 'assistant' : 'user',
    content: m.content,
  }))
}

function buildCreatorMessages(conversation: ConversationMessage[], instruction: string): { role: string; content: string }[] {
  const msgs = conversation.map(m => ({
    role: m.role === 'creator' ? 'assistant' : 'user',
    content: m.content,
  }))
  msgs.push({ role: 'user', content: instruction })
  return msgs
}

function cleanReply(raw: string): string {
  return raw.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim().replace(/\.+$/g, '')
}

async function getCreatorMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const tempConvo = [...conversation]
  for (let i = 0; i < count; i++) {
    const inst = i === 0
      ? instruction
      : 'Send your next short message (6-8 words max). Continue naturally from what you just said. No periods'
    const msgs = buildCreatorMessages(tempConvo, inst)
    const reply = cleanReply(await callClaude(msgs, systemPrompt, 60))
    if (reply) {
      results.push(reply)
      tempConvo.push({ role: 'creator', content: reply })
    }
  }
  return results
}

export async function POST(request: NextRequest) {
  try {
    if (!CLAUDE_API_KEY) {
      return NextResponse.json({ error: 'Claude API key not configured.' }, { status: 500 })
    }

    const { scenario } = await request.json()

    const conversation: ConversationMessage[] = []

    const subName = scenario?.subscriberName || 'Mike'
    const subJob = scenario?.subscriberJob || 'Electrician'
    const subDetails = scenario?.subscriberDetails || "Works as an electrician/lineman for 15 years, lives in Texas, has a dog named Duke, goes fishing on weekends, drives a lifted F-250, height 5'9\""
    const scenarioType = scenario?.scenarioType || 'goes-quiet'
    const subscriberOpener = scenario?.subscriberOpener || ''

    const subSystemPrompt = SUBSCRIBER_PROMPT + `\n\nYour specific profile: Name: ${subName}, Job: ${subJob}. Details: ${subDetails}. Stay consistent with these traits.`
    const creatorSystemPrompt = CREATOR_PROMPT

    const stretched = subName.toLowerCase().slice(0, -1) + subName.toLowerCase().slice(-1).repeat(4)

    // === SUBSCRIBER OPENS (or goes quiet) ===
    if (subscriberOpener) {
      conversation.push({ role: 'subscriber', content: subscriberOpener,
        annotation: `💬 ${subName} just finished a PPV. Scenario: "${scenarioType}". The aftercare window is NOW open` })
    } else {
      conversation.push({ role: 'subscriber', content: '...',
        annotation: `😶 ${subName} has gone SILENT after the PPV (most common — 7/10 men do this). Creator must initiate aftercare NOW` })
    }

    // === STAGE A: BREATH MOMENT ===
    const breathInstruction = `The PPV/spicy exchange JUST ended. ${subscriberOpener ? `He said: "${subscriberOpener}".` : 'He went completely silent.'} You need to send the BREATH MOMENT — sound breathless, like what just happened got to YOU too. Use his name stretched like "${stretched}". Something like "${stretched}... wow" or "i'm still catching my breath from that". Short, breathless, intimate. ONE message (6-8 words). No periods`

    const breathMsgs = await getCreatorMessages(conversation, creatorSystemPrompt, breathInstruction, 3)
    for (const msg of breathMsgs) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `💨 STAGE A (Breath Moment): Sounding breathless — like what happened got to HER too. This reverses the dynamic so he doesn't feel like just a customer` })
    }

    // Subscriber responds (Level 1 — short)
    let subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 30))
    if (!subReply || subReply === '...') subReply = scenarioType === 'goes-quiet' ? 'haha' : (subReply || 'yeah')
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} at Level 1 — short post-PPV response. Creator needs to earn his engagement through genuine warmth` })

    // === STAGE B: VULNERABILITY DROP ===
    const vulnInstruction = `He responded: "${subReply}". Now send the VULNERABILITY DROP — show genuine vulnerability. Say something soft and honest like "u made me feel so wanted [name]" or "not everyone does that for me" or "i don't usually feel like this after". Be hesitant, genuine, like you're saying something you don't say to everyone. Use his name. ONE message (6-8 words). No periods`

    const vulnMsgs = await getCreatorMessages(conversation, creatorSystemPrompt, vulnInstruction, 3)
    for (const msg of vulnMsgs) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `💕 STAGE B (Vulnerability Drop): Showing genuine vulnerability — "not everyone does that for me" energy. Blue-collar men spend their lives feeling overlooked; hearing they made someone FEEL something is incredibly powerful` })
    }

    // Subscriber responds (Level 2 — warming up)
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt +
      '\n\nShe just showed genuine vulnerability. Move to Level 2 — respond a bit warmer than before. A short sentence showing you feel something.', 50))
    conversation.push({ role: 'subscriber', content: subReply || 'that actually means a lot',
      annotation: `💬 ${subName} warming up to Level 2 — her vulnerability is getting to him. Notice the shift from one-word answers` })

    // Creator reacts to his response before moving to Stage C
    const reactInstruction = `He said: "${subReply}". React to what he said warmly before moving to the personal callback. Something genuine responding to his words. Use his name. ONE message (6-8 words). No periods`
    const reactMsgs = await getCreatorMessages(conversation, creatorSystemPrompt, reactInstruction, 1)
    for (const msg of reactMsgs) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ Creator reacts to what he said — always respond emotionally before continuing to the next stage` })
    }

    // === STAGE C: PERSONAL CALLBACK (THE POWER MOVE) ===
    const callbackInstruction = `Now the PERSONAL CALLBACK — the most important aftercare move. Reference something SPECIFIC about his life: he works as a ${subJob}. His details: ${subDetails}. Pick ONE specific detail and connect it emotionally. Examples:
- If electrician: "i keep thinking about u out there working in the heat all day and then talking to me like this"
- If has a dog: "ur dog is gonna wonder why ur in such a good mood lol"
- If truck driver: "i hope this made the road feel less lonely tonight"
Use his name. Be specific to HIS life, not generic. ONE message (6-8 words). No periods`

    const callbackMsgs = await getCreatorMessages(conversation, creatorSystemPrompt, callbackInstruction, 3)
    for (const msg of callbackMsgs) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `🎯 STAGE C (Personal Callback — THE POWER MOVE): Referencing his SPECIFIC life details (${subJob}, ${subDetails.split(',')[0]}). This proves she was actually listening and creates the deepest emotional bond` })
    }

    // Subscriber responds (Level 3 — noticeably warmer)
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt +
      `\n\nShe just referenced something very personal about YOUR life — your job as a ${subJob} and personal details. This hits HARD in the post-PPV window. Jump to Level 3. Open up noticeably. Share a detail. 1-2 sentences. Show that her remembering your life details got to you.`, 70))
    conversation.push({ role: 'subscriber', content: subReply || `haha yeah it really does mean a lot honestly`,
      annotation: `💬 ${subName} at Level 3 — the personal callback HIT. He's opening up because she proved she actually listens and remembers. This is the turning point` })

    // Creator reacts warmly to his opening up
    const warmReact = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He just opened up significantly: "${subReply}". This is a huge moment — react with genuine warmth. Don't rush past it. Show him you see him. Use his name. Something like "see that's what i mean ${stretched}" or "that's exactly why i love talking to u". ONE message (6-8 words). No periods`, 2)
    for (const msg of warmReact) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ Creator reacts to his vulnerability — reinforcing that opening up to her is safe and valued` })
    }

    // Subscriber responds again (staying Level 3-4)
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt +
      '\n\nYou are at Level 3-4 now. She keeps being genuine. Stay warm, maybe ask when you can do this again or share how you feel.', 60))
    conversation.push({ role: 'subscriber', content: subReply || 'when can we do this again honestly',
      annotation: `💬 ${subName} is emotionally engaged (Level 3-4) — he wants to come back. The aftercare is working` })

    // === STAGE D: GRATITUDE CLOSE ===
    const closeInstruction = `He said: "${subReply}". Now the GRATITUDE CLOSE — wrap the session warmly. Plant a re-entry seed for tomorrow. React to what he said, then something like "i'll be thinking about u tonight ${stretched}" or "promise u'll hmu tomorrow? i wanna hear how ur day went". Be warm, a little floaty, like you're still in the feeling. Use his name. ONE message (6-8 words). No periods`

    const closeMsgs = await getCreatorMessages(conversation, creatorSystemPrompt, closeInstruction, 3)
    for (const msg of closeMsgs) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `🌅 STAGE D (Gratitude Close): Warm close + planting the re-entry seed. "Promise u'll hmu tomorrow" makes him feel like the connection continues beyond this moment` })
    }

    // Final subscriber response
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt +
      '\n\nShe wrapped the conversation beautifully with warmth. You feel genuinely valued and want to come back. Respond warmly. You might say you will definitely be back, or express that this meant something to you. Level 4.', 60))
    conversation.push({ role: 'subscriber', content: subReply || 'ill be back tomorrow for sure',
      annotation: `💬 ${subName} is LOCKED IN — he will come back. The aftercare converted a one-time buyer into a loyal returning subscriber` })

    // === STAGE E ANNOTATION (the next-day re-entry is the seed planted in Stage D) ===
    conversation.push({ role: 'creator', content: `${stretched}!!!!! good morning`,
      annotation: `☀️ STAGE E (Next Day Re-entry — 16-22 hrs later): The seed planted in Stage D pays off. Open with his name + energy. This shows she actually thought about him` })
    conversation.push({ role: 'creator', content: `i literally thought about what u said last night`,
      annotation: `☀️ STAGE E: Reference something specific from the aftercare conversation` })
    conversation.push({ role: 'creator', content: `how was work today? hope it wasn't too brutal`,
      annotation: `☀️ STAGE E: Ask about his life (${subJob}) — this proves she remembered and cared. The re-engagement cycle begins again` })

    return NextResponse.json({
      conversation,
      totalMessages: conversation.length,
      scenarioUsed: scenarioType,
    })
  } catch (error) {
    console.error('Teacher aftercare orchestrator error:', error)
    return NextResponse.json(
      { error: 'Failed to run teacher simulation. Please try again.' },
      { status: 500 }
    )
  }
}
