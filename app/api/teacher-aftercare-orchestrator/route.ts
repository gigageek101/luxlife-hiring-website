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
    const sub1 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just sounded breathless after what happened: "${breathMsg1}" then "${breathMsg2[0] || ''}". You're at Level 1 — short response. Like "haha yeah" or "thanks" or "it was pretty good". Max 4-5 words. No periods.` },
    ], 25))
    conversation.push({ role: 'subscriber', content: sub1 || 'haha yeah',
      annotation: `💬 ${subName} at Level 1 — short post-PPV response. Creator needs to earn deeper engagement` })

    // =============================================
    // STAGE B: VULNERABILITY DROP (react, then vulnerable)
    // =============================================

    // React to what he said first
    const vulnReact = await creatorSays(conversation, creatorSys,
      `He said: "${sub1}". React to HIS specific words first — show you're listening. Something like "see thats what i mean" or "i love that u felt it too". Use his name ${stretched}. ONE message. 6-8 words. No periods`, 1)
    for (const m of vulnReact) conversation.push({ role: 'creator', content: m,
      annotation: `💕 STAGE B: Reacting to his words — always acknowledge what HE said before continuing` })

    // Vulnerability with hesitation
    const vulnMsg = scenarioType === 'feels-guilty'
      ? `hey ${stretched} dont do that okay`
      : scenarioType === 'never-does-this'
        ? `${stretched} that actually makes it mean more`
        : `${stretched} i dont say this a lot but`
    conversation.push({ role: 'creator', content: vulnMsg,
      annotation: `💕 STAGE B (Vulnerability Drop): The hesitation makes it feel genuine — "i don't say this a lot but..." creates anticipation` })

    const vulnFollow = scenarioType === 'feels-guilty'
      ? `u deserve to feel good sometimes`
      : scenarioType === 'never-does-this'
        ? `it means ur not like the other guys`
        : `u actually made me feel something real`
    conversation.push({ role: 'creator', content: vulnFollow,
      annotation: `💕 STAGE B: Completing the vulnerability drop — specific to what just happened` })

    // Subscriber responds (Level 2)
    const sub2prompt = scenarioType === 'feels-guilty'
      ? `She reassured you about spending money, said you deserve to feel good. You're warming up. Level 2. Like "yeah i guess u right" or "thanks that means a lot". Max 6 words. No periods.`
      : scenarioType === 'never-does-this'
        ? `She said it makes it mean more that you don't usually do this. Level 2. Like "yeah its different with u" or "i really dont do this". Max 6 words. No periods.`
        : scenarioType === 'opens-up-lonely'
          ? `She showed real vulnerability. You're opening up. Level 2. Like "yeah it hit different honestly" or "that means a lot fr". Max 6 words. No periods.`
          : `She showed vulnerability and said you made her feel something real. Level 2. Something like "yeah it was different with u" or "that means a lot honestly". Max 6 words. No periods.`
    const sub2 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: sub2prompt },
    ], 30))
    conversation.push({ role: 'subscriber', content: sub2 || 'yeah that means a lot',
      annotation: `💬 ${subName} warming up to Level 2 — her vulnerability is getting to him. Notice longer responses now` })

    // Deepen vulnerability based on his response
    const vulnDeep = await creatorSays(conversation, creatorSys,
      `He said: "${sub2}" and is warming up. Deepen the vulnerability. React to his words, then share something more personal. Like "see ${stretched} thats what im saying" or "i feel like i can be real with u". Show him this is special. TWO messages. 6-8 words each. No periods`, 2)
    for (const m of vulnDeep) conversation.push({ role: 'creator', content: m,
      annotation: `💕 STAGE B: Deepening vulnerability — responding to HIS words specifically, building trust` })

    // Subscriber warms more (Level 2-3)
    const sub3 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She deepened the vulnerability. You're between Level 2-3 now. Open up a bit more. Mention something about your life naturally. Like "yeah i dont usually open up like this" or reference your ${subJob} work or ${p.hobbies[0] || 'hobbies'}. Max 8 words. No periods.` },
    ], 40))
    conversation.push({ role: 'subscriber', content: sub3 || 'yeah it just hit different tonight',
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
    const sub4a = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just started referencing your actual ${subJob} job in an emotional way. You're warming up. Level 2-3. Short reaction. Like "haha yeah" or "that means a lot". Max 5 words. No periods.` },
    ], 25))
    conversation.push({ role: 'subscriber', content: sub4a || 'haha yeah',
      annotation: `💬 ${subName} reacting to the personal callback — the details are hitting` })

    // Land the emotional payoff of the callback
    if (primaryCallback[2]) {
      conversation.push({ role: 'creator', content: primaryCallback[2],
        annotation: `🎯 STAGE C: Landing the emotional payoff — tying his work to how he makes HER feel` })
    }

    // Subscriber responds fully to personal callback (Level 3)
    const sub4 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just connected your ${subJob} work to how you make her feel. This hit HARD. Level 3. Open up — share something personal. Like "yeah its a lot but i love it" or reference your ${p.pets[0] ? 'dog ' + p.pets[0] : p.hobbies[0] || 'life'}. Max 8 words. No periods.` },
    ], 40))
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
      ? `She mentioned your dog ${p.pets[0]}. This really got to you. Level 3-4. React warmly — mention your dog. Like "haha yeah ${p.pets[0].toLowerCase()} is probably waiting for me" or "ill give him a pet from u lol". Max 8 words. No periods.`
      : p.hasKids
        ? `She mentioned your kids. Level 3-4. React warmly. Like "yeah they keep me going honestly" or "haha yeah theyre everything". Max 8 words. No periods.`
        : `She doubled down on personal details. Level 3-4. You feel genuinely valued. Like "damn u really remember all that" or "nobody ever said that to me". Max 8 words. No periods.`
    const sub5 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: sub5prompt },
    ], 40))
    conversation.push({ role: 'subscriber', content: sub5 || 'haha yeah that means everything',
      annotation: `💬 ${subName} at Level 3-4 — emotionally engaged. He feels seen and valued as a person, not just a wallet` })

    // =============================================
    // STAGE D: GRATITUDE CLOSE + RE-ENTRY SEED
    // =============================================

    // React to his warmth first
    const closeReact = await creatorSays(conversation, creatorSys,
      `He said: "${sub5}" and is deeply engaged. React warmly to what he said. Something like "see ${stretched} thats why i love talking to u" or "stop ur gonna make me feel things". ONE message. 6-8 words. No periods`, 1)
    for (const m of closeReact) conversation.push({ role: 'creator', content: m,
      annotation: `🌅 STAGE D: Reacting to his warmth — validating his openness` })

    // Gratitude close with re-entry seed
    const closeMessages = getGratitudeClose(p, stretched)
    for (const msg of closeMessages) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `🌅 STAGE D (Gratitude Close): Planting the re-entry seed — giving him a specific reason to come back tomorrow` })
    }

    // Final subscriber response (Level 4)
    const sub6prompt = p.pets.length > 0
      ? `She told you to cuddle with ${p.pets[0]} and send a pic tomorrow. Level 4. You WILL come back. Like "haha ill snap one for u tomorrow" or "deal ill send u the cutest one". Max 8 words. No periods.`
      : `She planted a seed for tomorrow and showed she cares. Level 4. You will definitely come back. Like "for sure ill hit u up" or "deal talk tomorrow". Max 8 words. No periods.`
    const sub6 = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: sub6prompt },
    ], 30))
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
