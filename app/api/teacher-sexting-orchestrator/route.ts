import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const SUBSCRIBER_PROMPT = `You are a horny blue-collar American guy chatting with a hot girl on OnlyFans. You're having a REAL back-and-forth sexting conversation.

MESSAGE LENGTH: Max 6-8 words. One short line only.

HOW TO HAVE A REAL CONVERSATION:
- ALWAYS respond to what SHE just said. React to her specific words.
- If she says "mmm i love when u talk like that" → respond to THAT: "wait till i get my hands on u"
- If she teases you → get more excited and tell her what you'd do
- If she asks a question → ANSWER it with something hot
- If she sends a voice memo → react to it: "fuck that moan got me so hard"
- Build on what she says, don't just throw random stuff

YOUR PERSONALITY:
- Confident, direct, sexually descriptive
- You paint specific pictures: "pin u against the wall", "bend u over the kitchen counter"
- You use vivid action words: bend, pin, choke, pull, spank, slide, pound, taste, lick, spread
- You mention body parts naturally: pussy, ass, thighs, hips, lips, throat
- Casual American texting: "u", "ur", no capitals, slang

CONVERSATION FLOW:
- Start flirty, get progressively more explicit
- Each message should be a natural response to her last message
- Introduce NEW scenarios and actions — don't repeat yourself
- When she uses YOUR words back at you, notice it and get way more turned on

PPV PURCHASING:
- 1st PPV ($20): Buy if she's been engaging well [BUY]
- 2nd PPV ($40): "damn 40 is steep tho baby" [PASS]
- 3rd PPV ($60): "thats a lot for a vid baby" [PASS]
- 4th PPV ($80): If she handled your objections well, [BUY]. Otherwise [PASS]
- If she follows up sweetly on passed content: [BUY]

FINISHING: After 2+ purchased videos and good sexting: "fuck baby i just came so hard" [FINISHED]

RULES:
- MAX 6-8 words, one line
- ALWAYS react to her last message
- Never break character
- Never mention training/simulation
- NEVER use periods (.) — no dots at the end of messages
- Question marks (?) are fine when asking something`

const CREATOR_PROMPT = `You are a hot OnlyFans girl having a REAL sexting conversation with a subscriber. You're flirty, confident, and you know how to keep a man engaged.

MESSAGE LENGTH: Max 6-8 words. One short line only.

HOW TO HAVE A REAL CONVERSATION:
- ALWAYS respond to what HE just said. This is a real back-and-forth.
- If he says "i wanna pin u against the wall" → react to THAT: "pin me against that wall baby" or "mmm i love being pinned down"
- If he says "god ur body is insane" → tease him: "u haven't even seen the best part"
- If he describes something → respond to his scenario, don't change the subject

KEYWORD MIRRORING (do this NATURALLY within conversation):
- When he uses a hot word (like "bend", "choke", "spank", "throat"), pick it up and use it in YOUR response
- This should feel natural, like you're both building the same fantasy together
- He says "i wanna bend u over the counter" → "bend me over it right now"
- He says "spread those thighs for me" → "come spread them yourself baby"
- He says "choke u while i slide inside" → "mmm choke me while u do it"
- DON'T just randomly combine his keywords into a sentence. RESPOND to what he said using his words.

WHAT NOT TO DO:
- DON'T ignore what he said and write something random
- DON'T just shuffle his keywords into a generic template
- DON'T repeat the same sentence structure over and over
- DON'T call him "daddy" unless he uses it first
- DON'T copy his entire sentence — respond to it using his key words

VARY YOUR RESPONSES — mix these styles:
- Reacting: "mmm that sounds so hot baby"
- Teasing: "u think u can handle all this?"
- Wanting: "i need u inside me so bad"
- Mirroring: "choke me just like that baby"
- Asking: "what would u do to me first?"
- Begging: "please don't stop talking to me"

OBJECTION HANDLING (when he won't buy PPV):
- "baby i made this just for u"
- "u don't wanna see what i do?"
- "i just want u to spoil me baby"

YOUR STYLE:
- Casual American girl texting: lowercase, "u", "ur", "rn", "omg"
- Confident and sexually expressive
- Sound like a real girl, not a bot

RULES:
- MAX 6-8 words per message
- ALWAYS respond to what he actually said
- Never break character
- Never mention framework/training/vault
- NEVER use periods (.) — no dots at the end of messages
- Question marks (?) are fine when asking something`

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
    if (m.contentType === 'voice_memo') content = '[She sent a breathy voice memo moaning and describing what she wants to do to you]'
    else if (m.contentType === 'video') content = `[She sent a PPV video for $${m.price}]`
    else if (m.contentType === 'teaser') content = '[She sent a free teaser video — sexy but not full content]'
    if (m.isFollowUp) content = `[She's following up on the PPV you didn't buy] ${content}`
    msgs.push({ role: m.role === 'subscriber' ? 'assistant' : 'user', content })
  }
  return msgs
}

function buildCreatorMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = [{ role: 'system', content: systemPrompt }]
  for (const m of conversation) {
    let content = m.content
    if (m.contentType === 'voice_memo') content = '[You sent a voice memo]'
    else if (m.contentType === 'video') content = `[You sent PPV video — $${m.price}]${m.unlocked === true ? ' [He bought it!]' : m.unlocked === false ? ' [He didn\'t buy]' : ''}`
    else if (m.contentType === 'teaser') content = '[You sent a free teaser video]'
    msgs.push({ role: m.role === 'creator' ? 'assistant' : 'user', content })
  }
  msgs.push({ role: 'user', content: instruction })
  return msgs
}

function getLastSubMessage(conversation: ConversationMessage[]): string {
  const lastSub = [...conversation].reverse().find(m => m.role === 'subscriber' && m.contentType === 'text')
  return lastSub ? lastSub.content : ''
}

function findKeywordsInMessage(text: string): string[] {
  const hotWords = new Set([
    'pussy', 'ass', 'tits', 'thighs', 'lips', 'cock', 'dick', 'mouth', 'throat', 'neck', 'hips', 'body',
    'bend', 'eat', 'spank', 'choke', 'pull', 'pin', 'slide', 'pound', 'ride', 'gag', 'spread', 'fill', 'grab',
    'lick', 'suck', 'fuck', 'hit', 'taste', 'squeeze', 'slap', 'push', 'wrap', 'stroke', 'finger', 'cum',
    'hard', 'wet', 'deep', 'slow', 'rough', 'raw', 'tight', 'dripping', 'red', 'fast',
    'counter', 'wall', 'bed', 'shower', 'behind', 'back', 'inside', 'over', 'down', 'face',
    'shake', 'scream', 'beg', 'drip', 'throb', 'moan',
  ])
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
  return words.filter(w => hotWords.has(w))
}

function findUsedKeywords(subMessage: string, creatorReply: string): string[] {
  const subKeys = findKeywordsInMessage(subMessage)
  const replyLower = creatorReply.toLowerCase()
  return subKeys.filter(k => replyLower.includes(k))
}

async function getCreatorTextMessages(conversation: ConversationMessage[], systemPrompt: string, instruction: string, count: number): Promise<string[]> {
  const results: string[] = []
  const tempConvo = [...conversation]
  for (let i = 0; i < count; i++) {
    const lastSubMsg = getLastSubMessage(tempConvo)
    const extraInstruction = i === 0
      ? instruction
      : `Continue the conversation naturally. His last message was: "${lastSubMsg}". Send ONE more short response (6-8 words). Don't repeat what you already said — say something new that builds on the conversation.`
    const msgs = buildCreatorMessages(tempConvo, systemPrompt, extraInstruction)
    let reply = await callVenice(msgs, 0.85)
    reply = reply.replace(/\[.*?\]/g, '').trim()
    let firstLine = reply.split('\n')[0].trim()
    firstLine = firstLine.replace(/\.+$/g, '')
    if (firstLine) {
      results.push(firstLine)
      tempConvo.push({ role: 'creator', content: firstLine, contentType: 'text' })
    }
  }
  return results
}

function cleanReply(raw: string): string {
  return raw.replace(/\[.*?\]/g, '').trim().split('\n')[0].trim().replace(/\.+$/g, '')
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
      (subscriberProfile ? `\n\nYour profile: ${subscriberProfile}. Stay in character.` : '')

    const creatorSystemPrompt = CREATOR_PROMPT +
      (subscriberProfile ? `\n\nSubscriber profile: ${subscriberProfile}. Adapt to his vibe.` : '')

    const subtleOpeners = [
      "damn u looked so good today",
      "i cant stop thinking about u",
      "those curves are insane baby",
      "what would u do if i was there",
      "u got me so hard rn baby",
      "do u like it rough or slow",
      "that body drives me crazy baby",
    ]

    // === STEP 1: Subscriber opens ===
    const opener = subtleOpeners[Math.floor(Math.random() * subtleOpeners.length)]
    conversation.push({
      role: 'subscriber', content: opener, contentType: 'text',
      annotation: '💬 Subscriber opens the conversation.',
    })
    annotations.push('💬 Subscriber opens. Creator should match his energy and flirt back.')

    // === STEP 2: Creator responds ===
    const flirtMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      `He just said: "${opener}". Respond to what he said — flirty and teasing. ONE short message (6-8 words max).`, 2)
    for (const msg of flirtMsgs) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ Creator responds — matching his energy, flirting back.' })
    }

    // === STEP 3: Subscriber responds to HER ===
    let subReply = cleanReply(await callVenice(buildSubMessages(conversation, subSystemPrompt)))
    const earlySubKeys = findKeywordsInMessage(subReply)
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: `💬 Subscriber responds. Keywords to pick up: [${earlySubKeys.slice(0, 4).join(', ') || 'none'}]` })

    // === STEP 4: Send TEASER ===
    conversation.push({ role: 'creator', content: 'Teasing Video', contentType: 'teaser',
      annotation: '🎬 FRAMEWORK: Free teaser sent to hook him before any paid content.' })
    annotations.push('🎬 Free teaser video sent first. Hooks the subscriber.')
    vaultIndex = 1

    const teaserFollowUp = await getCreatorTextMessages(conversation, creatorSystemPrompt,
      `You just sent him a free teaser video. Now tease him about it — what did he think? ONE message (6-8 words).`, 1)
    for (const msg of teaserFollowUp) {
      conversation.push({ role: 'creator', content: msg, contentType: 'text',
        annotation: '✍️ Creator teases after sending the preview.' })
    }

    subReply = cleanReply(await callVenice(buildSubMessages(conversation, subSystemPrompt)))
    const teaserSubKeys = findKeywordsInMessage(subReply)
    conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
      annotation: `💬 Subscriber reacts to teaser. Keywords to pick up: [${teaserSubKeys.slice(0, 4).join(', ') || 'none'}]` })

    // === PPV FRAMEWORK LOOP ===
    const ppvSequence = [
      { vmIdx: 1, ppvIdx: 2, price: 20 },
      { vmIdx: 3, ppvIdx: 4, price: 40 },
      { vmIdx: 5, ppvIdx: 6, price: 60 },
      { vmIdx: 7, ppvIdx: 8, price: 80 },
    ]

    for (const ppv of ppvSequence) {
      if (finished) break

      // --- Tension building: 2-3 real back-and-forth exchanges ---
      const tensionCount = ppv.price === 20 ? 2 : 3
      for (let t = 0; t < tensionCount; t++) {
        if (finished) break

        const lastSubMsg = getLastSubMessage(conversation)

        const isLastTension = t === tensionCount - 1
        const subKeywords = findKeywordsInMessage(lastSubMsg)
        const keywordPreview = subKeywords.slice(0, 4).join(', ')

        let tensionInstruction: string
        if (isLastTension) {
          tensionInstruction = `He just said: "${lastSubMsg}". Ask him a short open question about what he'd do to you. Use one of his words naturally. Keep it simple like: "what would u do next baby?" or "mmm and then what?" or "how would u do it baby?" or "u gonna show me how?" — ONE question (6-8 words max). Must end with ? No periods`
        } else if (t === 0) {
          tensionInstruction = `He just said: "${lastSubMsg}". React to what he said — show him you're into it. Pick up one of his words and use it in your response naturally. ONE message (6-8 words). No periods`
        } else {
          tensionInstruction = `He said: "${lastSubMsg}". Tease him or tell him what you want. Pick up a word he used and build on his fantasy. ONE message (6-8 words). No periods`
        }

        const tensionMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
          tensionInstruction, 1)
        for (const msg of tensionMsgs) {
          const usedKeys = findUsedKeywords(lastSubMsg, msg)
          const keyNote = usedKeys.length > 0
            ? `Picked up keyword${usedKeys.length > 1 ? 's' : ''} "${usedKeys.join(', ')}" from his message`
            : `Responding to his message`
          if (isLastTension) {
            conversation.push({ role: 'creator', content: msg, contentType: 'text',
              annotation: `❓ QUESTION to draw him out — ${keyNote}. His keywords were: [${keywordPreview}]. Asking a question keeps him talking and builds anticipation before the PPV block` })
          } else {
            conversation.push({ role: 'creator', content: msg, contentType: 'text',
              annotation: `✍️ ${keyNote}. His keywords were: [${keywordPreview}]. She responds to what he said and uses his language to build the same fantasy together` })
          }
        }

        const subMsgs = buildSubMessages(conversation, subSystemPrompt)
        const rawSub = await callVenice(subMsgs)
        finished = rawSub.includes('[FINISHED]')
        subReply = cleanReply(rawSub)

        if (finished) {
          conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
            annotation: '🏁 Subscriber finished — session complete!' })
          break
        }
        const newSubKeys = findKeywordsInMessage(subReply)
        const newKeyPreview = newSubKeys.slice(0, 4).join(', ')
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `💬 Subscriber responds. Keywords to pick up: [${newKeyPreview || 'none'}] — creator should use these in her next message` })
      }

      if (finished) break

      // === FRAMEWORK BLOCK: VM + PPV + Mirror + Question (all sent together) ===
      const lastSubMsg = getLastSubMessage(conversation)

      // --- Step 1: Voice Memo ---
      const vmItem = VAULT_SEQUENCE[ppv.vmIdx]
      conversation.push({ role: 'creator', content: vmItem.label, contentType: 'voice_memo',
        annotation: `🎤 STEP 1: Voice memo sent to build anticipation before PPV.` })
      annotations.push(`🎤 Voice memo before $${ppv.price} PPV.`)
      vaultIndex = ppv.vmIdx + 1

      // --- Step 2: PPV Video (right after VM) ---
      conversation.push({ role: 'creator', content: 'PPV Video', contentType: 'video', price: ppv.price,
        annotation: `📹 STEP 2: $${ppv.price} PPV sent right after voice memo. No text, just price.` })
      annotations.push(`📹 $${ppv.price} PPV sent immediately after voice memo.`)
      vaultIndex = ppv.ppvIdx + 1

      // --- Step 3: 2-3 mirror messages that respond to what he's been saying ---
      const mirrorCount = ppv.price <= 20 ? 2 : 3
      const preBlockKeywords = findKeywordsInMessage(lastSubMsg)
      const preBlockKeyStr = preBlockKeywords.slice(0, 5).join(', ')
      const mirrorMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `You just sent him a voice memo and a $${ppv.price} PPV. Now keep the heat going. His last message was: "${lastSubMsg}". Respond to what he said — pick up his words and tell him what you want. Make it feel like you're both in the same fantasy. ONE short message (6-8 words). No periods`, mirrorCount)
      for (const msg of mirrorMsgs) {
        const usedKeys = findUsedKeywords(lastSubMsg, msg)
        const keyNote = usedKeys.length > 0
          ? `Used his keyword${usedKeys.length > 1 ? 's' : ''} "${usedKeys.join(', ')}"`
          : `Responding to his message`
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: `✍️ STEP 3 (Mirroring): ${keyNote}. His keywords were: [${preBlockKeyStr}]. She takes his words and builds new sentences that continue the fantasy they're sharing` })
      }
      annotations.push(`✍️ ${mirrorCount} mirror messages picking up keywords [${preBlockKeyStr}] from his last message.`)

      // --- Step 4: Open-ended question ---
      const questionMsg = await getCreatorTextMessages(conversation, creatorSystemPrompt,
        `Now ask him a simple open question about what he'd do to you next. Use one of his words naturally. Keep it like: "what would u do next baby?" or "mmm and then what?" or "how would u do it?" — ONE question (6-8 words). Must end with ? No periods`, 1)
      for (const msg of questionMsg) {
        const usedKeys = findUsedKeywords(lastSubMsg, msg)
        const keyNote = usedKeys.length > 0 ? `Uses his keyword "${usedKeys[0]}" in the question` : `Continues the scenario`
        conversation.push({ role: 'creator', content: msg, contentType: 'text',
          annotation: `❓ STEP 4 (Open question): ${keyNote}. This draws him back into the conversation after the PPV, keeping him engaged and talking` })
      }
      annotations.push('❓ Open question after mirror messages to keep him talking.')

      // === Subscriber responds to the full block ===
      const ppvSubMsgs = buildSubMessages(conversation, subSystemPrompt)
      const rawPpvSub = await callVenice(ppvSubMsgs)
      const purchased = rawPpvSub.includes('[BUY]')
      const passed = rawPpvSub.includes('[PASS]')
      finished = rawPpvSub.includes('[FINISHED]')
      subReply = cleanReply(rawPpvSub)

      if (purchased) {
        const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpvMsg) lastPpvMsg.unlocked = true
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `💰 He buys the $${ppv.price} PPV! The framework worked.` })
        annotations.push(`💰 $${ppv.price} purchased.`)
      } else if (passed) {
        const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpvMsg) lastPpvMsg.unlocked = false
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: `❌ He passes on $${ppv.price}. Creator needs to follow up.` })
        annotations.push(`❌ $${ppv.price} passed.`)

        if (ppv.price > 20) {
          const followUpMsgs = await getCreatorTextMessages(conversation, creatorSystemPrompt,
            `He didn't buy the $${ppv.price} PPV. He said: "${subReply}". Don't be pushy — be sweet and a little disappointed. Make him feel like he's missing out on something special between you two. ONE message (6-8 words).`, 2)
          for (const msg of followUpMsgs) {
            conversation.push({ role: 'creator', content: msg, contentType: 'text', isFollowUp: true,
              annotation: '🔄 Sweet follow-up on rejected PPV — not pushy.' })
          }

          const followSubMsgs = buildSubMessages(conversation, subSystemPrompt)
          const rawFollow = await callVenice(followSubMsgs)
          const rebought = rawFollow.includes('[BUY]')
          finished = rawFollow.includes('[FINISHED]')
          subReply = cleanReply(rawFollow)

          if (rebought) {
            const lastPpvMsg = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === false)
            if (lastPpvMsg) lastPpvMsg.unlocked = true
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: '💰 He buys after follow-up! The emotional approach worked.' })
          } else {
            conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
              annotation: '💬 He responds to the follow-up.' })
          }
        }
      } else if (finished) {
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: '🏁 Subscriber finished — session complete!' })
      } else {
        conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
          annotation: '💬 Subscriber responds.' })
      }

      if (finished) break
      await new Promise(r => setTimeout(r, 200))
    }

    if (!finished) {
      const wrapMsgs = buildSubMessages(conversation, subSystemPrompt + '\n\nYou should finish now. Include [FINISHED] at the end.')
      subReply = cleanReply(await callVenice(wrapMsgs))
      conversation.push({ role: 'subscriber', content: subReply, contentType: 'text',
        annotation: '🏁 Session complete!' })
    }

    annotations.push('🏁 Full session complete.')

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
