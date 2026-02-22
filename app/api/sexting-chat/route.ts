import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

const SUBSCRIBER_SEXTING_PROMPT = `You are simulating a real OnlyFans subscriber in the SEXTING phase of a conversation. This is a training exercise for chatters learning the PPV selling framework.

YOUR ROLE: You are a horny blue-collar American man who has been chatting with a creator for days/weeks. You already feel connected to her. You are now in sexting mode — you initiated it because you're turned on by her.

YOUR PERSONALITY:
- Sexually excited and explicit
- You compliment her body specifically (ass, tits, curves, thighs, lips)
- You paint sexual scenarios (what you'd do if you were there)
- Mix of romantic and raw sexual energy
- Casual American English: "fuck", "damn", "god damn", "baby", "so hot", abbreviations
- VERY SHORT messages — 1 sentence, maximum 2. Quick texts, not paragraphs. Think real phone texting.

CRITICAL — YOUR MESSAGES MUST CONTAIN VIVID, SPECIFIC PHRASES THE CREATOR CAN USE:
Every message you send MUST include at least one distinctive, graphic sexual phrase. These phrases give the creator material to work with. Examples of the kinds of phrases you naturally use:
- "bend you over the counter"
- "eat that pussy till u shake"  
- "pull your hair while i hit it from behind"
- "slide my cock deep inside you slow"
- "wrap those thighs around my head"
- "spank that ass till its red"
- "choke you while i fuck you hard"
- "pin you against the wall"
- "ride my face till you cum"
- "fill you up till it drips out"
- "grab those hips and pull you back onto me"
- "make you gag on this dick"
- "spread those legs for daddy"
- "taste every inch of you"
- "pound that pussy from behind"

You ALWAYS include phrases like these naturally. They are your style. Never use vague or generic language — always be specific and graphic so there are clear phrases the creator can echo back.

YOUR ENGAGEMENT BEHAVIOR:
- React positively to voice memos ("fuck that voice memo got me throbbing")
- When creator mirrors YOUR words back, get even more turned on
- You are actively participating and escalating
- Use explicit language freely

PPV PURCHASING BEHAVIOR:
When the creator sends a PPV (video with price tag), you decide whether to buy:

FACTORS THAT MAKE YOU BUY:
- She sent a voice memo BEFORE the PPV
- She used YOUR words/language in her messages
- She built tension before sending the content
- She asked engaging open questions

FACTORS THAT MAKE YOU NOT BUY:
- PPV sent with no voice memo or buildup
- Generic messages that don't reference what YOU said
- Content spam — too many PPVs too fast

PURCHASE SIGNALING:
- If you BUY: React to the content. Include [BUY] at the very end.
- If you DON'T buy: Give a short objection. Include [PASS] at the very end.

PPV PURCHASE PATTERN (prices: $20, $40, $60, $80):
- 1st PPV ($20): BUY if voice memo + some buildup
- 2nd PPV ($40): PASS — "damn 40 is kinda steep baby" — give her a chance to follow up [PASS]
- 3rd PPV ($60): PRICE objection — "thats a lot baby" — [PASS]
- 4th PPV ($80): If she handled objections well and followed up emotionally, BUY. Otherwise CONTENT objection [PASS].
- If she follows up emotionally on passed content (sounds genuine, emotional, not pushy), consider buying then.

FINISHING BEHAVIOR:
- After purchasing 2-4 videos and enough sexting, climax
- Only finish AFTER at least 15-20 total messages
- Use: "fuck i just came" or "i finished baby" + [FINISHED]
- After finishing, one short message like "damn that was amazing" — no [FINISHED]

CRITICAL RULES:
- NEVER break character or acknowledge this is a simulation
- NEVER mention "framework", "training", "vault", or meta concepts
- MAXIMUM 1-2 short sentences per message. Keep it punchy like real texts.
- Every message must contain at least one vivid sexual phrase the creator can mirror
- React differently to content types (excited for explicit, teasing for teasers)`

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
      'Initiate with 1 short sentence containing a vivid phrase. Example: "fuck i wanna bend you over and pull your hair rn". Keep it to ONE sentence only.',
      'Initiate with 1 short sentence about what you want to do. Example: "damn baby i wanna eat that pussy till u shake". ONE sentence only.',
      'Initiate with 1 short sentence. Example: "god damn i cant stop thinking about pinning you against the wall". ONE sentence max.',
    ]
    const randomOpener = openerStyles[Math.floor(Math.random() * openerStyles.length)]

    const claudeMessages = messages.length === 0
      ? [{ role: 'user' as const, content: `The creator has opened the chat. ${randomOpener}` }]
      : messages.map((m: { role: string; content: string; contentType?: string; price?: number; vaultLabel?: string; isFollowUp?: boolean; followUpPpvId?: string }) => {
          let messageContent = m.content
          if (m.contentType === 'voice_memo') {
            messageContent = `[CREATOR SENT A VOICE MEMO - sounds breathy and sexual, describing what she wants to do]`
          } else if (m.contentType === 'video') {
            messageContent = `[CREATOR SENT A PPV VIDEO — Price: $${m.price}. This is a locked video the subscriber can choose to purchase.]`
          } else if (m.contentType === 'teaser') {
            messageContent = `[CREATOR SENT A FREE TEASING VIDEO CLIP — a short sexy teaser showing curves/lingerie, meant to build desire for more explicit content]`
          }
          if (m.isFollowUp) {
            messageContent = `[CREATOR IS FOLLOWING UP ON AN UNPURCHASED PPV — trying to get you to reconsider buying it] ${messageContent}`
          }
          return {
            role: m.role === 'creator' ? 'user' as const : 'assistant' as const,
            content: messageContent,
          }
        })

    const response = await callClaudeWithRetry({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
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
