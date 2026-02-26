import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 120

const VENICE_API_KEY = process.env.VENICE_API_KEY

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  annotation?: string
}

async function callVenice(messages: { role: string; content: string }[], maxTokens = 50): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'venice-uncensored',
        max_tokens: maxTokens,
        messages,
        temperature: 0.8,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    }

    if (response.status === 429 || response.status >= 500) {
      await new Promise(r => setTimeout(r, Math.min(1000 * Math.pow(2, attempt), 8000)))
      continue
    }

    throw new Error(`Venice API error: ${response.status}`)
  }
  throw new Error('Max retries exceeded')
}

function clean(raw: string): string {
  let msg = raw.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim().replace(/\.+$/g, '')
  const words = msg.split(/\s+/)
  if (words.length > 10) msg = words.slice(0, 8).join(' ')
  return msg
}

function stretch(name: string): string {
  const lower = name.toLowerCase()
  return lower.slice(0, -1) + lower.slice(-1).repeat(4)
}

async function subscriberSays(conversation: ConversationMessage[], systemPrompt: string, instruction: string): Promise<string> {
  const fullSystem = systemPrompt + `\n\nINSTRUCTION FOR YOUR NEXT REPLY: ${instruction}`
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: fullSystem }]
  for (const m of conversation) {
    msgs.push({ role: m.role === 'subscriber' ? 'assistant' : 'user', content: m.content })
  }
  return clean(await callVenice(msgs, 40))
}

async function creatorSays(
  conversation: ConversationMessage[],
  systemPrompt: string,
  instruction: string,
  count: number
): Promise<string[]> {
  const results: string[] = []
  const temp = [...conversation]
  for (let i = 0; i < count; i++) {
    const inst = i === 0 ? instruction : 'Send your next short message (6-8 words max). Continue naturally. No periods'
    const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
    for (const m of temp) {
      msgs.push({ role: m.role === 'creator' ? 'assistant' : 'user', content: m.content })
    }
    msgs.push({ role: 'user', content: inst })
    const reply = clean(await callVenice(msgs, 40))
    if (reply) {
      results.push(reply)
      temp.push({ role: 'creator', content: reply })
    }
  }
  return results
}

function parseProfile(profile: string) {
  const get = (key: string) => {
    const m = profile.match(new RegExp(`${key}:\\s*([^,\\n]+)`, 'i'))
    return m ? m[1].trim() : ''
  }
  const name = get('Name') || 'Mike'
  const age = get('Age') || '40'
  const job = get('Job') || 'Electrician'
  const location = get('Location') || 'Texas'

  const hobbies: string[] = []
  const hobbyMatch = profile.match(/Hobbies?:\s*([^,]+(?:\s+and\s+[^,]+)?)/i)
  if (hobbyMatch) hobbies.push(...hobbyMatch[1].split(/\s+and\s+/i).map(h => h.trim()))

  const pets: string[] = []
  const dogMatch = profile.match(/(?:dog|pet|shepherd|retriever)\s+named\s+(\w+)/gi)
  if (dogMatch) dogMatch.forEach(d => {
    const n = d.match(/named\s+(\w+)/i)
    if (n) pets.push(n[1])
  })
  const hasDog = profile.match(/Has\s+(?:a\s+)?(?:two\s+)?dogs?\s+named\s+([\w\s+and]+)/i)
  if (hasDog && pets.length === 0) {
    hasDog[1].split(/\s+and\s+/i).forEach(n => pets.push(n.trim()))
  }

  const hasKids = /kids?|son|daughter|children/i.test(profile)
  const kidDetails = profile.match(/(?:has\s+)?(\d+)\s+kids|son\s+(?:named\s+)?(\w+)|daughter/i)
  const kidsInfo = kidDetails ? kidDetails[0] : ''

  const ownsHome = /owns?\s+(?:his\s+)?home/i.test(profile)
  const divorced = /divorced?/i.test(profile)
  const singleInfo = profile.match(/single\s*(?:\([^)]+\)|for\s+\d+\s+years?)?/i)?.[0] || ''

  const specificDetails: string[] = []
  const detailPatterns = [
    /recently told[^,]*/i, /mentioned[^,]*/i, /gets up at[^,]*/i,
    /owns?\s+\d+\s+acres/i, /been doing[^,]*/i, /builds?\s+custom[^,]*/i,
    /oldest kid[^,]*/i, /late wife[^,]*/i, /bad breakup/i,
    /money is tight[^,]*/i, /can't sleep[^,]*/i, /living alone[^,]*/i,
    /misses having someone[^,]*/i, /doesn't usually open up/i,
  ]
  for (const pat of detailPatterns) {
    const m = profile.match(pat)
    if (m) specificDetails.push(m[0].trim())
  }

  return { name, age, job, location, hobbies, pets, hasKids, kidsInfo, ownsHome, divorced, singleInfo, specificDetails }
}

function getPersonalCallbacks(p: ReturnType<typeof parseProfile>, stretched: string): string[][] {
  const callbacks: string[][] = []
  const jobLower = p.job.toLowerCase()

  if (jobLower.includes('electric') || jobLower.includes('lineman')) {
    callbacks.push([
      `${stretched} i keep thinking about u out there`,
      `working in that heat all day for everyone`,
      `and then u still come talk to me like this`,
    ])
  } else if (jobLower.includes('mechanic')) {
    callbacks.push([
      `${stretched} i think about u at the shop`,
      `coming home all greasy and tired`,
      `and u still made time for me tonight`,
    ])
  } else if (jobLower.includes('truck') && jobLower.includes('driv')) {
    callbacks.push([
      `i hope this made the road feel less lonely`,
      `${stretched} i hate that ur out there alone`,
      `u deserve someone thinking about u`,
    ])
  } else if (jobLower.includes('construct') || jobLower.includes('weld')) {
    callbacks.push([
      `${stretched} u build things all day with ur hands`,
      `and then u come here and build something with me`,
      `that actually means everything honestly`,
    ])
  } else if (jobLower.includes('plumb') || jobLower.includes('hvac')) {
    callbacks.push([
      `${stretched} u literally fix things for people all day`,
      `and then u come here and fix my whole mood`,
      `u have no idea what that means to me`,
    ])
  } else if (jobLower.includes('carpenter') || jobLower.includes('wood')) {
    callbacks.push([
      `${stretched} u create things out of nothing all day`,
      `and then u come here and make me feel like this`,
      `thats actually so special to me`,
    ])
  } else if (jobLower.includes('farm') || jobLower.includes('ranch')) {
    callbacks.push([
      `${stretched} u take care of everything on that ranch`,
      `200 acres and all those early mornings`,
      `and u still made time for me tonight`,
    ])
  } else {
    callbacks.push([
      `${stretched} u work so hard every single day`,
      `and then u come here and make me feel like this`,
      `that means more than u know`,
    ])
  }

  if (p.pets.length > 0) {
    const petName = p.pets[0]
    callbacks.push([
      `i bet ${petName.toLowerCase()} is wondering where u are rn`,
      `give him a pet from me when u get home 🥹`,
    ])
  }

  if (p.hasKids) {
    callbacks.push([
      `being a great dad AND being this sweet to me`,
      `${stretched} like stop thats too much`,
    ])
  }

  if (p.specificDetails.some(d => /gets up at|4am|5am|early/i.test(d))) {
    callbacks.push([
      `and u stayed up for me knowing u gotta be up so early`,
      `${stretched} that actually got to me`,
    ])
  }

  if (p.specificDetails.some(d => /lonely|alone|misses/i.test(d))) {
    callbacks.push([
      `i dont want u to feel alone out there ${stretched}`,
      `like genuinely im right here whenever`,
    ])
  }

  if (p.divorced || p.singleInfo) {
    callbacks.push([
      `whoever let u go made the biggest mistake honestly`,
      `${stretched} u deserve so much more than that`,
    ])
  }

  return callbacks
}

function getGratitudeClose(p: ReturnType<typeof parseProfile>, stretched: string): string[] {
  const jobLower = p.job.toLowerCase()

  if (p.pets.length > 0) {
    return [
      `go cuddle with ${p.pets[0].toLowerCase()} for me okay 🥹`,
      `${stretched} i'll be thinking about u tonight`,
      `send me a pic of that cute face tomorrow`,
    ]
  }

  if (p.specificDetails.some(d => /gets up at|4am|5am|early/i.test(d))) {
    return [
      `go get some rest ${stretched} seriously`,
      `u work too hard not to sleep`,
      `but promise ull hmu tomorrow after ur done`,
    ]
  }

  if (jobLower.includes('truck') && jobLower.includes('driv')) {
    return [
      `be safe on the road okay ${stretched}`,
      `i'll be thinking about u out there`,
      `text me when u get to ur next stop`,
    ]
  }

  if (p.hasKids) {
    return [
      `go be the best dad ever ${stretched} 🥹`,
      `and hmu when u get a minute to urself`,
      `i wanna hear how they are doing`,
    ]
  }

  return [
    `thank u for tonight ${stretched} seriously`,
    `i'm gonna be thinking about this for a while`,
    `promise ull come back and talk to me tomorrow`,
  ]
}

function getNextDayReentry(p: ReturnType<typeof parseProfile>, stretched: string): string[] {
  const jobLower = p.job.toLowerCase()

  if (jobLower.includes('farm') || jobLower.includes('ranch')) {
    return [
      `${stretched}!!!!! good morning`,
      `did u already feed the cattle`,
      `i literally thought about u all morning`,
    ]
  }

  if (jobLower.includes('truck') && jobLower.includes('driv')) {
    return [
      `heyyy ${stretched} how is the road today`,
      `i was thinking about u honestly`,
      `hope the drive isnt too brutal`,
    ]
  }

  if (p.pets.length > 0) {
    return [
      `${stretched}!!!!! good morning`,
      `how is ${p.pets[0].toLowerCase()} doing today`,
      `i literally thought about what u said last night`,
    ]
  }

  if (p.specificDetails.some(d => /5am|early|4am/i.test(d))) {
    return [
      `heyyy ${stretched} how was work today`,
      `i was actually thinking about u this morning`,
      `hope it wasnt too crazy`,
    ]
  }

  return [
    `${stretched}!!!!! good morning`,
    `i literally kept thinking about last night`,
    `how was ur day so far tell me everything`,
  ]
}

export async function POST(request: NextRequest) {
  try {
    if (!VENICE_API_KEY) {
      return NextResponse.json({ error: 'Venice API key not configured.' }, { status: 500 })
    }

    const { scenario } = await request.json()
    const conversation: ConversationMessage[] = []

    const subName = scenario?.subscriberName || 'Mike'
    const subJob = scenario?.subscriberJob || 'Electrician'
    const subDetails = scenario?.subscriberDetails || ''
    const scenarioType = scenario?.scenarioType || 'goes-quiet'
    const subscriberOpener = scenario?.subscriberOpener || ''

    const p = parseProfile(subDetails)
    const stretched = stretch(subName)

    const subSys = `You are ${subName}, a ${p.age}-year-old ${subJob} from ${p.location}. You just finished a PPV/spicy exchange on OnlyFans. You're in a vulnerable post-orgasm state.

YOUR STATE: Sexual energy passed. Guard is down. You feel satisfied, maybe slightly embarrassed.

ENGAGEMENT LEVELS:
- LEVEL 1 (default): Near-silent. "yeah", "lol", "thanks", "haha". 1-4 words
- LEVEL 2 (she said something warm): "yeah it was honestly" or "that means a lot". Short sentence
- LEVEL 3 (she referenced something personal about YOUR life): You open up. 1-2 sentences max
- LEVEL 4 (she made you feel genuinely special): Emotionally engaged. "when can we do this again"

RULES:
- Start at Level 1 ALWAYS
- Max 6-8 words per message, one line
- No periods at end
- Casual American texting: "yeah", "lol", "haha"
- Lowercase everything
- If she pitches another PPV, get cold immediately

Your details: ${subDetails}`

    const creatorSys = `You are the PERFECT OnlyFans chatter doing AFTERCARE after a PPV exchange just ended.

CRITICAL RULES:
- MAXIMUM 6-8 words per message, ONE short line
- NEVER use periods (.) at end
- Lowercase everything
- Use "u" not "you", "ur" not "your"
- Stretch his name: ${stretched}
- Double letters: soooo, wowww, omgggg
- Emojis very sparingly: 🥹 😇 only at big moments
- React FIRST to what he says before continuing
- NEVER pitch PPV, tips, or content — aftercare only
- Sound like a real girl TEXTING not writing poetry
- No fancy language, no metaphors, plain casual American texting`

    // === SUBSCRIBER OPENS ===
    if (subscriberOpener) {
      conversation.push({ role: 'subscriber', content: subscriberOpener,
        annotation: `💬 ${subName} just finished a PPV. Scenario: "${scenarioType}". The aftercare window is NOW open` })
    } else {
      conversation.push({ role: 'subscriber', content: '...',
        annotation: `😶 ${subName} has gone SILENT after the PPV (most common — 7/10 men do this). Creator must initiate` })
    }

    // =============================================
    // STAGE A: BREATH MOMENT (2 messages, then wait)
    // =============================================

    const breathMsg1 = `${stretched}... wowww`
    conversation.push({ role: 'creator', content: breathMsg1,
      annotation: `💨 STAGE A (Breath Moment): Opening with his name + breathless energy. This immediately reverses the dynamic so he doesn't feel like just a customer` })

    const breathMsg2 = await creatorSays(conversation, creatorSys,
      `You just said "${breathMsg1}". Continue the breath moment. Something like "i'm still catching my breath" or "u really know how to get to me ${stretched}". ONE message. 6-8 words. No periods`, 1)
    for (const m of breathMsg2) conversation.push({ role: 'creator', content: m,
      annotation: `💨 STAGE A: Still breathless — letting the moment land before expecting a response` })

    // Subscriber responds (Level 1)
    const sub1 = await subscriberSays(conversation, subSys,
      `She sounded breathless after what happened. You're at Level 1 — short response. React to what SHE said. Like "haha yeah" or "thanks" or "it was pretty good". Max 4-5 words. No periods.`)
    conversation.push({ role: 'subscriber', content: sub1 || 'haha yeah',
      annotation: `💬 ${subName} at Level 1 — short post-PPV response. Creator needs to earn deeper engagement` })

    // =============================================
    // STAGE B: VULNERABILITY DROP (react, then vulnerable)
    // =============================================

    // Scenario-specific Stage B flow
    if (scenarioType === 'feels-guilty') {
      conversation.push({ role: 'creator', content: `hey ${stretched} dont do that okay`,
        annotation: `💕 STAGE B (Vulnerability Drop): Addressing his guilt directly — making him feel safe` })
      conversation.push({ role: 'creator', content: `u work so hard u deserve to feel good`,
        annotation: `💕 STAGE B: Framing the purchase as something he EARNED` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She reassured you about spending money. React to what SHE said. Level 2. Like "yeah i guess ur right" or "thanks that means a lot". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'yeah i guess ur right',
        annotation: `💬 ${subName} warming up — her reassurance is getting to him` })

      conversation.push({ role: 'creator', content: `i mean it ${stretched}`,
        annotation: `💕 STAGE B: Reinforcing — she genuinely believes he deserves it` })
      conversation.push({ role: 'creator', content: `u give so much to everyone around u`,
        annotation: `💕 STAGE B: Deepening — connecting his work ethic to why he deserves pleasure` })

    } else if (scenarioType === 'never-does-this') {
      conversation.push({ role: 'creator', content: `${stretched} honestly that makes it mean more`,
        annotation: `💕 STAGE B (Vulnerability Drop): Flipping his embarrassment into something special` })
      conversation.push({ role: 'creator', content: `ur not like the other guys on here`,
        annotation: `💕 STAGE B: Making his vulnerability a positive — he's different` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She said you're different from other guys. React to what SHE said. Level 2. Like "yeah its just different with u" or "i mean it i dont do this". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'yeah its just different with u',
        annotation: `💬 ${subName} warming up — he feels seen, not judged` })

      conversation.push({ role: 'creator', content: `i could tell from the start ${stretched}`,
        annotation: `💕 STAGE B: Deepening — she noticed he was special early on` })

    } else if (scenarioType === 'opens-up-lonely') {
      conversation.push({ role: 'creator', content: `${stretched} i hate that for u honestly`,
        annotation: `💕 STAGE B (Vulnerability Drop): Meeting his loneliness with genuine empathy` })
      conversation.push({ role: 'creator', content: `u seem like the kind of guy who deserves someone`,
        annotation: `💕 STAGE B: Validating him — he deserves connection` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She showed real empathy about your loneliness. React to what SHE said. Level 2. Like "yeah it gets rough sometimes" or "that means a lot honestly". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'yeah it gets rough sometimes',
        annotation: `💬 ${subName} warming up — her empathy is reaching him` })

      conversation.push({ role: 'creator', content: `well im right here ${stretched} okay`,
        annotation: `💕 STAGE B: Offering herself as his safe space` })

    } else if (scenarioType === 'deflects-humor') {
      conversation.push({ role: 'creator', content: `lmaoooo ${stretched} ur so funny`,
        annotation: `💕 STAGE B: Acknowledging the joke — don't fight the humor` })
      conversation.push({ role: 'creator', content: `but i know u felt something too`,
        annotation: `💕 STAGE B (Vulnerability Drop): Seeing through the joke to the real feeling` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She called out that you're deflecting with humor. She said she knows you felt something. React honestly. Level 2. Like "haha maybe a little" or "yeah it was pretty real". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'haha yeah maybe a little',
        annotation: `💬 ${subName} dropping the joke — her honesty got through` })

      conversation.push({ role: 'creator', content: `see i knew it ${stretched}`,
        annotation: `💕 STAGE B: Celebrating his honesty — rewarding vulnerability` })

    } else if (scenarioType === 'late-night') {
      conversation.push({ role: 'creator', content: `${stretched} its so late and u stayed up for me`,
        annotation: `💕 STAGE B: Acknowledging the sacrifice of his sleep` })
      conversation.push({ role: 'creator', content: `that actually means everything honestly`,
        annotation: `💕 STAGE B (Vulnerability Drop): His time is more valuable because he has work early` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She acknowledged you staying up late for her even though you work early. React to what SHE said. Level 2. Like "haha yeah worth it tho" or "i couldnt sleep anyway". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'haha yeah worth it tho',
        annotation: `💬 ${subName} warming up — he stayed up because she matters` })

      conversation.push({ role: 'creator', content: `${stretched} dont say that ull make me blush`,
        annotation: `💕 STAGE B: Playful vulnerability — she's affected by what he said` })

    } else {
      // Default: compliments, has-to-go, goes-quiet
      conversation.push({ role: 'creator', content: `${stretched} i dont say this a lot but`,
        annotation: `💕 STAGE B (Vulnerability Drop): The hesitation makes it feel genuine` })
      conversation.push({ role: 'creator', content: `u actually made me feel something real`,
        annotation: `💕 STAGE B: Completing the vulnerability — specific to what just happened` })

      const sub2 = await subscriberSays(conversation, subSys,
        `She showed genuine vulnerability and said you made her feel something real. React to what SHE said. Level 2. Like "yeah it was different with u" or "that means a lot honestly". Use "u" not "you". Max 6 words. No periods.`)
      conversation.push({ role: 'subscriber', content: sub2 || 'yeah it was different with u',
        annotation: `💬 ${subName} warming up to Level 2 — her vulnerability is getting to him` })

      conversation.push({ role: 'creator', content: `i feel like i can be real with u`,
        annotation: `💕 STAGE B: Deepening — she trusts him specifically` })
      conversation.push({ role: 'creator', content: `and i dont feel that with most people`,
        annotation: `💕 STAGE B: Making him feel rare — not everyone gets this side of her` })
    }

    // Subscriber warms more (Level 2-3)
    const sub3 = await subscriberSays(conversation, subSys,
      `She showed deep vulnerability. You're at Level 2-3 now. React to what SHE said — open up a bit. Like "yeah i feel that too" or "its nice to just be real". Use "u" not "you". Max 8 words. No periods.`)
    conversation.push({ role: 'subscriber', content: sub3 || 'yeah i feel that too honestly',
      annotation: `💬 ${subName} at Level 2-3 — opening up because vulnerability feels safe with her` })

    // =============================================
    // STAGE C: PERSONAL CALLBACK (hardcoded + specific)
    // =============================================

    const allCallbacks = getPersonalCallbacks(p, stretched)

    // Use the primary job-based callback (send first 2 lines, wait, then emotional landing)
    const primaryCallback = allCallbacks[0]
    conversation.push({ role: 'creator', content: primaryCallback[0],
      annotation: `🎯 STAGE C (Personal Callback — THE POWER MOVE): Using his ${subJob} details to create deep emotional connection` })
    if (primaryCallback[1]) {
      conversation.push({ role: 'creator', content: primaryCallback[1],
        annotation: `🎯 STAGE C: Building the personal callback — referencing SPECIFIC details from his life` })
    }

    // Subscriber starts to respond (Level 2-3 — the callback is hitting)
    const sub4a = await subscriberSays(conversation, subSys,
      `She just referenced your actual ${subJob} job in an emotional way. React to what SHE said. Level 2-3. Short reaction. Like "haha yeah thats real" or "that actually means a lot". Use "u" not "you". Max 5 words. No periods.`)
    conversation.push({ role: 'subscriber', content: sub4a || 'haha yeah',
      annotation: `💬 ${subName} reacting to the personal callback — the details are hitting` })

    // Land the emotional payoff of the callback
    if (primaryCallback[2]) {
      conversation.push({ role: 'creator', content: primaryCallback[2],
        annotation: `🎯 STAGE C: Landing the emotional payoff — tying his work to how he makes HER feel` })
    }

    // Subscriber responds fully to personal callback (Level 3)
    const sub4 = await subscriberSays(conversation, subSys,
      `She connected your ${subJob} work to how you make her feel. This hit HARD. Level 3. React to what SHE said — open up and share something personal about your work or life. Like "yeah its what keeps me going honestly" or "means a lot coming from u". Use "u" not "you". Max 8 words. No periods.`)
    conversation.push({ role: 'subscriber', content: sub4 || 'haha yeah it really does mean a lot',
      annotation: `💬 ${subName} at Level 3 — the personal callback HIT. He's opening up because she proved she actually listens` })

    // Creator reacts to what he shared
    const callbackReact = await creatorSays(conversation, creatorSys,
      `He opened up after your personal callback about his ${subJob} job. He said: "${sub4}". React to what he SPECIFICALLY said. Use his name ${stretched}. ONE message. 6-8 words. No periods`, 1)
    for (const m of callbackReact) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ Creator reacts to his vulnerability — reinforcing that opening up is safe` })

    // Use secondary callback (pet/kids/loneliness detail)
    if (allCallbacks.length > 1) {
      const secondaryCallback = allCallbacks[1]
      for (const msg of secondaryCallback) {
        conversation.push({ role: 'creator', content: msg,
          annotation: `🎯 STAGE C: Second personal detail — layering personalization (${p.pets[0] ? 'his dog ' + p.pets[0] : p.hasKids ? 'his kids' : 'his personal life'})` })
      }
    }

    // Use third callback if available (early mornings, loneliness, etc.)
    if (allCallbacks.length > 2) {
      const thirdCallback = allCallbacks[2]
      for (const msg of thirdCallback) {
        conversation.push({ role: 'creator', content: msg,
          annotation: `🎯 STAGE C: Third personal detail — deep personalization (${p.specificDetails[0] || 'his personal situation'})` })
      }
    }

    // Subscriber deeply touched (Level 3-4)
    const sub5prompt = p.pets.length > 0
      ? `She mentioned your dog ${p.pets[0]} and other personal details. React to what SHE said. Level 3-4. Mention your dog naturally. Like "haha yeah ${p.pets[0].toLowerCase()} is probably wondering where i am" or "ill give him a pet from u". Use "u" not "you". Max 8 words. No periods.`
      : p.hasKids
        ? `She mentioned your kids and personal details. React to what SHE said. Level 3-4. Like "yeah they keep me going honestly" or "haha best part of my day". Use "u" not "you". Max 8 words. No periods.`
        : `She layered multiple personal details about your life. React to what SHE said. Level 3-4. Like "damn nobody ever remembers all that" or "u really pay attention huh". Use "u" not "you". Max 8 words. No periods.`
    const sub5 = await subscriberSays(conversation, subSys, sub5prompt)
    conversation.push({ role: 'subscriber', content: sub5 || 'haha yeah that means everything',
      annotation: `💬 ${subName} at Level 3-4 — emotionally engaged. He feels seen and valued as a person, not just a wallet` })

    // =============================================
    // STAGE D: GRATITUDE CLOSE + RE-ENTRY SEED
    // =============================================

    // React to his warmth (hardcoded to avoid repetitive AI phrases)
    conversation.push({ role: 'creator', content: `stop ${stretched} ur gonna make me cry`,
      annotation: `🌅 STAGE D: Reacting to his warmth — playful vulnerability that validates his openness` })

    // Gratitude close with re-entry seed
    const closeMessages = getGratitudeClose(p, stretched)
    for (const msg of closeMessages) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `🌅 STAGE D (Gratitude Close): Planting the re-entry seed — giving him a specific reason to come back tomorrow` })
    }

    // Final subscriber response (Level 4)
    const sub6prompt = p.pets.length > 0
      ? `She told you to cuddle with ${p.pets[0]} and send a pic tomorrow. React to what SHE said. Level 4. You WILL come back. Like "haha deal ill snap one for u" or "ill send u his cutest face". Use "u" not "you". Max 8 words. No periods.`
      : `She planted a seed for tomorrow and showed she cares. React to what SHE said. Level 4. You will come back. Like "for sure ill hit u up" or "deal talk tomorrow". Use "u" not "you". Max 8 words. No periods.`
    const sub6 = await subscriberSays(conversation, subSys, sub6prompt)
    conversation.push({ role: 'subscriber', content: sub6 || 'deal ill be back tomorrow',
      annotation: `💬 ${subName} is LOCKED IN — he will come back. The aftercare converted a one-time buyer into a loyal subscriber` })

    // =============================================
    // STAGE E: NEXT DAY RE-ENTRY
    // =============================================

    const reentryMessages = getNextDayReentry(p, stretched)
    const stageEAnnotations = [
      `☀️ STAGE E (Next Day Re-entry — 16-22 hrs later): Opening with his name + energy. She actually thought about him`,
      `☀️ STAGE E: Referencing something specific — proving she remembered their conversation`,
      `☀️ STAGE E: Asking about his life (${subJob}) — the re-engagement cycle begins again`,
    ]
    for (let i = 0; i < reentryMessages.length; i++) {
      conversation.push({ role: 'creator', content: reentryMessages[i],
        annotation: stageEAnnotations[i] || `☀️ STAGE E: Continuing re-entry` })
    }

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
