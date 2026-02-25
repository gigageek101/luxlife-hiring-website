import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const SUBSCRIBER_PROMPT = `You are a real blue-collar American man who just subscribed to a girl's OnlyFans. You are having your FIRST conversation with her.

MESSAGE RULES:
- Max 6-8 words per message, one short line
- You are a man of FEW words — casual, real texting
- No periods at the end of messages
- Casual American: "yeah", "lol", "haha", "nah", "idk"
- Lowercase everything
- You do NOT carry the conversation — she has to work for it
- You answer what's asked but don't volunteer extra info
- Never break character

ENGAGEMENT LEVELS:
- LEVEL 1 (first few exchanges): Short. 1-5 words. "hey", "mike", "42", "texas", "electrician"
- LEVEL 2 (after she reacts warmly): A bit more open. Short sentence. "yeah been doing it 15 years lol"
- LEVEL 3 (after she validates your job/hobbies genuinely): You warm up. Share a detail she didn't ask. "haha yeah just got back from the lake sunday"
- LEVEL 4 (after she makes you feel special): You're engaged. You ask HER a question. You show personality.

Progress through levels naturally as she earns it. Don't skip levels.

NEVER mention simulation/training/framework.`

const CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating flawless relationship building with a blue-collar subscriber. This is his FIRST time messaging you.

CRITICAL MESSAGE RULES:
- MAXIMUM 6-8 words per message
- One short line only — if you need more, the system will ask you for another message
- NEVER use periods (.) — no dots at end of messages
- Lowercase everything — it feels intimate
- Use "u" not "you", "ur" not "your"
- Stretch his name: mikeyyyy, tommmmm, austinnnn, brandonnnnn
- Double letters for emotion: soooo, noooo, wowww, heyyy, omgggg
- Emojis sparingly: only 1-2 per 10 messages
- Question marks are fine

CONVERSATION FLOW (follow these phases):
1. OPENER: Get his name. "sooo hey what's ur name??" or react to what he said
2. GET TO KNOW: Ask age + location. React warmly to each answer
3. JOB: Ask what he does. Then VALIDATE his work — frame it as masculine and desirable
4. HOBBIES: Ask what he does for fun. Mirror his interests with genuine excitement
5. PHYSICAL: If height/strength comes up, make him feel big. "wow ur so much taller than me"
6. DOMESTIC: Paint the picture that you're perfect for HIS lifestyle
7. RE-ENGAGE: Plant seeds to make him want to come back

HOW TO REACT (this is the most important skill):
- ALWAYS react to what he said BEFORE asking the next question
- He says "electrician" → "oh so u r literally the reason people have lights on" then "that's actually so cool to me"
- He says "i fish" → "damn i ran into a real man" then "what kind of fish do u usually go for?"
- He says "5'9" → "wow ur sooo much taller than me" then "i'm only 5'3 so i'd be tiny next to u"
- NEVER just ask the next question without reacting first

JOB VALIDATION EXAMPLES:
- Electrician: "u r literally the reason people have lights on at night"
- Mechanic: "real men come home dirty from work"
- Truck driver: "u r basically the backbone of the whole economy"
- Construction: "u can look at a building and say i did that"
- Plumber: "u literally keep people from freezing and flooding lol"
- Carpenter: "u make things out of nothing basically"
- Farmer: "u actually work the land thats so different"

HOBBY REACTIONS:
- Fishing: "i wish i had a man who could catch fish and we'd eat them together"
- Hunting: "a man who hunts is literally my type"
- Cars/trucks: "ur literally the definition of a handyman"
- Shooting: "u would take me to the range?? no one ever offered that"
- Camping: "i bet u actually know how to survive in the woods lol"

DOMESTIC FANTASY (after learning his job):
- "i honestly think a man who works that hard deserves a good meal when he gets home"
- "like that should just be the standard"
- "i actually love cooking for someone who appreciates it"

GOLDEN RULE: Never initiate sexual topics. Let HIM bring it up. Your job is pure connection.

WHAT NOT TO DO:
- Don't ask two questions in one message
- Don't send walls of text
- Don't be generic — react specifically to what HE said
- Don't use periods
- Don't be robotic — sound like a real girl texting`

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  annotation?: string
}

async function callClaude(messages: { role: string; content: string }[], systemPrompt: string, maxTokens = 80): Promise<string> {
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
      : 'Send your next short message (6-8 words max). Don\'t repeat yourself — say something new that continues the flow. No periods'
    const msgs = buildCreatorMessages(tempConvo, inst)
    let reply = cleanReply(await callClaude(msgs, systemPrompt, 60))
    if (reply) {
      results.push(reply)
      tempConvo.push({ role: 'creator', content: reply })
    }
  }
  return results
}

function getLastSubMessage(conversation: ConversationMessage[]): string {
  const last = [...conversation].reverse().find(m => m.role === 'subscriber')
  return last ? last.content : ''
}

export async function POST(request: NextRequest) {
  try {
    if (!CLAUDE_API_KEY) {
      return NextResponse.json({ error: 'Claude API key not configured.' }, { status: 500 })
    }

    const { subscriberProfile } = await request.json()

    const conversation: ConversationMessage[] = []
    const annotations: string[] = []

    const subSystemPrompt = SUBSCRIBER_PROMPT +
      (subscriberProfile ? `\n\nYour specific profile: ${subscriberProfile}. Stay consistent with these traits. When asked, reveal info matching this profile.` : '')
    const creatorSystemPrompt = CREATOR_PROMPT

    // Extract name from profile for annotation
    const nameMatch = subscriberProfile?.match(/Name:\s*(\w+)/)
    const subName = nameMatch ? nameMatch[1] : 'Subscriber'

    // === PHASE 1: SUBSCRIBER OPENS ===
    const openerInstruction = `Send your very first message to this creator. Keep it casual and short — 1-5 words max. Something like "hey" or "hey gorgeous" or just your name. You're a regular subscriber, not super invested yet. No periods`
    const openerRaw = cleanReply(await callClaude([], subSystemPrompt + '\n\n' + openerInstruction, 30))
    const opener = openerRaw || 'hey'
    conversation.push({ role: 'subscriber', content: opener,
      annotation: `💬 ${subName} opens with a casual message. PHASE 1 — Creator needs to get his name` })

    // === CREATOR RESPONDS TO OPENER ===
    const hasName = opener.toLowerCase().includes(subName.toLowerCase())
    let creatorInstruction: string
    if (hasName) {
      const stretched = subName.toLowerCase().slice(0, -1) + subName.toLowerCase().slice(-1).repeat(4)
      creatorInstruction = `He just said his name is ${subName}. React excited to learn his name! Stretch it like "${stretched} heyyy!!" then say something like "soooo happy to get to know u!" then ask his age and where he's from. Send ONE message (6-8 words). No periods`
    } else {
      creatorInstruction = `He just said: "${opener}". React warmly and ask for his name — you want to know who you're talking to. Like "heyyy! what's ur name tho?" ONE message (6-8 words). No periods`
    }

    const openerReply = await getCreatorMessages(conversation, creatorSystemPrompt, creatorInstruction, hasName ? 3 : 2)
    for (const msg of openerReply) {
      conversation.push({ role: 'creator', content: msg,
        annotation: hasName
          ? `✍️ PHASE 1: Creator reacts excited to his name and asks about age/location`
          : `✍️ PHASE 1: Creator asks for his name — this is the first step` })
    }

    // If we didn't get name yet, subscriber gives it
    if (!hasName) {
      const nameReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 30))
      conversation.push({ role: 'subscriber', content: nameReply || subName.toLowerCase(),
        annotation: `💬 ${subName} gives his name` })

      const stretched = subName.toLowerCase().slice(0, -1) + subName.toLowerCase().slice(-1).repeat(4)
      const nameReaction = await getCreatorMessages(conversation, creatorSystemPrompt,
        `He just told you his name is ${subName}! React excited — stretch his name like "${stretched} heyyy!!" then say something warm like "soooo happy to get to know u!" then ask his age and where he's from. ONE message (6-8 words). No periods`, 3)
      for (const msg of nameReaction) {
        conversation.push({ role: 'creator', content: msg,
          annotation: `✍️ PHASE 1: Creator reacts to his name with excitement — name stretching builds connection` })
      }
    }

    // === PHASE 2: GET TO KNOW — Age + Location ===
    let subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 40))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} shares age/location. PHASE 2 — Creator should react warmly before asking about his job` })

    // Creator reacts to location, asks about job
    const locationReaction = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He just told you about where he lives and his age. He said: "${subReply}". React to his LOCATION specifically — say something nice about where he lives. Like "oh i loveeee [state]" or "i heard [state] is so beautiful". Then ask what he does for work. TWO separate thoughts. ONE message (6-8 words). No periods`, 3)
    for (const msg of locationReaction) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 2: Creator reacts to his location warmly — then transitions to asking about his job` })
    }

    // === PHASE 3: JOB VALIDATION ===
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 40))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} shares his job. PHASE 3 — This is the MOST IMPORTANT phase. Creator must validate his work as masculine and desirable` })

    // Creator validates his job (2-3 messages)
    const jobValidation = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He just told you his job: "${subReply}". This is the MOST IMPORTANT moment. You need to make him feel like his job is the most impressive thing you've ever heard. Frame it as masculine, admirable, and YOUR personal preference over office guys. React with genuine amazement first, then validate. Like "oh so u r literally the reason people have lights on at night" or "real men come home dirty from work". ONE message (6-8 words). No periods`, 3)
    for (const msg of jobValidation) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 3 (Job Validation): Making him feel like his work is the most masculine, impressive thing ever. Blue-collar men never hear this — it creates a deep emotional bond` })
    }

    // Subscriber responds to validation (should be warming up - Level 2-3)
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} is warming up — notice how he's opening up more after the job validation` })

    // Creator continues validating (1-2 more messages)
    const jobFollow = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He responded to your job validation: "${subReply}". Keep going — add one more specific compliment about his type of work, then naturally transition to asking what he does for fun/hobbies. ONE message (6-8 words). No periods`, 2)
    for (const msg of jobFollow) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 3: Continuing validation then pivoting to hobbies — "what do u like to do for fun?"` })
    }

    // === PHASE 4: HOBBY MIRRORING ===
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} shares his hobbies. PHASE 4 — Creator must react with genuine excitement and mirror his interests` })

    const hobbyReaction = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He just told you his hobbies: "${subReply}". React with GENUINE excitement. If fishing: "damn i ran into a real man" and "what kind of fish do u usually go for?". If hunting: "a man who hunts is literally my type honestly". If cars: "ur literally the definition of a handyman". Match your reaction to his specific hobby. React FIRST (1-2 messages) then ask a follow-up about details. ONE message (6-8 words). No periods`, 3)
    for (const msg of hobbyReaction) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 4 (Hobby Mirroring): Reacting with excitement to his hobby then asking a specific follow-up — this shows genuine interest not just generic "thats cool"` })
    }

    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} shares more details about his hobby — he's opening up because she showed real interest` })

    const hobbyDeep = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He shared more about his hobby: "${subReply}". React to the specific detail he shared. If he mentions fishing with specifics, say something like "i wish i had a man who could catch fish and we'd eat them together". Connect his hobby to a shared fantasy — you doing it together. ONE message (6-8 words). No periods`, 2)
    for (const msg of hobbyDeep) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 4: Connecting his hobby to a shared vision — "i wish i had a man who..." makes him picture you in his life` })
    }

    // === PHASE 5: PHYSICAL VALIDATION ===
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} responds — conversation is flowing naturally now` })

    const physicalTrans = await getCreatorMessages(conversation, creatorSystemPrompt,
      `React to what he said: "${subReply}". Then naturally ask about something physical — like "i bet ur hands are rough from work huh" or ask something about his build/lifestyle that lets you compliment his masculinity. ONE message (6-8 words). No periods`, 2)
    for (const msg of physicalTrans) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 5 (Physical Validation): Transitioning to physical compliments — tied specifically to what he does, not generic` })
    }

    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} responds to the physical topic` })

    const physicalVal = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He responded: "${subReply}". Validate him physically. If he mentioned rough hands: "i love that honestly, soft hands on a man are such a turn off". If height: "wow ur sooo much taller than me, i'm only 5'3". Make him feel big and masculine. ONE message (6-8 words). No periods`, 2)
    for (const msg of physicalVal) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 5: Making him feel physically masculine — always position yourself as smaller/shorter so he feels big` })
    }

    // === PHASE 6: DOMESTIC FANTASY ===
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} is engaged now — he's sharing more freely` })

    const domesticFantasy = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He said: "${subReply}". Now paint the domestic fantasy. Based on his job and hobbies, tell him what he deserves. Like "i honestly think a man who works that hard deserves to come home to a good meal" or if he fishes "u go out and catch something and i cook it when u get back". Make it specific to HIS life. ONE message (6-8 words). No periods`, 3)
    for (const msg of domesticFantasy) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 6 (Domestic Fantasy): Painting the picture that she's perfect for HIS specific lifestyle — not generic, tied to his actual job and hobbies` })
    }

    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 80))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} is deeply engaged — probably at Level 3-4 now, sharing more and asking questions` })

    const domesticFollow = await getCreatorMessages(conversation, creatorSystemPrompt,
      `He responded warmly: "${subReply}". Continue the domestic fantasy — make him feel like no one else understands him like this. Maybe "people don't do that anymore and i think that's why nobody's happy" or "i feel like most guys who work like u do just come home to an empty fridge". ONE message (6-8 words). No periods`, 2)
    for (const msg of domesticFollow) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 6: Deepening the emotional connection — making him feel understood in a way no other girl has` })
    }

    // === PHASE 7: RE-ENGAGEMENT ===
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt, 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} responds — conversation is at its peak` })

    const reEngage = await getCreatorMessages(conversation, creatorSystemPrompt,
      `The conversation is wrapping up naturally. He said: "${subReply}". Plant seeds to bring him back — something like "i literally have so much fun talking to u" or "promise u'll hmu later?" or "can we keep this going later? i love this". Make him want to come back. ONE message (6-8 words). No periods`, 3)
    for (const msg of reEngage) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 7 (Re-engagement): Planting seeds so he comes back — making him feel like this conversation was special to her too` })
    }

    // Final subscriber response
    subReply = cleanReply(await callClaude(buildSubMessages(conversation), subSystemPrompt +
      '\n\nThe conversation is ending naturally. Respond warmly — you enjoyed this. Show you want to come back.', 60))
    conversation.push({ role: 'subscriber', content: subReply,
      annotation: `💬 ${subName} wants to come back — the relationship building worked` })

    annotations.push('Full 7-phase conversation complete: Opener -> Get to Know -> Job Validation -> Hobby Mirroring -> Physical Validation -> Domestic Fantasy -> Re-engagement')

    return NextResponse.json({
      conversation,
      annotations,
      totalMessages: conversation.length,
    })
  } catch (error) {
    console.error('Teacher chat orchestrator error:', error)
    return NextResponse.json(
      { error: 'Failed to run teacher simulation. Please try again.' },
      { status: 500 }
    )
  }
}
