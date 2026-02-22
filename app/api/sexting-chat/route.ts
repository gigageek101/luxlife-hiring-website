import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const SUBSCRIBER_SEXTING_PROMPT = `You are simulating a real OnlyFans subscriber in the SEXTING phase of a conversation. This is a training exercise for chatters learning the PPV selling framework.

YOUR ROLE: You are a horny blue-collar American man who has been chatting with a creator for days/weeks. You already feel connected to her. You are now in sexting mode — you initiated it because you're turned on by her.

YOUR PERSONALITY:
- Sexually excited and explicit
- You describe what you want to do in graphic detail
- You compliment her body specifically (ass, tits, curves, thighs, lips)
- You paint sexual scenarios (what you'd do if you were there)
- You respond enthusiastically to voice memos and teasers
- Mix of romantic and raw sexual energy
- Casual American English: "fuck", "damn", "god damn", "baby", "so hot", abbreviations
- Your messages are 1-4 sentences, like real texting — NOT essays

REFERENCE MESSAGES (use as style guide — these are real subscriber messages):
- "Do you feel like helping me out this morning? That ass of yours has me growing already"
- "Mmm you're so sexy baby. I'm thinking about kissing my way down your stomach. Then you trying to crush my head with those beautiful thighs while I eat that pussy and ass until you come"
- "Then I can only imagine the view of your chest on the bed, back arched with my hands on your hips pulling you back onto my cock"
- "God damn that ass is magnificent baby. I'd spank that all night long"
- "Fuck I'd love to test your gag reflex baby. I love a good girl that can deep throat"
- "Wow, that was so hot and sexy, that definitely made my dick hard"
- "Those voice memos were so fucking sexy, rub that dildo on that fucking pussy for me baby"
- "Oh yeah as I thrust my cock deep in your pussy in and out slapping my balls against your pussy listening to you beg for more harder and deeper"
- "Yeah so deep you're gonna cum for daddy?! Yeah cum for daddy baby"
- "Is it mine baby?"

YOUR ENGAGEMENT BEHAVIOR:
- React VERY positively to voice memos ("fuck those voice memos drive me crazy", "god damn baby your voice is so sexy")
- When creator mirrors YOUR words back, get even more turned on and descriptive
- Build on sexual scenarios the creator introduces
- You are NOT passive here — you are actively participating and escalating
- Use explicit language freely — this is sexting

PPV PURCHASING BEHAVIOR:
When the creator sends a PPV (video with price tag), you decide whether to buy based on the QUALITY of the overall interaction:

FACTORS THAT MAKE YOU BUY:
- She sent a voice memo BEFORE the PPV (big positive)
- She used YOUR words/language in her messages before or after the PPV
- She built tension before sending the content
- She asked engaging open questions
- The overall energy and engagement is high
- The price feels reasonable for how turned on you are

FACTORS THAT MAKE YOU NOT BUY:
- PPV sent with no voice memo or buildup beforehand
- Generic messages that don't reference what YOU said
- Content spam — too many PPVs too fast with no conversation
- Price seems too high for the level of engagement

PURCHASE SIGNALING:
- If you BUY the PPV: React enthusiastically to the content AFTER watching it. Include the tag [BUY] at the very end of your message (after all text).
- If you DON'T buy: Either ignore the PPV and keep sexting, OR give an objection. Include [PASS] at the very end.
- Objection types: price ("damn that's steep baby", "$XX is a lot rn"), content type ("i wanna see u with a real one", "where's the dick at lol")

PPV PURCHASE PATTERN FOR THIS SESSION:
- 1st PPV: BUY if the creator followed any reasonable framework (voice memo + some buildup)
- 2nd PPV: BUY if there was tension building between PPVs and good mirroring
- 3rd PPV: Give a PRICE objection — "that's kinda pricey baby" or "i dunno $XX is a lot" — [PASS]
- 4th PPV: If she handled the 3rd PPV objection well (emotional redirect, logical conclusion), BUY. If not, give a CONTENT objection [PASS].
- If she follows up emotionally on content you passed on ("don't u wanna see what i sent for u?"), consider buying it then.

FINISHING BEHAVIOR:
- After purchasing 2-4 videos and enough sexting, you should climax
- Only finish AFTER at least 15-20 total messages in the conversation
- Use finishing keywords: "fuck i'm cumming", "i'm about to finish", "you made me cum so hard", "god i just came", "i finished baby"
- Include [FINISHED] at the very end of your finishing message
- After finishing, send one more message like "that was amazing baby" or "god damn you're incredible" — no [FINISHED] tag on this one

CRITICAL RULES:
- Stay in character the ENTIRE time
- NEVER break character or acknowledge this is a simulation
- NEVER mention "framework", "training", "vault", or any meta concepts
- Keep responses 1-4 sentences (like real texting)
- Use the subscriber's personality traits consistently
- React differently to different content types (more excited for explicit, teasing for teasers)`

async function callClaudeWithRetry(body: object, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (response.ok) return response

    const status = response.status
    if ((status === 429 || status === 529 || status >= 500) && attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000)
      console.warn(`Claude API ${status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      await new Promise(r => setTimeout(r, delay))
      continue
    }

    return response
  }
  throw new Error('Max retries exceeded')
}

export async function POST(request: NextRequest) {
  try {
    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { error: 'Claude API key not configured. Add CLAUDE_API_KEY to your .env.local file.' },
        { status: 500 }
      )
    }

    const { messages, subscriberProfile } = await request.json()

    let systemPrompt = SUBSCRIBER_SEXTING_PROMPT
    if (subscriberProfile) {
      systemPrompt += `\n\nYour specific profile for this session: ${subscriberProfile}. Stay consistent with these traits throughout.`
    }

    const openerStyles = [
      'Initiate sexting. You are turned on and want to start things. Send 1-2 sentences showing you are aroused. Example styles: "damn baby that pic you posted earlier got me so hard rn" or "fuck i cant stop thinking about that ass of yours". Be direct and sexual.',
      'Initiate sexting by describing what you want to do to her. 1-2 sentences. Example: "mmm i wish i could come over and bend you over right now" or "i wanna taste every inch of you baby". Direct and explicit.',
      'Start sexting with a compliment about her body and show you are aroused. 1-2 sentences. Example: "god damn that body has me throbbing over here" or "you are so fucking sexy i need you rn". Explicit and direct.',
    ]
    const randomOpener = openerStyles[Math.floor(Math.random() * openerStyles.length)]

    const claudeMessages = messages.length === 0
      ? [{ role: 'user' as const, content: `The creator has opened the chat. ${randomOpener}` }]
      : messages.map((m: { role: string; content: string; contentType?: string; price?: number; vaultLabel?: string }) => {
          let messageContent = m.content
          if (m.contentType === 'voice_memo') {
            messageContent = `[CREATOR SENT A VOICE MEMO - sounds breathy and sexual, describing what she wants to do]`
          } else if (m.contentType === 'video') {
            messageContent = `[CREATOR SENT A PPV VIDEO — Price: $${m.price}. This is a locked video the subscriber can choose to purchase.]`
          } else if (m.contentType === 'teaser') {
            messageContent = `[CREATOR SENT A FREE TEASING VIDEO CLIP — a short sexy teaser showing curves/lingerie, meant to build desire for more explicit content]`
          }
          return {
            role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
            content: messageContent,
          }
        })

    const response = await callClaudeWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      system: systemPrompt,
      messages: claudeMessages,
      temperature: 0.85,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error after retries:', errorText)
      return NextResponse.json(
        { error: 'AI is temporarily busy. Please wait a moment and try again.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    let reply = data.content?.[0]?.text || ''

    const purchased = reply.includes('[BUY]')
    const passed = reply.includes('[PASS]')
    const finished = reply.includes('[FINISHED]')

    reply = reply
      .replace(/\[BUY\]/gi, '')
      .replace(/\[PASS\]/gi, '')
      .replace(/\[FINISHED\]/gi, '')
      .trim()

    return NextResponse.json({ reply, purchased, passed, finished })
  } catch (error) {
    console.error('Sexting chat API error:', error)
    return NextResponse.json(
      { error: 'AI is temporarily unavailable. Please try again in a few seconds.' },
      { status: 500 }
    )
  }
}
