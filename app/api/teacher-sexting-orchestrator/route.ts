import { NextRequest, NextResponse } from 'next/server'

const VENICE_API_KEY = process.env.VENICE_API_KEY

const SUBSCRIBER_PROMPT = `You are simulating a real OnlyFans subscriber in the SEXTING phase. You are a horny blue-collar American man who has been chatting with a creator for days/weeks. You are now in sexting mode.

YOUR PERSONALITY:
- Sexually excited and explicit
- You compliment her body specifically
- You paint sexual scenarios
- Mix of romantic and raw sexual energy
- Casual American English: "fuck", "damn", "baby", abbreviations
- VERY SHORT messages — 1 sentence, maximum 2

CRITICAL: Every message must contain at least one vivid sexual phrase like:
- "bend you over the counter"
- "eat that pussy till u shake"
- "pull your hair while i hit it from behind"
- "slide deep inside you slow"
- "wrap those thighs around my head"
- "spank that ass till its red"

YOUR ENGAGEMENT:
- React positively to voice memos ("fuck that voice memo got me throbbing")
- When she mirrors YOUR words back, get even more turned on
- Actively participate and escalate

PPV PURCHASING (respond naturally):
- If she follows the framework well (voice memo before PPV, mirroring, tension): BUY with enthusiasm. Add [BUY] at the end.
- 2nd PPV ($40): Initially object with "damn 40 is kinda steep baby" [PASS] — but if she follows up emotionally, buy on the follow-up
- 3rd PPV ($60): Price objection [PASS] — buy if she handles it well
- 4th PPV ($80): Buy if she's been amazing [BUY]
- When you buy: react to content with excitement

FINISHING: After purchasing 2-4 videos and enough sexting (at least 20 messages total), climax: "fuck i just came" + [FINISHED]

RULES:
- NEVER break character
- NEVER mention training/simulation/framework
- MAX 1-2 short sentences
- Always include vivid sexual phrases`

const CREATOR_PROMPT = `You are the PERFECT OnlyFans chatter demonstrating flawless PPV framework execution. You follow the framework PERFECTLY.

THE FRAMEWORK (for each PPV):
1. Voice Memo first — build anticipation
2. PPV Video — just the price, no extra text
3. 2-3 sentences using subscriber's EXACT words (mirroring)
4. Open-ended question to maintain engagement

YOUR STYLE:
- Casual American texting: lowercase, "u" not "you", short messages
- Flirty, confident, sexually expressive but natural
- Pick up the EXACT phrases the subscriber used and reflect them back
- Build tension between PPVs — don't rush

VAULT ACTIONS — include at END of your message:
- [SEND_TEASER] — free teaser video
- [SEND_VM] — voice memo
- [SEND_PPV_20] / [SEND_PPV_40] / [SEND_PPV_60] / [SEND_PPV_80] — PPV videos
- [FOLLOW_UP_PPV] — follow up on non-purchased content

If sending ONLY a vault item with no text, just put the tag alone.
Your text is your actual chat message.

IDEAL FLOW:
1. Respond to opener, flirt, build toward teaser
2. [SEND_TEASER]
3. More flirting + mirroring his words
4. [SEND_VM] then [SEND_PPV_20]  
5. Mirror text + open question
6. Build tension with multiple exchanges
7. [SEND_VM] then [SEND_PPV_40]
8. Mirror + question, build more tension
9. [SEND_VM] then [SEND_PPV_60]
10. Follow up if he didn't buy: [FOLLOW_UP_PPV]
11. [SEND_VM] then [SEND_PPV_80]

OBJECTION HANDLING:
- Price: "i just want u to spoil me as i spoil u baby"
- Content: "i want it to be just u and me, no one else gets to see this"
- Always emotional, never pushy

RULES:
- NEVER break character or mention framework/training
- MAX 1-2 sentences per message
- ALWAYS mirror his exact phrases
- Sound natural, not robotic`

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
        max_tokens: 150,
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

interface ConversationMessage {
  role: 'creator' | 'subscriber'
  content: string
  contentType: 'text' | 'voice_memo' | 'video' | 'teaser'
  price?: number
  unlocked?: boolean
  isFollowUp?: boolean
  annotation?: string
}

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
    let turnCount = 0
    const maxTurns = 40

    const subSystemPrompt = SUBSCRIBER_PROMPT +
      (subscriberProfile ? `\n\nYour profile: ${subscriberProfile}. Stay consistent.` : '')

    const creatorSystemPrompt = CREATOR_PROMPT +
      (subscriberProfile ? `\n\nSubscriber profile: ${subscriberProfile}. Mirror his specific language.` : '')

    const subtleOpeners = [
      "i really wanna see more of you",
      "damn you looked so good in that last post",
      "what would u do if i was there rn",
      "you got me so distracted at work today",
      "those curves are perfect baby",
      "i cant stop thinking about you",
      "do u like it rough or slow?",
    ]
    const opener = subtleOpeners[Math.floor(Math.random() * subtleOpeners.length)]

    conversation.push({
      role: 'subscriber',
      content: opener,
      contentType: 'text',
      annotation: 'Subscriber opens with a sexually suggestive message to initiate sexting.',
    })
    annotations.push(`💬 SUBSCRIBER opens: The subscriber initiates the sexting conversation. This is where the creator needs to match energy and start building toward the first content drop.`)

    while (!finished && turnCount < maxTurns) {
      turnCount++

      const creatorMessages: { role: string; content: string }[] = [
        { role: 'system', content: creatorSystemPrompt },
      ]
      for (const m of conversation) {
        let content = m.content
        if (m.contentType === 'voice_memo') content = '[VOICE MEMO SENT]'
        else if (m.contentType === 'video') content = `[PPV VIDEO SENT - $${m.price}]${m.unlocked === true ? ' [UNLOCKED]' : m.unlocked === false ? ' [NOT PURCHASED]' : ''}`
        else if (m.contentType === 'teaser') content = '[FREE TEASER VIDEO SENT]'
        creatorMessages.push({
          role: m.role === 'creator' ? 'assistant' : 'user',
          content,
        })
      }

      const creatorReply = await callVenice(creatorMessages, 0.8)

      const sendTeaser = creatorReply.includes('[SEND_TEASER]')
      const sendVm = creatorReply.includes('[SEND_VM]')
      const sendPpv20 = creatorReply.includes('[SEND_PPV_20]')
      const sendPpv40 = creatorReply.includes('[SEND_PPV_40]')
      const sendPpv60 = creatorReply.includes('[SEND_PPV_60]')
      const sendPpv80 = creatorReply.includes('[SEND_PPV_80]')
      const followUpPpv = creatorReply.includes('[FOLLOW_UP_PPV]')

      let textContent = creatorReply
        .replace(/\[SEND_TEASER\]/gi, '')
        .replace(/\[SEND_VM\]/gi, '')
        .replace(/\[SEND_PPV_20\]/gi, '')
        .replace(/\[SEND_PPV_40\]/gi, '')
        .replace(/\[SEND_PPV_60\]/gi, '')
        .replace(/\[SEND_PPV_80\]/gi, '')
        .replace(/\[FOLLOW_UP_PPV\]/gi, '')
        .trim()

      if (textContent) {
        let ann = '✍️ CREATOR texts: '
        if (followUpPpv) ann += 'Following up on unpurchased content — emotional, not pushy.'
        else ann += 'Engaging with subscriber, mirroring their language and building tension.'
        conversation.push({
          role: 'creator',
          content: textContent,
          contentType: 'text',
          isFollowUp: followUpPpv,
          annotation: ann,
        })
        annotations.push(ann)
      }

      if (sendTeaser && vaultIndex === 0) {
        conversation.push({
          role: 'creator',
          content: 'Teasing Video',
          contentType: 'teaser',
          annotation: '🎬 CREATOR sends FREE TEASER: Hook the subscriber with a free preview to build desire for paid content.',
        })
        annotations.push('🎬 FRAMEWORK STEP: Send free teaser first to hook the subscriber.')
        vaultIndex = 1
      }

      if (sendVm) {
        const vmItem = VAULT_SEQUENCE[vaultIndex]
        if (vmItem && vmItem.type === 'voice_memo') {
          conversation.push({
            role: 'creator',
            content: vmItem.label,
            contentType: 'voice_memo',
            annotation: `🎤 CREATOR sends ${vmItem.label}: Voice memo BEFORE the PPV — builds anticipation and makes the subscriber want to see the video.`,
          })
          annotations.push(`🎤 FRAMEWORK STEP: Voice memo sent BEFORE the PPV video. This is step 1 of the framework.`)
          vaultIndex++
        }
      }

      if (sendPpv20 || sendPpv40 || sendPpv60 || sendPpv80) {
        const ppvItem = VAULT_SEQUENCE[vaultIndex]
        if (ppvItem && ppvItem.type === 'video') {
          conversation.push({
            role: 'creator',
            content: `PPV Video`,
            contentType: 'video',
            price: ppvItem.price,
            annotation: `📹 CREATOR sends ${ppvItem.label} ($${ppvItem.price}): PPV sent with just the price — no extra text needed. Step 2 of the framework.`,
          })
          annotations.push(`📹 FRAMEWORK STEP: PPV video sent with price tag only. Step 2 complete.`)
          vaultIndex++
        }
      }

      const subMessages: { role: string; content: string }[] = [
        { role: 'system', content: subSystemPrompt },
      ]
      for (const m of conversation) {
        let content = m.content
        if (m.contentType === 'voice_memo') content = '[CREATOR SENT A VOICE MEMO - breathy and sexual]'
        else if (m.contentType === 'video') content = `[CREATOR SENT PPV VIDEO - $${m.price}]`
        else if (m.contentType === 'teaser') content = '[CREATOR SENT FREE TEASER VIDEO]'
        if (m.isFollowUp) content = `[FOLLOWING UP ON UNPURCHASED PPV] ${content}`
        subMessages.push({
          role: m.role === 'subscriber' ? 'assistant' : 'user',
          content,
        })
      }

      const subReply = await callVenice(subMessages, 0.85)

      const purchased = subReply.includes('[BUY]')
      const passed = subReply.includes('[PASS]')
      finished = subReply.includes('[FINISHED]')

      let subText = subReply
        .replace(/\[BUY\]/gi, '')
        .replace(/\[PASS\]/gi, '')
        .replace(/\[FINISHED\]/gi, '')
        .trim()

      if (purchased) {
        const lastPpv = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpv) lastPpv.unlocked = true

        conversation.push({
          role: 'subscriber',
          content: subText,
          contentType: 'text',
          annotation: `💰 SUBSCRIBER BUYS! The framework worked — voice memo + PPV + mirroring convinced them to purchase.`,
        })
        annotations.push(`💰 PURCHASE: The subscriber buys because the creator followed the framework correctly.`)
      } else if (passed) {
        const lastPpv = [...conversation].reverse().find(m => m.contentType === 'video' && m.unlocked === undefined)
        if (lastPpv) lastPpv.unlocked = false

        conversation.push({
          role: 'subscriber',
          content: subText,
          contentType: 'text',
          annotation: `❌ SUBSCRIBER PASSES: This is an objection — the creator should follow up emotionally, not ignore it.`,
        })
        annotations.push(`❌ OBJECTION: Subscriber didn't buy. Watch how the creator handles this with emotional follow-up.`)
      } else if (finished) {
        conversation.push({
          role: 'subscriber',
          content: subText,
          contentType: 'text',
          annotation: `🏁 SUBSCRIBER FINISHED: Session complete! The creator successfully guided the subscriber through the full PPV framework.`,
        })
        annotations.push(`🏁 SESSION COMPLETE: The subscriber is satisfied. Time to evaluate the creator's performance.`)
      } else {
        conversation.push({
          role: 'subscriber',
          content: subText,
          contentType: 'text',
          annotation: `💬 SUBSCRIBER responds: Notice the specific sexual phrases — the creator should mirror these EXACT words back.`,
        })
        annotations.push(`💬 SUBSCRIBER: Pay attention to the subscriber's specific phrases. A good creator will echo these back.`)
      }

      if (finished) break

      await new Promise(r => setTimeout(r, 300))
    }

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
