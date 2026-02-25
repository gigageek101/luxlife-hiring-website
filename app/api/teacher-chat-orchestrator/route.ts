import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

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

function creatorSystemPre(): string {
  return `You are a casual American girl texting a new subscriber on OnlyFans. You don't know his name yet.

RULES:
- Max 6-8 words per message. ONE short line.
- NEVER use periods at end of messages
- Lowercase everything
- Use "u" not "you", "ur" not "your"
- Double letters: soooo, wowww, heyyy
- Sound like a real girl TEXTING, not writing poetry
- NO fancy language, NO metaphors, NO poetic phrases`
}

function creatorSystem(name: string): string {
  const stretched = name.toLowerCase().slice(0, -1) + name.toLowerCase().slice(-1).repeat(4)
  return `You are a casual American girl texting ${name} on OnlyFans. You are flirty, warm, and genuine.

ABSOLUTE RULES:
- His name is ${name}. ONLY call him ${name}. NEVER use any other name.
- Stretch his name sometimes: ${stretched}
- Max 6-8 words per message. ONE short line.
- NEVER use periods at end of messages
- Lowercase everything
- Use "u" not "you", "ur" not "your"
- Double letters: soooo, wowww, omgggg, heyyy
- Sound like a real girl TEXTING, not writing poetry
- NO fancy language, NO metaphors, NO poetic phrases
- Talk like: "omg thats so cool" NOT "your soul shines bright"
- React to what he says, don't make stuff up`
}

async function creatorSays(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const temp = [...conversation]
  for (let i = 0; i < count; i++) {
    const inst = i === 0 ? instruction : 'Send ONE more short follow-up (max 6-8 words). No periods. No poetry. Plain casual texting.'
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

export async function POST(request: NextRequest) {
  try {
    if (!VENICE_API_KEY) {
      return NextResponse.json({ error: 'Venice API key not configured.' }, { status: 500 })
    }

    const { subscriberProfile } = await request.json()
    const conversation: ConversationMessage[] = []

    const nameMatch = subscriberProfile?.match(/Name:\s*(\w+)/)
    const subName = nameMatch ? nameMatch[1] : 'Mike'
    const stretched = subName.toLowerCase().slice(0, -1) + subName.toLowerCase().slice(-1).repeat(4)

    const jobMatch = subscriberProfile?.match(/Job:\s*([^,]+)/)
    const subJob = jobMatch ? jobMatch[1].trim() : 'Electrician'

    const locationMatch = subscriberProfile?.match(/Location:\s*([^,]+)/)
    const subLocation = locationMatch ? locationMatch[1].trim() : 'Texas'

    const ageMatch = subscriberProfile?.match(/Age:\s*(\d+)/)
    const subAge = ageMatch ? ageMatch[1] : '40'

    const hobbyMatch = subscriberProfile?.match(/Hobbies?:\s*([^,]+(?:\s+and\s+[^,]+)?)/)
    const subHobbies = hobbyMatch ? hobbyMatch[1].trim() : 'Fishing'
    const firstHobby = subHobbies.split(/\s+and\s+/i)[0].toLowerCase().trim()

    const heightMatch = subscriberProfile?.match(/Height:\s*([^,"\n]+)/)
    const subHeight = heightMatch ? heightMatch[1].trim() : "5'9\""

    const extraDetails = subscriberProfile || ''

    const cSysPre = creatorSystemPre()
    const cSys = creatorSystem(subName)

    // =============================================
    // PHASE 1: OPENER — Get his name
    // =============================================

    const openers = ['hey', 'hey gorgeous', 'sup', 'whats up']
    const opener = openers[Math.floor(Math.random() * openers.length)]
    conversation.push({ role: 'subscriber', content: opener,
      annotation: `💬 Subscriber opens. PHASE 1 — Creator needs to get his real name` })

    // Creator asks for name (using pre-name system - she doesn't know his name yet)
    const nameAsk = await creatorSays(conversation, cSysPre,
      `He said "${opener}". Greet him warmly and ask his name. Say "heyyy! whats ur name" or "aww hey! what should i call u". Max 6-8 words. No periods`, 1)
    for (const m of nameAsk) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 1: Greeting warmly + asking for his name` })

    // Subscriber gives name
    conversation.push({ role: 'subscriber', content: subName.toLowerCase(),
      annotation: `💬 ${subName} gives his name` })

    // Creator reacts to name (NOW using the named system prompt)
    const nameReact = await creatorSays(conversation, cSys,
      `He just told you his name is ${subName}! React excited: "${stretched} heyyy!!" then "soooo happy to talk to u". Max 6-8 words each. No periods`, 2)
    for (const m of nameReact) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 1: Excited name reaction — stretching his name builds instant connection` })

    // Creator asks age
    const ageAsk = await creatorSays(conversation, cSys,
      `Now ask his age. Just say "how old are u" or "sooo how old r u ${stretched}". ONLY that. Max 6-8 words. No periods`, 1)
    for (const m of ageAsk) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 1: Asking age — one question at a time` })

    // Subscriber gives age
    conversation.push({ role: 'subscriber', content: subAge,
      annotation: `💬 ${subName} shares his age: ${subAge}` })

    // Creator reacts + asks location
    const locAsk = await creatorSays(conversation, cSys,
      `He said he's ${subAge}. React briefly then ask where he's from. Like "love that" then "where u from ${stretched}". Remember his name is ${subName}. Max 6-8 words each. No periods`, 2)
    for (const m of locAsk) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 1: Reacting to age + asking location` })

    // =============================================
    // PHASE 2: LOCATION REACTION
    // =============================================

    // Subscriber gives location
    conversation.push({ role: 'subscriber', content: subLocation.toLowerCase(),
      annotation: `💬 ${subName} shares his location: ${subLocation}. PHASE 2 — React warmly to where he lives` })

    // Creator reacts to location
    const locMap: Record<string, string> = {
      'Texas': 'oh i loveeee texas honestly',
      'Ohio': 'oh i heard ohio is so beautiful',
      'Kentucky': 'omg i love kentucky honestly',
      'Florida': 'lucky u i wish i was somewhere warm',
      'Indiana': 'i love the midwest real people live there',
      'Montana': 'omg montana is literally so gorgeous',
      'Georgia': 'oh i love georgia the people are so sweet',
      'Oklahoma': 'i love oklahoma honestly so real out there',
    }
    const locReaction = locMap[subLocation] || `oh i love ${subLocation.toLowerCase()} honestly`
    conversation.push({ role: 'creator', content: locReaction,
      annotation: `✍️ PHASE 2: Reacting specifically to ${subLocation} — making his home feel special` })

    // Creator asks about work
    const workAsk = await creatorSays(conversation, cSys,
      `You just reacted to his location ${subLocation}. Now ask what he does for work. Just say "what do u do for work btw" or "sooo what do u do for work ${stretched}". ONLY use the name ${subName}. Max 6-8 words. No periods`, 1)
    for (const m of workAsk) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 2: Asking about his job — setting up the most important phase` })

    // =============================================
    // PHASE 3: JOB VALIDATION
    // =============================================

    // Subscriber shares job
    conversation.push({ role: 'subscriber', content: subJob.toLowerCase(),
      annotation: `💬 ${subName} shares his job: ${subJob}. PHASE 3 — THE most important phase` })

    // Job-specific validation responses
    const jobLower = subJob.toLowerCase()
    let jobResponses: string[]
    if (jobLower.includes('electric') || jobLower.includes('lineman')) {
      jobResponses = [
        'oh so u r literally the reason people have lights on',
        'i never thought about it like that but thats amazing',
        'u have no idea how attractive that is to me',
      ]
    } else if (jobLower.includes('mechanic')) {
      jobResponses = [
        'so u come home all greasy every day??',
        'damn u have no idea how much i love that',
        'real men come home dirty from work honestly',
      ]
    } else if (jobLower.includes('truck') && jobLower.includes('driv')) {
      jobResponses = [
        'wait so u r basically the backbone of the economy',
        'nothing moves in this country without truck drivers',
        'that sounds so lonely tho u deserve someone to come home to',
      ]
    } else if (jobLower.includes('construct') || jobLower.includes('weld')) {
      jobResponses = [
        'ohhh so u actually build things with ur hands',
        'thats so underrated honestly like u can say i built that',
        'i think thats one of the most manly things ever',
      ]
    } else if (jobLower.includes('plumb') || jobLower.includes('hvac')) {
      jobResponses = [
        'u literally keep people from freezing and flooding lol',
        'people dont realize how important that is',
        'do u do it all or specialize in something',
      ]
    } else if (jobLower.includes('carpenter') || jobLower.includes('wood')) {
      jobResponses = [
        'so u make things out of nothing basically',
        'thats lowkey one of the most attractive things ever',
        'i love a man who can build stuff with his hands',
      ]
    } else if (jobLower.includes('farm') || jobLower.includes('ranch')) {
      jobResponses = [
        'wait u actually work the land??',
        'theres something so different about men who do that',
        'i have so much respect for that honestly',
      ]
    } else {
      jobResponses = [
        `omg thats actually so cool to me`,
        `i love a man who actually works hard`,
        `that takes real skill honestly`,
      ]
    }
    for (const msg of jobResponses) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 3 (Job Validation): Making his ${subJob} work sound masculine and desirable` })
    }

    // Subscriber responds to validation
    const subSys = `You are ${subName}, a ${subAge}-year-old ${subJob} from ${subLocation}. You text casually: lowercase, short messages, max 6-8 words. No periods. You're warming up because a girl genuinely validated your work.`
    const valReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just told you your ${subJob} job is really attractive and masculine. You're warming up. Say something like "haha yeah been doing it a while" or "yeah its hard work but i love it". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: valReply || 'haha yeah been doing it a while',
      annotation: `💬 ${subName} warming up (Level 2) — the job validation is working` })

    // Transition to hobbies
    const hobbyTrans = await creatorSays(conversation, cSys,
      `He said: "${valReply}". React impressed, then ask what he does for fun. Like "thats awesome" then "what do u do for fun tho". His name is ${subName}. Max 6-8 words each. No periods`, 2)
    for (const m of hobbyTrans) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 3: Reacting + transitioning to hobbies` })

    // =============================================
    // PHASE 4: HOBBY MIRRORING
    // =============================================

    // Subscriber shares hobbies
    const hobbyReply = clean(await callVenice([
      { role: 'system', content: subSys + ` Your hobbies are: ${subHobbies}.` },
      { role: 'user', content: `She asked what you do for fun. Mention your hobbies: ${subHobbies}. Keep it casual and short. Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: hobbyReply || firstHobby,
      annotation: `💬 ${subName} shares his hobbies. PHASE 4 — Creator must react with excitement` })

    // Hobby-specific reactions
    let hobbyResponses: string[]
    if (subHobbies.toLowerCase().includes('fish')) {
      hobbyResponses = [
        `damn i ran into a real man`,
        `what kind of fish do u usually go for`,
      ]
    } else if (subHobbies.toLowerCase().includes('hunt')) {
      hobbyResponses = [
        `oh my god no wayyyy`,
        `a man who hunts is literally my type`,
        `what do u usually go for`,
      ]
    } else if (subHobbies.toLowerCase().includes('shoot') || subHobbies.toLowerCase().includes('range')) {
      hobbyResponses = [
        `oh really u would take me to the range??`,
        `no one ever offered that before`,
        `i always wanted to learn how to shoot`,
      ]
    } else if (subHobbies.toLowerCase().includes('truck') || subHobbies.toLowerCase().includes('car')) {
      hobbyResponses = [
        `ok so u r literally the definition of a handyman`,
        `i find that so attractive honestly`,
        `what are u working on right now`,
      ]
    } else if (subHobbies.toLowerCase().includes('camp')) {
      hobbyResponses = [
        `i bet u actually know how to survive in the woods`,
        `do u do the full campfire setup and everything`,
      ]
    } else if (subHobbies.toLowerCase().includes('nascar') || subHobbies.toLowerCase().includes('football') || subHobbies.toLowerCase().includes('sport')) {
      hobbyResponses = [
        `oh who do u root for`,
        `i love a man who watches the games honestly`,
      ]
    } else {
      hobbyResponses = [
        `omg i love that honestly`,
        `tell me more about that`,
      ]
    }
    for (const msg of hobbyResponses) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 4 (Hobby Mirroring): Genuine excitement + follow-up question` })
    }

    // Subscriber shares more detail
    const hobbyDetail = clean(await callVenice([
      { role: 'system', content: subSys + ` Your hobbies: ${subHobbies}. Details: ${extraDetails}` },
      { role: 'user', content: `She asked for more details about your hobby (${subHobbies}). Share something specific — like what you caught, where you go, etc. Level 2-3. Max 8 words. No periods.` },
    ], 40))
    conversation.push({ role: 'subscriber', content: hobbyDetail || 'yeah went out last weekend actually',
      annotation: `💬 ${subName} sharing details (Level 2-3) — opening up because she showed real interest` })

    // Connect hobby to shared vision
    const hobbyVision = await creatorSays(conversation, cSys,
      `He shared: "${hobbyDetail}". React to what he said, then connect his hobby to a shared dream. Like "i wish i had a man who could [his hobby] and we'd [do it together]". His name is ${subName}. Max 6-8 words each. No periods. No poetry. Plain texting only.`, 2)
    for (const m of hobbyVision) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 4: Connecting his hobby to a shared vision — making him picture her in his life` })

    // =============================================
    // PHASE 5: PHYSICAL VALIDATION
    // =============================================

    const physReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She connected your hobby to doing it together. React positively. Level 3. Like "haha that would be cool" or "id love that honestly". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: physReply || 'haha that would be cool honestly',
      annotation: `💬 ${subName} at Level 3 — warming up` })

    // Ask about rough hands (tied to his job)
    conversation.push({ role: 'creator', content: `i bet ur hands are rough from work huh`,
      annotation: `✍️ PHASE 5 (Physical Validation): Asking about his hands — tied to his ${subJob} job` })

    // Subscriber responds about hands
    const handsReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She asked if your hands are rough from your ${subJob} work. Answer honestly — your hands ARE rough from work. Say something like "haha yeah pretty rough" or "yeah calluses everywhere lol". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: handsReply || 'haha yeah pretty rough',
      annotation: `💬 ${subName} confirms his rough hands` })

    // Validate rough hands
    conversation.push({ role: 'creator', content: `i love that honestly`,
      annotation: `✍️ PHASE 5: Validating his rough hands` })
    conversation.push({ role: 'creator', content: `soft hands on a man are such a turn off`,
      annotation: `✍️ PHASE 5: Framing rough hands as her PREFERENCE — not generic, personal taste` })

    // Ask about height
    conversation.push({ role: 'creator', content: `how tall are u btw`,
      annotation: `✍️ PHASE 5: Asking height — never assume, always ask` })

    // Subscriber gives height
    const heightSelfDeprecate = parseFloat(subHeight.replace(/['"]/g, '.').replace(/\s/g, '')) < 5.9
    conversation.push({ role: 'subscriber', content: heightSelfDeprecate ? `${subHeight} i know its not that tall` : `${subHeight} lol`,
      annotation: `💬 ${subName} shares his height: ${subHeight}` })

    // Height validation
    let heightResponses: string[]
    if (heightSelfDeprecate) {
      heightResponses = [
        `are u kidding me`,
        `u would literally tower over me`,
        `i'm only 5'3 so ur sooo much taller`,
      ]
    } else {
      heightResponses = [
        `ok thats actually so tall to me`,
        `i'm only 5'3 so i'd be tiny next to u`,
        `i'd feel so safe next to u honestly`,
      ]
    }
    for (const msg of heightResponses) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 5: Making him feel big — positioning herself at 5'3 so he towers over her` })
    }

    // =============================================
    // PHASE 6: DOMESTIC FANTASY
    // =============================================

    const domReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just made you feel really masculine and attractive. Level 3-4. Say something like "haha thanks that means a lot" or "ur sweet honestly". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: domReply || 'haha thanks that means a lot',
      annotation: `💬 ${subName} at Level 3-4 — emotionally invested now` })

    // Domestic fantasy tailored to his life
    let domesticResponses: string[]
    if (jobLower.includes('truck') && jobLower.includes('driv')) {
      domesticResponses = [
        `i think when u finally get home after a long trip`,
        `u deserve a real meal and someone who missed u`,
        `like that should just be the standard`,
      ]
    } else if (subHobbies.toLowerCase().includes('fish')) {
      domesticResponses = [
        `u know what i love the idea of`,
        `like u go out and catch something and i cook it`,
        `thats like the perfect evening honestly`,
      ]
    } else {
      domesticResponses = [
        `i honestly think a man who works that hard`,
        `deserves to come home to a good meal`,
        `like that should just be the standard honestly`,
      ]
    }
    for (const msg of domesticResponses) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 6 (Domestic Fantasy): Painting the perfect woman picture for HIS life` })
    }

    // Subscriber deeply engaged
    const deepReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She painted a domestic fantasy perfectly tailored to your life. Level 4. Say something like "damn thats exactly what i need" or "i wish that was real honestly". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: deepReply || 'damn thats exactly what i need',
      annotation: `💬 ${subName} at Level 4 — the domestic fantasy resonated deeply` })

    // "Nobody wants me" play
    conversation.push({ role: 'creator', content: `i am single and nobody wants me honestly`,
      annotation: `✍️ PHASE 6: "Nobody wants me" play — vulnerability makes him want to protect her` })
    conversation.push({ role: 'creator', content: `idk why`,
      annotation: `✍️ PHASE 6: Short vulnerable follow-up — less is more here` })

    // Subscriber reassures
    const reassure = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She just said she's single and nobody wants her. You want to reassure her. Level 4. Say something like "thats crazy" or "their loss honestly" or "id treat u right". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: reassure || 'their loss honestly',
      annotation: `💬 ${subName} reassures her — he's emotionally hooked` })

    // =============================================
    // PHASE 7: RE-ENGAGEMENT
    // =============================================

    const reEngageResponses = [
      `${stretched} ur so sweet honestly`,
      `i literally have so much fun talking to u`,
      `promise ull hmu tomorrow??`,
    ]
    for (const msg of reEngageResponses) {
      conversation.push({ role: 'creator', content: msg,
        annotation: `✍️ PHASE 7 (Re-engagement): Planting seeds so he comes back tomorrow` })
    }

    // Final response
    const finalReply = clean(await callVenice([
      { role: 'system', content: subSys },
      { role: 'user', content: `She asked you to promise to hit her up tomorrow. Level 4. Say you'll be back. Like "for sure ill hit u up" or "definitely talk tomorrow". Max 8 words. No periods.` },
    ], 30))
    conversation.push({ role: 'subscriber', content: finalReply || 'for sure ill hit u up tomorrow',
      annotation: `💬 ${subName} is LOCKED IN — he will come back. The 7-phase relationship building worked` })

    return NextResponse.json({
      conversation,
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
