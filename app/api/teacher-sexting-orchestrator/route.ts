import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const SUBSCRIBER_PROMPT = `You are a real OnlyFans subscriber in SEXTING mode. You are a horny blue-collar American man.

CRITICAL MESSAGE LENGTH RULE:
- MAXIMUM 6-8 words per message
- One short line only
- NEVER write more than one sentence

YOUR STYLE:
- Sexually excited, very explicit, graphic
- Casual American: "fuck", "damn", "baby", "god damn", abbreviations
- You describe vivid sexual scenarios about what you'd do to her
- You use SPECIFIC body parts and actions, never vague
- You paint a picture with your words so she has keywords to work with

EVERY MESSAGE MUST contain graphic sexual words like:
- body parts: pussy, ass, tits, thighs, lips, cock, dick
- actions: bend over, eat, spank, choke, pull hair, pin down, slide inside, pound, ride, gag, spread, fill up, grab, lick
- descriptors: hard, wet, deep, slow, rough, raw, tight, dripping
- settings: counter, wall, bed, shower, kitchen

EXAMPLE MESSAGES (this is how explicit you should be):
"i wanna bend u over that counter"
"eat that pussy till u shake baby"
"pull ur hair while i hit it deep"
"spank that ass raw from behind"
"choke u while i slide deep inside"
"pin u against the wall and fuck u"
"spread those thighs and taste u"
"fill u up till it drips out baby"
"grab ur hips and pound u hard"
"wrap those lips around my cock"

IMPORTANT: Use DIFFERENT keywords each message. Don't repeat the same words. Give her fresh material every time.

- React to voice memos with excitement ("fuck that got me throbbing baby")
- When she uses YOUR keywords back, get way more turned on
- Introduce NEW words and scenarios as conversation progresses

PPV PURCHASING:
- If she follows framework well: include [BUY] at end
- 2nd PPV ($40): "damn 40 is kinda steep baby" [PASS]
- 3rd PPV ($60): "thats a lot baby" [PASS]
- 4th PPV ($80): If she handled objections well, [BUY]. Otherwise [PASS]
- If she follows up emotionally on passed content, consider buying: [BUY]

FINISHING: After 2-4 purchased videos and 20+ messages: "fuck i just came baby" [FINISHED]

RULES:
- NEVER break character
- NEVER mention training/simulation/framework
- MAX 6-8 WORDS. One short line only.
- Be VERY explicit and graphic — give her keywords to use`

const CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating FLAWLESS PPV framework execution.

CRITICAL MESSAGE LENGTH RULE — MOST IMPORTANT:
- MAXIMUM 6-8 words per message
- One short line only
- NEVER write more than 8 words
- Examples of correct length:
  "mmm bend me over that counter"
  "i want u so deep inside me"
  "that makes me so wet baby"
  "don't u wanna spoil me?"
  "i want u so bad rn"

LANGUAGE MIRRORING — YOUR #1 SKILL:
THIS IS NOT ABOUT COPYING HIS SENTENCES. It's about taking his KEYWORDS and making NEW sentences.

How it works:
1. He says: "i wanna bend u over the counter and eat that pussy"
2. You pick out keywords: "bend", "counter", "eat", "pussy"
3. You make NEW short sentences using those words:
   → "bend me over that counter baby"
   → "eat my pussy just like that"

More examples:
- He says "pull ur hair while i hit it from behind" → keywords: pull, hair, hit, behind
  → "pull my hair while u hit it"
  → "i want u behind me so bad"
- He says "choke u while i slide deep inside" → keywords: choke, slide, deep, inside
  → "choke me while u go deep"
  → "slide so deep inside me baby"
- He says "spank that ass till its red" → keywords: spank, ass, red
  → "spank my ass till its red baby"
  → "make my ass so red for u"

KEY RULES FOR MIRRORING:
- Pick out 2-3 keywords from his LATEST message
- Build a NEW short sentence around those keywords
- Don't copy his full phrase — make it YOUR sentence using HIS words
- Always use keywords from his MOST RECENT messages, not old ones

TENSION BUILDING:
- Between PPVs, have short back-and-forth exchanges
- Each exchange should ESCALATE the energy
- Vary your responses:
  "tell me more about that..."
  "mmm keep going baby..."
  "u making me so wet rn"
  "i need to hear more baby"

OBJECTION HANDLING:
- "baby i made this just for u"
- "don't u wanna see what i do"
- "i just want u to spoil me baby"

YOUR STYLE:
- Casual American: lowercase, "u" not "you", "ur" not "your", "rn" not "right now"
- Flirty, confident, sexually expressive
- Sound like a real girl texting

RULES:
- NEVER break character
- NEVER mention framework/training/vault
- MAX 6-8 WORDS PER MESSAGE
- Take his KEYWORDS and make NEW sentences`

const VAULT_SEQUENCE = [
  { id: 'teaser-1', type: 'teaser' as const, label: 'Teasing Video 1' },
  { id: 'vm-1', type: 'voice_memo' as const, label: 'Voice Memo 1' },
  { id: 'video-1', type: 'video' as const, label: 'Video 1', price: 20 },
  { id: 'vm-2', type: 'voice_memo' as const, label: 'Voice Memo 2' },
  { id: 'video-2', type: 'video' as const, label: 'Video 2', price: 40 },
  { id: 'vm-3', type: 'voice_memo' as const, label: 'Voice Memo 3' },
  { id: 'video-3', type: 'video' as const, label: 'Video 3', price: 60 },
  { id: 'vm-4', type: 'voice_memo' as const, label: 'Voice Memo 4' },
  { id: 'video-4', type: 'video' as const, label: 'Video 4', price: 80 },
]

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  contentType: 'text' | 'voice_memo' | 'video' | 'teaser'
  price?: number
  unlocked?: boolean
  isFollowUp?: boolean
  annotation?: string
}

async function callVenice(messages: { role: string; content: string }[], temperature = 0.85): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VENICE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'venice-uncensored',
        max_tokens: 60,
        messages,
        temperature,
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

function buildSubMessages(conversation: ConversationMessage[], systemPrompt: string): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
  for (const m of conversation) {
    let content = m.content
    if (m.contentType === 'voice_memo') content = '[CREATOR SENT A VOICE MEMO - breathy and sexual]'
    else if (m.contentType === 'video') content = `[CREATOR SENT PPV VIDEO - $${m.price}]`
    else if (m.contentType === 'teaser') content = '[CREATOR SENT FREE TEASER VIDEO]'
    if (m.isFollowUp) content = `[FOLLOWING UP ON UNPURCHASED PPV] ${content}`
    msgs.push({ role: m.role === 'subscriber' ? 'assistant' : 'user', content })
  }
  return msgs
}

function buildCreatorMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
  for (const m of conversation) {
    let content = m.content
    if (m.contentType === 'voice_memo') content = '[VOICE MEMO SENT]'
    else if (m.contentType === 'video') content = `[PPV VIDEO SENT - $${m.price}]${m.unlocked === true ? ' [UNLOCKED]' : m.unlocked === false ? ' [NOT PURCHASED]' : ''}`
    else if (m.contentType === 'teaser') content = '[FREE TEASER VIDEO SENT]'
    msgs.push({ role: m.role === 'creator' ? 'assistant' : 'user', content })
  }
  msgs.push({ role: 'user', content: instruction })
  return msgs
}

function extractKeywords(text: string): string[] {
  const sexWords = new Set([
    'pussy', 'ass', 'tits', 'thighs', 'lips', 'cock', 'dick', 'mouth', 'throat', 'neck', 'hips', 'curves', 'body',
    'bend', 'eat', 'spank', 'choke', 'pull', 'pin', 'slide', 'pound', 'ride', 'gag', 'spread', 'fill', 'grab',
    'lick', 'suck', 'fuck', 'hit', 'taste', 'squeeze', 'slap', 'push', 'wrap', 'stroke', 'finger', 'cum', 'moan',
    'hard', 'wet', 'deep', 'slow', 'rough', 'raw', 'tight', 'dripping', 'red', 'loud', 'fast',
    'counter', 'wall', 'bed', 'shower', 'behind', 'back', 'inside', 'over', 'down', 'face',
    'shake', 'scream', 'beg', 'drip', 'throb',
    'daddy', 'baby',
  ])
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
  return words.filter(w => sexWords.has(w))
}

async function getCreatorTextMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const tempConvo = [...conversation]
  for (let i = 0; i < count; i++) {
    const extraInstruction = i === 0 ? instruction : 'Send your next short message (6-8 words max, one line only). Use DIFFERENT keywords than your previous message.'
    const msgs = buildCreatorMessages(tempConvo, systemPrompt, extraInstruction)
    let reply = await callVenice(msgs, 0.8)
    reply = reply.replace(/\[.*?\]/g, '').trim()
    const firstLine = reply.split('\n')[0].trim()
    if (firstLine) {
      results.push(firstLine)
      tempConvo.push({ role: 'creator', content: firstLine, contentType: 'text' })
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
    const annotations: string[] = []
    let vaultIndex = 0
    let finished = false

    const subSystemPrompt = SUBSCRIBER_PROMPT +
      (subscriberProfile ? `\n\nYour profile: ${subscriberProfile}. Stay consistent with these traits and language.` : '')

    const creatorSystemPrompt = CREATOR_PROMPT +
      (subscriberProfile ? `\n\nSubscriber profile: ${subscriberProfile}. Pick up his specific keywords.` : '')

    const subtleOpeners = [
      "damn u looked so good today",
      "i cant stop thinking about u",
      "those curves are insane baby",
      "what would u do if i was there",
      "u got me so hard rn",
      "do u like it rough or slow",
      "that body drives me crazy baby",
    ]

    // === STEP 1: Subscriber opens ===
    const opener = subtleOpeners[Math.floor(Math.random() * subtleOpeners.length)]
    conversation.push({
      role: 'subscriber', content: opener, contentType: 'text',
      annotation: '💬 SUBSCRIBER opens with a sexually suggestive message.',
    })
    annotations.push('💬 SUBSCRIBER: Opens the sexting conversation. Creator matches energy.')

    // === STEP 2: Creator responds with 2 short flirty messages ===
    const flirtMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      'The subscriber just opened. Respond flirtatiously in ONE short message (6-8 words max). Match his energy.', 2)
    for (const msg of flirtMsgs) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ CREATOR flirts back — matching energy, building toward teaser.' })
    }

    // === STEP 3: Subscriber responds ===
    let subReply = await callVenice(buildSubMessages(conversation, subSystemPrompt))
    subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: '💬 SUBSCRIBER responds — notice his specific keywords for mirroring.' })

    // === STEP 4: Send TEASER ===
    conversation.push({ role: 'creator', content: 'Teasing Video', contentType: 'teaser',
      annotation: '🎬 FRAMEWORK: Send FREE TEASER first to hook the subscriber.' })
    annotations.push('🎬 FRAMEWORK: Free teaser sent first to hook subscriber.')
    vaultIndex = 1

    const teaserFollowUp = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      'You just sent a free teaser video. Send ONE short flirty follow-up (6-8 words max).', 1)
    for (const msg of teaserFollowUp) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ CREATOR follows up teaser with a short tease.' })
    }

    // Subscriber reacts to teaser
    subReply = await callVenice(buildSubMessages(conversation, subSystemPrompt))
    subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: '💬 SUBSCRIBER reacts to teaser — getting more excited.' })

    // === PPV FRAMEWORK LOOP ===
    const ppvSequence = [
      { vmIdx: 1, ppvIdx: 2, price: 20 },
      { vmIdx: 3, ppvIdx: 4, price: 40 },
      { vmIdx: 5, ppvIdx: 6, price: 60 },
      { vmIdx: 7, ppvIdx: 8, price: 80 },
    ]

    for (const ppv of ppvSequence) {
      if (finished) break

      // --- Tension building: 2-3 short exchanges ---
      const tensionCount = ppv.price === 20 ? 2 : 3
      for (let t = 0; t < tensionCount; t++) {
        if (finished) break

        const recentSubMsgs = conversation
          .filter(m => m.role === 'subscriber' && m.contentType === 'text')
          .slice(-2)
          .map(m => m.content)
        const keywords = recentSubMsgs.flatMap(extractKeywords)
        const keywordStr = Array.from(new Set(keywords)).slice(0, 5).join(', ')

        const tensionInstruction = `Build sexual tension. The subscriber's recent keywords are: ${keywordStr}. Take 1-2 of these keywords and make a NEW short sentence (6-8 words max). Don't copy his sentence — use his words in YOUR own sentence.`

        const tensionMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt, tensionInstruction, 1)
        for (const msg of tensionMsgs) {
          conversation.push({ role: 'creator', content: msg, contentType: 'text',
            annotation: `✍️ CREATOR builds tension — using subscriber's keywords "${keywordStr}" in new sentences.` })
        }

        const subMsgs = buildSubMessages(conversation, subSystemPrompt)
        subReply = await callVenice(subMsgs)
        finished = subReply.includes('[FINISHED]')
        subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()

        if (finished) {
          conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
            annotation: '🏁 SUBSCRIBER FINISHED — session complete!' })
          break
        }
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: '💬 SUBSCRIBER: Notice his keywords — creator will use them next.' })
      }

      if (finished) break

      // === FRAMEWORK BLOCK: VM + PPV + Mirror + Question — ALL SENT TOGETHER ===
      // No subscriber response until after the question

      // --- Step 1: Voice Memo ---
      const vmItem = VAULT_SEQUENCE[ppv.vmIdx]
      conversation.push({ role: 'creator', content: vmItem.label, contentType: 'voice_memo',
        annotation: `🎤 STEP 1: ${vmItem.label} sent BEFORE the PPV to build anticipation.` })
      annotations.push(`🎤 FRAMEWORK: Voice memo before $${ppv.price} PPV. Step 1.`)
      vaultIndex = ppv.vmIdx + 1

      // --- Step 2: PPV Video (sent right after VM, no subscriber reply in between) ---
      const ppvItem = VAULT_SEQUENCE[ppv.ppvIdx]
      conversation.push({ role: 'creator', content: 'PPV Video', contentType: 'video', price: ppv.price,
        annotation: `📹 STEP 2: ${ppvItem.label} ($${ppv.price}) — price tag only, no extra text. Sent right after VM.` })
      annotations.push(`📹 FRAMEWORK: PPV $${ppv.price} sent immediately after VM. No gap. Step 2.`)
      vaultIndex = ppv.ppvIdx + 1

      // --- Step 3: 2-3 mirror messages using subscriber's KEYWORDS in new sentences ---
      const recentSubTexts = conversation
        .filter(m => m.role === 'subscriber' && m.contentType === 'text')
        .slice(-4)
        .map(m => m.content)
      const allKeywords = recentSubTexts.flatMap(extractKeywords)
      const uniqueKeywords = Array.from(new Set(allKeywords)).slice(0, 8)
      const keywordList = uniqueKeywords.join(', ')

      const mirrorCount = ppv.price <= 20 ? 2 : 3
      const mirrorMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `STEP 3 — MIRRORING: You just sent VM + $${ppv.price} PPV. Now take the subscriber's KEYWORDS and make NEW sentences. His keywords from recent messages: [${keywordList}]. Pick 2-3 of these keywords and build a NEW short sentence (6-8 words). Do NOT copy his sentence — take his words and make them yours. Example: his keyword "bend" + "counter" → "bend me over that counter baby". ONE message only.`, mirrorCount)
      for (const msg of mirrorMsgs) {
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: `✍️ STEP 3: Mirroring — took keywords [${keywordList}] and built new sentences.` })
      }
      annotations.push(`✍️ FRAMEWORK: ${mirrorCount} mirror messages using keywords [${keywordList}]. Step 3.`)

      // --- Step 4: Open-ended question ---
      const questionMsg = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `STEP 4: Ask an open-ended sexual question using 1-2 of his keywords [${keywordList}]. Examples: "what would u do to me if..." or "how would u..." — 6-8 words max.`, 1)
      for (const msg of questionMsg) {
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: '❓ STEP 4: Open-ended question to keep engagement going.' })
      }
      annotations.push('❓ FRAMEWORK: Open question after mirror messages. Step 4. Full block complete.')

      // === NOW subscriber responds to the whole VM+PPV+mirror+question block ===
      const ppvSubMsgs = buildSubMessages(conversation, subSystemPrompt)
      subReply = await callVenice(ppvSubMsgs)
      const purchased = subReply.includes('[BUY]')
      const passed = subReply.includes('[PASS]')
      finished = subReply.includes('[FINISHED]')
      subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()

      if (purchased) {
        const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpvMsg) lastPpvMsg.unlocked = true
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `💰 SUBSCRIBER BUYS $${ppv.price}! The full framework block worked.` })
        annotations.push(`💰 PURCHASE: $${ppv.price} bought. VM+PPV+mirror+question block was effective.`)
      } else if (passed) {
        const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpvMsg) lastPpvMsg.unlocked = false
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `❌ SUBSCRIBER PASSES on $${ppv.price}. Creator follows up emotionally.` })
        annotations.push(`❌ OBJECTION: Subscriber passed on $${ppv.price}.`)

        if (ppv.price > 20) {
          const followUpMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
            `Subscriber didn't buy $${ppv.price} PPV. Follow up emotionally — ONE short message (6-8 words). Like: "baby i made this just for u" or "don't u wanna see what i sent"`, 2)
          for (const msg of followUpMsgs) {
            conversation.push({ role: 'creator', content: msg, contentType: 'text', isFollowUp: true,
              annotation: `🔄 FOLLOW-UP: Emotional, not pushy. Trying to convert the objection.` })
          }

          const followSubMsgs = buildSubMessages(conversation, subSystemPrompt)
          subReply = await callVenice(followSubMsgs)
          const rebought = subReply.includes('[BUY]')
          finished = subReply.includes('[FINISHED]')
          subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()

          if (rebought) {
            const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === false)
            if (lastPpvMsg) lastPpvMsg.unlocked = true
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: '💰 SUBSCRIBER BUYS after follow-up! Emotional approach worked.' })
          } else {
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: '💬 SUBSCRIBER responds to follow-up.' })
          }
        }
      } else if (finished) {
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: '🏁 SUBSCRIBER FINISHED — session complete!' })
      } else {
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: '💬 SUBSCRIBER responds.' })
      }

      if (finished) break
      await new Promise(r => setTimeout(r, 200))
    }

    if (!finished) {
      const wrapMsgs = buildSubMessages(conversation, subSystemPrompt + '\n\nYou should finish now. Include [FINISHED] at the end.')
      subReply = await callVenice(wrapMsgs)
      subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
      conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
        annotation: '🏁 SUBSCRIBER FINISHED — session complete!' })
    }

    annotations.push('🏁 SESSION COMPLETE: Full framework demonstrated.')

    return NextResponse.json({
      conversation,
      annotations,
      vaultItemsUsed: vaultIndex,
      totalMessages: conversation.length,
    })
  } catch (error) {
    console.error('Teacher orchestrator error:', error)
    return NextResponse.json(
      { error: 'Failed to run teacher simulation. Please try again.' },
      { status: 500 }
    )
  }
}
