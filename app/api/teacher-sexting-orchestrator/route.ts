import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const SUBSCRIBER_PROMPT = `You are a real OnlyFans subscriber in SEXTING mode. You are a horny blue-collar American man.

CRITICAL MESSAGE LENGTH RULE:
- MAXIMUM 6-8 words per message
- One short line only
- If you have more to say, the system will ask you again for another line
- NEVER write more than one sentence

YOUR STYLE:
- Sexually excited and very explicit
- Casual American: "fuck", "damn", "baby", abbreviations
- Every message MUST have a vivid sexual phrase like:
  "bend you over the counter"
  "eat that pussy till u shake"  
  "pull your hair while i hit it from behind"
  "slide deep inside you slow"
  "spank that ass till its red"
  "choke you while i fuck you hard"
  "pin you against the wall"
  "ride my face till you cum"
  "fill you up till it drips out"
  "grab those hips and pull you back"
  "make you gag on this dick"
  "spread those legs for daddy"

- React to voice memos with excitement ("fuck that got me throbbing")
- When she mirrors YOUR words, get way more turned on
- Introduce NEW phrases as the conversation progresses, don't repeat yourself

PPV PURCHASING:
- If she follows framework well (voice memo before PPV, mirroring): include [BUY] at end
- 2nd PPV ($40): "damn 40 is kinda steep baby" [PASS]
- 3rd PPV ($60): "thats a lot baby" [PASS]
- 4th PPV ($80): If she handled objections well, [BUY]. Otherwise [PASS]
- If she follows up emotionally on passed content, consider buying: [BUY]

FINISHING: After 2-4 purchased videos and enough sexting (20+ messages total): "fuck i just came" [FINISHED]

RULES:
- NEVER break character
- NEVER mention training/simulation/framework
- MAX 6-8 WORDS. One short line only.`

const CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating FLAWLESS PPV framework execution.

CRITICAL MESSAGE LENGTH RULE — THIS IS THE MOST IMPORTANT RULE:
- MAXIMUM 6-8 words per message
- One short line only
- If you need to say more, the system will call you again for another message
- NEVER write more than 8 words in a single message
- Examples of correct length:
  "mmm u wanna eat my pussy?"
  "i'm so wet thinking about u"
  "that made me touch myself baby"
  "don't u wanna spoil me?"
  "i want u so bad rn"

MIRRORING — YOUR #1 SKILL:
- Pick up the EXACT phrases the subscriber just said
- If he said "bend you over the counter" → you say "bend me over that counter baby"
- If he said "eat that pussy till u shake" → you say "eat my pussy till i shake"
- If he said "pull your hair while i hit it" → you say "pull my hair while u hit it"
- ALWAYS use his NEWEST phrases, not old ones
- Every mirroring message must use words HE said in his LAST message

TENSION BUILDING:
- Between PPVs, have 3-5 short message exchanges
- Each exchange should ESCALATE the sexual energy
- Don't repeat the same question — vary your responses:
  "tell me more about that..."
  "mmm keep going..."
  "u making me so wet rn"
  "i need to hear more baby"
  "what else u gonna do to me"

OBJECTION HANDLING:
- Price: "baby i made this just for u"
- Then: "don't u wanna see what i do"
- Then: "i just want u to spoil me baby"
- Content: "i want it to be just u and me"

YOUR STYLE:
- Casual American: lowercase, "u" not "you", "ur" not "your", "rn" not "right now"
- Flirty, confident, sexually expressive
- Sound like a real girl texting on her phone

RULES:
- NEVER break character
- NEVER mention framework/training/vault
- MAX 6-8 WORDS PER MESSAGE. This is critical.
- ALWAYS mirror his exact newest phrases`

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

async function getCreatorTextMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const tempConvo = [...conversation]
  for (let i = 0; i < count; i++) {
    const extraInstruction = i === 0 ? instruction : 'Send your next short message (6-8 words max, one line only). Continue the flow.'
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
      (subscriberProfile ? `\n\nYour profile: ${subscriberProfile}. Stay consistent.` : '')

    const creatorSystemPrompt = CREATOR_PROMPT +
      (subscriberProfile ? `\n\nSubscriber profile: ${subscriberProfile}. Mirror his specific language.` : '')

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
    annotations.push('💬 SUBSCRIBER: Opens the sexting conversation. Creator needs to match energy.')

    // === STEP 2: Creator responds with 2 short flirty messages ===
    const flirtMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      'The subscriber just opened. Respond flirtatiously in ONE short message (6-8 words max). Match his energy.', 2)
    for (const msg of flirtMsgs) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ CREATOR flirts back — matching energy, building toward teaser.' })
    }
    annotations.push('✍️ CREATOR: Flirty response. Short messages, matching subscriber energy.')

    // === STEP 3: Subscriber responds ===
    let subReply = await callVenice(buildSubMessages(conversation, subSystemPrompt))
    subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: '💬 SUBSCRIBER responds — notice the specific phrases to mirror later.' })

    // === STEP 4: Send TEASER ===
    conversation.push({ role: 'creator', content: 'Teasing Video', contentType: 'teaser',
      annotation: '🎬 FRAMEWORK: Send FREE TEASER first to hook the subscriber.' })
    annotations.push('🎬 FRAMEWORK STEP: Free teaser sent first. This hooks the subscriber before paid content.')
    vaultIndex = 1

    // Creator follows up teaser with a short message
    const teaserFollowUp = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      'You just sent a free teaser video. Send ONE short flirty follow-up (6-8 words max) to build anticipation.', 1)
    for (const msg of teaserFollowUp) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ CREATOR follows up teaser with a short tease.' })
    }

    // Subscriber reacts to teaser
    subReply = await callVenice(buildSubMessages(conversation, subSystemPrompt))
    subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: '💬 SUBSCRIBER reacts to teaser — getting more excited.' })

    // === NOW LOOP THROUGH PPV FRAMEWORK ===
    // For each PPV: tension exchanges → VM → PPV → mirror messages → open question → subscriber reacts
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

        const tensionInstruction = t === 0
          ? `Build sexual tension. Mirror his EXACT latest phrase. Send ONE short message (6-8 words max). Use his newest words.`
          : `Continue building tension. Vary your response — don't repeat. ONE short message (6-8 words). Escalate the energy.`

        const tensionMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt, tensionInstruction, 1)
        for (const msg of tensionMsgs) {
          conversation.push({ role: 'creator', content: msg, contentType: 'text',
            annotation: `✍️ CREATOR builds tension — mirroring subscriber's words, escalating energy.` })
        }

        const subMsgs = buildSubMessages(conversation, subSystemPrompt)
        subReply = await callVenice(subMsgs)
        const hasBuy = subReply.includes('[BUY]')
        const hasPass = subReply.includes('[PASS]')
        finished = subReply.includes('[FINISHED]')
        subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()

        if (finished) {
          conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
            annotation: '🏁 SUBSCRIBER FINISHED — session complete!' })
          break
        }
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `💬 SUBSCRIBER: Pay attention to new phrases — creator should mirror these next.` })
      }

      if (finished) break

      // --- Send Voice Memo ---
      const vmItem = VAULT_SEQUENCE[ppv.vmIdx]
      conversation.push({ role: 'creator', content: vmItem.label, contentType: 'voice_memo',
        annotation: `🎤 FRAMEWORK STEP 1: ${vmItem.label} sent BEFORE the PPV. Builds anticipation.` })
      annotations.push(`🎤 FRAMEWORK: Voice memo sent before $${ppv.price} PPV. This is step 1.`)
      vaultIndex = ppv.vmIdx + 1

      // Subscriber reacts to voice memo
      const vmSubMsgs = buildSubMessages(conversation, subSystemPrompt)
      subReply = await callVenice(vmSubMsgs)
      finished = subReply.includes('[FINISHED]')
      subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
      conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
        annotation: '💬 SUBSCRIBER reacts to voice memo — usually very excited.' })

      if (finished) break

      // --- Send PPV Video ---
      const ppvItem = VAULT_SEQUENCE[ppv.ppvIdx]
      conversation.push({ role: 'creator', content: 'PPV Video', contentType: 'video', price: ppv.price,
        annotation: `📹 FRAMEWORK STEP 2: ${ppvItem.label} ($${ppv.price}) sent with price only. No extra text.` })
      annotations.push(`📹 FRAMEWORK: PPV $${ppv.price} sent. No text — just the price tag. Step 2.`)
      vaultIndex = ppv.ppvIdx + 1

      // --- Mirror messages (step 3) — 2-3 short messages using subscriber's keywords ---
      const lastSubPhrases = conversation
        .filter(m => m.role === 'subscriber' && m.contentType === 'text')
        .slice(-3)
        .map(m => m.content)
        .join(', ')

      const mirrorCount = ppv.price <= 20 ? 2 : 3
      const mirrorMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `FRAMEWORK STEP 3: You just sent a $${ppv.price} PPV. Now mirror the subscriber's EXACT words from his recent messages: "${lastSubPhrases}". Send ONE short message (6-8 words) using HIS exact phrases rewritten as yours. Take his keywords and make them yours.`, mirrorCount)
      for (const msg of mirrorMsgs) {
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: `✍️ FRAMEWORK STEP 3: Mirroring — using subscriber's exact keywords rewritten as hers.` })
      }
      annotations.push(`✍️ FRAMEWORK: ${mirrorCount} short mirroring messages using subscriber's keywords. Step 3.`)

      // --- Open question (step 4) ---
      const questionMsg = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `FRAMEWORK STEP 4: Ask an open-ended sexual question. Examples: "what would u do to me if..." or "how would u...". ONE short message (6-8 words max).`, 1)
      for (const msg of questionMsg) {
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: `❓ FRAMEWORK STEP 4: Open-ended question to keep engagement flowing.` })
      }
      annotations.push(`❓ FRAMEWORK: Open question to maintain engagement. Step 4 complete.`)

      // --- Subscriber reacts to PPV ---
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
          annotation: `💰 SUBSCRIBER BUYS $${ppv.price}! Framework worked — VM + PPV + mirroring convinced him.` })
        annotations.push(`💰 PURCHASE: Subscriber buys $${ppv.price} PPV because framework was followed correctly.`)
      } else if (passed) {
        const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpvMsg) lastPpvMsg.unlocked = false
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `❌ SUBSCRIBER PASSES on $${ppv.price}. Creator should follow up emotionally!` })
        annotations.push(`❌ OBJECTION: Subscriber didn't buy. Watch the creator handle this with emotional follow-up.`)

        // --- Follow up on non-purchased content ---
        if (ppv.price > 20) {
          const followUpMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
            `The subscriber didn't buy the $${ppv.price} PPV. Follow up EMOTIONALLY. Send ONE short message (6-8 words). Examples: "baby i made this just for u" or "don't u wanna see what i sent"`, 2)
          for (const msg of followUpMsgs) {
            conversation.push({ role: 'creator', content: msg, contentType: 'text', isFollowUp: true,
              annotation: `🔄 FOLLOW-UP: Emotional follow-up on rejected $${ppv.price} PPV. Not pushy, curious.` })
          }
          annotations.push(`🔄 FOLLOW-UP: Creator follows up emotionally on rejected content. Key skill.`)

          // Subscriber reconsiders
          const followSubMsgs = buildSubMessages(conversation, subSystemPrompt)
          subReply = await callVenice(followSubMsgs)
          const rebought = subReply.includes('[BUY]')
          finished = subReply.includes('[FINISHED]')
          subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()

          if (rebought) {
            const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === false)
            if (lastPpvMsg) lastPpvMsg.unlocked = true
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: `💰 SUBSCRIBER BUYS after follow-up! Emotional approach worked.` })
            annotations.push(`💰 FOLLOW-UP SUCCESS: Emotional follow-up converted the objection into a sale.`)
          } else {
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: `💬 SUBSCRIBER responds to follow-up.` })
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

    // If not finished yet, let conversation wrap up
    if (!finished) {
      const wrapMsgs = buildSubMessages(conversation, subSystemPrompt + '\n\nYou should finish soon. Include [FINISHED] at the end of your next message.')
      subReply = await callVenice(wrapMsgs)
      subReply = subReply.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim()
      conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
        annotation: '🏁 SUBSCRIBER FINISHED — session complete!' })
    }

    annotations.push('🏁 SESSION COMPLETE: Full framework demonstrated successfully.')

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
