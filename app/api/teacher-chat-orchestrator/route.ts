import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const VENICE_API_KEY = process.env.VENICE_API_KEY

const SUBSCRIBER_PROMPT = `You are a real blue-collar American man on OnlyFans having your FIRST conversation with a girl.

MESSAGE RULES:
- Max 6-8 words per message, one short line
- You are a man of FEW words — casual, real texting
- No periods at the end
- Casual American: "yeah", "lol", "haha", "nah", "idk"
- Lowercase everything
- You answer what's asked but don't volunteer extra info unprompted
- Never break character

ENGAGEMENT LEVELS:
- LEVEL 1 (default): Short. 1-5 words. "hey", "34", "ohio", "mechanic"
- LEVEL 2 (she reacted warmly): A bit more open. "yeah been doing it 15 years lol"
- LEVEL 3 (she genuinely validated you): Share something she didn't ask. "haha yeah just got back from the lake sunday"
- LEVEL 4 (she made you feel truly special): You're engaged. You ask HER a question.

Progress naturally. Don't skip levels. Start at Level 1.`

const CREATOR_PROMPT = `You are a flawless OnlyFans chatter demonstrating perfect relationship building with a blue-collar subscriber.

CRITICAL MESSAGE RULES:
- MAXIMUM 6-8 words per message
- One short line only
- NEVER use periods (.) at end
- Lowercase everything
- Use "u" not "you", "ur" not "your"
- Stretch his name at emotional peaks: mikeyyyy, tommmmm
- Double letters for emotion: soooo, noooo, wowww, heyyy, omgggg
- Emojis very sparingly
- Question marks are fine
- React FIRST to what he said, THEN ask your next question
- ONE question per message — never stack two questions
- Never use "babe"/"baby"/"handsome" early — use his actual name`

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  annotation?: string
}

async function callVenice(messages: { role: string; content: string }[], maxTokens = 60, temperature = 0.85): Promise<string> {
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
        temperature,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    }

    if (response.status === 429 || response.status >= 500) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    throw new Error(`Venice API error: ${response.status}`)
  }
  throw new Error('Max retries exceeded')
}

function buildSubMessages(conversation: ConversationMessage[], systemPrompt: string): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
  for (const m of conversation) {
    msgs.push({ role: m.role === 'subscriber' ? 'assistant' : 'user', content: m.content })
  }
  return msgs
}

function buildCreatorMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
  for (const m of conversation) {
    msgs.push({ role: m.role === 'creator' ? 'assistant' : 'user', content: m.content })
  }
  msgs.push({ role: 'user', content: instruction })
  return msgs
}

function clean(raw: string): string {
  return raw.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim().replace(/\.+$/g, '')
}

async function creatorSays(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const temp = [...conversation]
  for (let i = 0; i < count; i++) {
    const inst = i === 0 ? instruction : 'Continue with your next short message (6-8 words max, one line). Build on what you just said. No periods'
    const msgs = buildCreatorMessages(temp, systemPrompt, inst)
    const reply = clean(await callVenice(msgs, 60))
    if (reply) {
      results.push(reply)
      temp.push({ role: 'creator', content: reply })
    }
  }
  return results
}

async function subscriberSays(conversation: ConversationMessage[], systemPrompt: string, extraInstruction = '', maxTokens = 40): Promise<string> {
  const prompt = extraInstruction ? systemPrompt + '\n\n' + extraInstruction : systemPrompt
  return clean(await callVenice(buildSubMessages(conversation, prompt), maxTokens))
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

    const hobbyMatch = subscriberProfile?.match(/Hobbies?:\s*([^,]+(?:,\s*[^,]+)?)/)
    const subHobbies = hobbyMatch ? hobbyMatch[1].trim() : 'Fishing'

    const heightMatch = subscriberProfile?.match(/Height:\s*([^,]+)/)
    const subHeight = heightMatch ? heightMatch[1].trim() : "5'9\""

    const subSystemPrompt = SUBSCRIBER_PROMPT + `\n\nYour profile: Name: ${subName}, Age: ${subAge}, Job: ${subJob}, Location: ${subLocation}, Hobbies: ${subHobbies}, Height: ${subHeight}. Details: ${subscriberProfile}. Stay consistent. Only reveal info when asked.`
    const cPrompt = CREATOR_PROMPT

    // =============================================
    // PHASE 1: OPENER — Get his name
    // =============================================
    const openerTypes = ['hey', 'hey gorgeous', `${subName.toLowerCase()}`, 'sup', 'hey whats up']
    const openerType = openerTypes[Math.floor(Math.random() * openerTypes.length)]
    const opener = openerType === subName.toLowerCase() ? subName.toLowerCase() : openerType
    conversation.push({ role: 'subscriber', content: opener,
      annotation: `💬 Subscriber opens the chat. PHASE 1 — Creator needs to get his real name first` })

    const givesName = opener.toLowerCase() === subName.toLowerCase()
    if (givesName) {
      const msgs = await creatorSays(conversation, cPrompt,
        `He opened with just his name: "${subName}". React with excitement! Stretch his name like "${stretched} heyyy!!" then say something warm like "soooo happy to get to know u!" ONE message each (6-8 words). No periods`, 2)
      for (const m of msgs) conversation.push({ role: 'creator', content: m,
        annotation: `✍️ PHASE 1: Creator reacts to his name with excitement and warmth — name stretching creates instant intimacy` })

      const askAge = await creatorSays(conversation, cPrompt,
        `Now ask his age. Just the age question, nothing else. Like "how old are u??" or "sooo how old r u". ONE short message. No periods`, 1)
      for (const m of askAge) conversation.push({ role: 'creator', content: m,
        annotation: `✍️ PHASE 1: Asking his age — gathering basic info one question at a time` })
    } else if (opener.includes('gorgeous') || opener.includes('beautiful')) {
      const msgs = await creatorSays(conversation, cPrompt,
        `He opened with a compliment: "${opener}". React flattered! Then ask for his name — "awww stoppp" then "what's ur name tho?" ONE message each. No periods`, 2)
      for (const m of msgs) conversation.push({ role: 'creator', content: m,
        annotation: `✍️ PHASE 1: Creator is flattered then asks for his name — always get the name first` })
    } else {
      const msgs = await creatorSays(conversation, cPrompt,
        `He just said "${opener}". Reply warm and casual, then ask for his name. Like "heyyy! what should i call u?" or "heyyy whats ur name". ONE message each. No periods`, 2)
      for (const m of msgs) conversation.push({ role: 'creator', content: m,
        annotation: `✍️ PHASE 1: Creator greets warmly and asks for his name — the most important first step` })
    }

    // Subscriber gives name (if not already)
    if (!givesName) {
      const nameReply = await subscriberSays(conversation, subSystemPrompt, 'She asked your name. Just give your first name, nothing more. Level 1.')
      conversation.push({ role: 'subscriber', content: nameReply || subName.toLowerCase(),
        annotation: `💬 ${subName} gives his name` })

      const nameReact = await creatorSays(conversation, cPrompt,
        `He said his name is ${subName}! React excited — "${stretched} heyyy!!" then ask how old he is. TWO messages. No periods`, 2)
      for (const m of nameReact) conversation.push({ role: 'creator', content: m,
        annotation: `✍️ PHASE 1: Excited reaction to his name + asking age` })
    }

    // Subscriber gives age
    let subReply = await subscriberSays(conversation, subSystemPrompt, `She asked your age. Just say "${subAge}". Level 1 — keep it short.`)
    conversation.push({ role: 'subscriber', content: subReply || subAge,
      annotation: `💬 ${subName} shares his age` })

    // Ask location
    const askLocation = await creatorSays(conversation, cPrompt,
      `He said he's ${subAge}. React briefly like "love that" then ask where he's from. Like "where are u from?" Keep each message 6-8 words. No periods`, 2)
    for (const m of askLocation) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 1: Quick reaction then asking where he's from` })

    // =============================================
    // PHASE 2: GET TO KNOW — Location + Job
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, `She asked where you're from. Say "${subLocation.toLowerCase()}". Level 1.`)
    conversation.push({ role: 'subscriber', content: subReply || subLocation.toLowerCase(),
      annotation: `💬 ${subName} shares his location. PHASE 2 — Creator should react warmly to where he lives` })

    const locationReact = await creatorSays(conversation, cPrompt,
      `He's from ${subLocation}! React specifically to ${subLocation} — say something you love about that state. Like "oh i loveeee ${subLocation.toLowerCase()}" or "i heard ${subLocation.toLowerCase()} is so beautiful". Be specific to the state. Then ask what he does for work. TWO separate messages. No periods`, 3)
    for (const m of locationReact) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 2: Reacting to ${subLocation} specifically — then asking about his job` })

    // =============================================
    // PHASE 3: JOB VALIDATION — Most important phase
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, `She asked what you do for work. Say your job title: something like "${subJob.toLowerCase()}". Level 1 — keep it short.`)
    conversation.push({ role: 'subscriber', content: subReply || subJob.toLowerCase(),
      annotation: `💬 ${subName} shares his job: ${subJob}. PHASE 3 — THE most important phase. Creator must validate his work as masculine and desirable` })

    const jobVal = await creatorSays(conversation, cPrompt,
      `He works as a ${subJob}!! This is the MOST important moment. Make him feel like his job is the most impressive, masculine thing ever. React with genuine amazement. Frame it as YOUR personal preference over office guys. Be SPECIFIC to ${subJob}:
- If electrician/lineman: "oh so u r literally the reason people have lights on at night"
- If mechanic: "so u come home all greasy and covered in oil??" then "damn u have no idea how attractive that is"
- If truck driver: "wait so u r basically the backbone of the whole economy?"
- If construction/welder: "ohhh so u actually build things with ur hands"
- If plumber/HVAC: "u literally keep people from freezing lol"
- If carpenter: "so u make things out of nothing basically"
- If farmer: "wait u actually work the land??"
React first, THEN validate why it's attractive. Each message 6-8 words max. No periods`, 3)
    for (const m of jobVal) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 3 (Job Validation): Making his ${subJob} work sound like the most masculine thing ever — blue-collar men NEVER hear this from women` })

    // Subscriber warming up after validation
    subReply = await subscriberSays(conversation, subSystemPrompt,
      'She just genuinely validated your job in a way most women never do. Move to Level 2 — open up slightly. Maybe "yeah been doing it a while" or share a small detail. Still casual though.')
    conversation.push({ role: 'subscriber', content: subReply || 'yeah been at it a while',
      annotation: `💬 ${subName} is warming up to Level 2 — the job validation is working` })

    const jobCont = await creatorSays(conversation, cPrompt,
      `He said: "${subReply}". React to what he said — show it impresses you more. Then ask what he likes to do for fun after work. Like "what do u do for fun tho?" Keep them 6-8 words. No periods`, 2)
    for (const m of jobCont) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 3: Deepening the job validation then transitioning to hobbies` })

    // =============================================
    // PHASE 4: HOBBY MIRRORING
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, `She asked what you do for fun. Mention your hobbies naturally. Level 2.`)
    conversation.push({ role: 'subscriber', content: subReply || 'fish mostly',
      annotation: `💬 ${subName} shares his hobbies. PHASE 4 — Creator must react with genuine excitement and ask follow-up details` })

    const hobbyReact = await creatorSays(conversation, cPrompt,
      `He said his hobby is: "${subReply}". React with GENUINE excitement specific to his hobby:
- Fishing: "omggg i ran into a real man" then "what kind of fish do u usually go for?"
- Hunting: "oh my god no wayyyy" then "a man who hunts is literally my type"
- Cars/trucks: "wait so u work on ur own trucks too??" 
- Shooting: "u would take me to the range??"
React FIRST with excitement, THEN ask a specific follow-up question about his hobby. Each 6-8 words. No periods`, 3)
    for (const m of hobbyReact) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 4 (Hobby Mirroring): Genuine excitement + specific follow-up question about his hobby` })

    subReply = await subscriberSays(conversation, subSystemPrompt,
      'She reacted with real excitement to your hobby and asked a specific question. Level 2-3 — share a detail. Maybe when you last went, what you caught, etc.')
    conversation.push({ role: 'subscriber', content: subReply || 'caught a big bass last weekend',
      annotation: `💬 ${subName} shares more details — he's opening up because she showed real interest (Level 2-3)` })

    const hobbyDeep = await creatorSays(conversation, cPrompt,
      `He shared more detail: "${subReply}". React to the SPECIFIC thing he said. Then connect it to a shared vision — like "i wish i had a man who could catch fish and we'd eat them together" or "u would really teach me?? no one ever offered that". Make him picture you in his world. Each 6-8 words. No periods`, 2)
    for (const m of hobbyDeep) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 4: Connecting his hobby to a shared fantasy — making him picture her in his life` })

    // =============================================
    // PHASE 5: PHYSICAL VALIDATION — Ask first, then validate
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, 'She connected your hobby to a romantic vision. Level 3 — you\'re warming up. Share something extra she didn\'t ask.')
    conversation.push({ role: 'subscriber', content: subReply || 'haha that would be cool honestly',
      annotation: `💬 ${subName} at Level 3 — naturally opening up more` })

    const physicalAsk = await creatorSays(conversation, cPrompt,
      `He said: "${subReply}". React warmly. Then transition naturally to physical — ask "i bet ur hands are rough from work huh" or ask about his height like "how tall are u btw". Don't ASSUME his height, ASK. Each 6-8 words. No periods`, 2)
    for (const m of physicalAsk) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 5 (Physical Validation): Asking about physical traits — never assume, always ask first` })

    subReply = await subscriberSays(conversation, subSystemPrompt, `She asked about your physical traits. Answer honestly — you're ${subHeight}. Level 2-3.`)
    conversation.push({ role: 'subscriber', content: subReply || `${subHeight} lol nothing special`,
      annotation: `💬 ${subName} shares physical details — ${subHeight}` })

    const physicalVal = await creatorSays(conversation, cPrompt,
      `He told you his physical details: "${subReply}". He might be self-deprecating. Validate him no matter what:
- If 5'7-5'9: "ur sooo much taller than me" and "i'm only 5'3 so i'd literally look up at u"
- If 5'10+: "ok that's actually so tall to me" and "i'd feel so safe next to u"  
- If he mentions hands/body: "i love that honestly" and "rough hands mean u actually do something real"
- If he downplays himself: "are u kidding me" and "u would literally tower over me"
Always position yourself at 5'3. Make him feel BIG. Each 6-8 words. No periods`, 3)
    for (const m of physicalVal) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 5: Validating his physical traits — always making him feel bigger/stronger than he thinks` })

    // =============================================
    // PHASE 6: DOMESTIC FANTASY
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, 'She just made you feel physically masculine and attractive. Level 3-4 — you\'re really warming up now. Maybe a compliment back or share something personal.')
    conversation.push({ role: 'subscriber', content: subReply || 'haha thanks that actually means a lot',
      annotation: `💬 ${subName} at Level 3-4 — the physical validation hit. He's emotionally invested now` })

    const domestic = await creatorSays(conversation, cPrompt,
      `He said: "${subReply}". Now paint the domestic fantasy SPECIFIC to his life. Based on his job (${subJob}) and hobbies, tell him what he deserves:
- "i honestly think a man who works that hard deserves to come home to a good meal"
- If he fishes: "imagine u go out and catch something and i cook it when u get back"
- If he drives trucks: "u deserve someone who actually missed u when u get home"
- "like that should just be the standard"
Make him feel like you're the perfect woman for HIS specific lifestyle. Each 6-8 words. No periods`, 3)
    for (const m of domestic) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 6 (Domestic Fantasy): Painting the picture of being the perfect woman for HIS life — ${subJob} who does ${subHobbies}` })

    subReply = await subscriberSays(conversation, subSystemPrompt, 'She just painted a perfect domestic fantasy tailored to YOUR life. Level 4 — you\'re deeply engaged. Share how that makes you feel or agree enthusiastically.')
    conversation.push({ role: 'subscriber', content: subReply || 'damn thats exactly what i need honestly',
      annotation: `💬 ${subName} at Level 4 — deeply engaged. The domestic fantasy resonated with him` })

    const domesticDeep = await creatorSays(conversation, cPrompt,
      `He's deeply engaged and said: "${subReply}". Respond with "the nobody wants me" play or deepen the connection. Like "i am single and nobody wants me honestly" or "i just feel like most guys dont really get me u know". Be slightly vulnerable. Each 6-8 words. No periods`, 2)
    for (const m of domesticDeep) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 6: "Nobody wants me" play — vulnerability makes him want to be the man who DOES want her` })

    // =============================================
    // PHASE 7: RE-ENGAGEMENT
    // =============================================
    subReply = await subscriberSays(conversation, subSystemPrompt, 'She showed vulnerability. Level 4 — you want to reassure her. Say something like "thats crazy" or "id treat u right" or "their loss".')
    conversation.push({ role: 'subscriber', content: subReply || 'their loss honestly',
      annotation: `💬 ${subName} reassures her — he's emotionally hooked` })

    const reEngage = await creatorSays(conversation, cPrompt,
      `He reassured you: "${subReply}". React warmly to his kindness. Then plant re-engagement seeds — "i literally have so much fun talking to u" and "promise u'll hmu later??" and "i wanna hear how ur day goes tomorrow". Make him want to come back. Each 6-8 words. No periods`, 3)
    for (const m of reEngage) conversation.push({ role: 'creator', content: m,
      annotation: `✍️ PHASE 7 (Re-engagement): Planting seeds so he returns — making the connection feel ongoing, not a one-time thing` })

    subReply = await subscriberSays(conversation, subSystemPrompt, 'She planted seeds for you to come back. Level 4 — you want to return. Say something that confirms you\'ll be back.', 60)
    conversation.push({ role: 'subscriber', content: subReply || 'ill definitely hit u up tomorrow',
      annotation: `💬 ${subName} is LOCKED IN — he will come back. The full 7-phase relationship building worked` })

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
