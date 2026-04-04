import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY

export async function POST(request: NextRequest) {
  if (!CLAUDE_API_KEY) {
    return NextResponse.json({ valid: true, score: 0 }, { status: 200 })
  }

  try {
    const { object, pictureUse, alternateUses, product, productDescription, captions } = await request.json()

    const prompt = `You are evaluating a creativity test for a marketing job application. Be lenient — this is not about perfection, just whether the person put in genuine effort and their answers make basic sense.

PART 1 — CREATIVE USES
The object was: "${object}"
The picture showed the object being used as: "${pictureUse || 'unknown'}"
The applicant was asked to identify the use shown in the picture AND come up with one more on their own.
Their answers were:
${(alternateUses || []).map((u: string, i: number) => `${i + 1}. ${u}`).join('\n')}

For each answer, decide if it is a genuine creative use for the object (even if silly or unusual) or if it is nonsense/gibberish/completely unrelated. The first answer should roughly match the picture use. Be lenient. Count how many are valid.

PART 2 — SOCIAL MEDIA CAPTIONS
The product was: "${product}" — ${productDescription}
The applicant wrote these captions:
${(captions || []).filter((c: string) => c.trim()).map((c: string, i: number) => `${i + 1}. "${c}"`).join('\n')}

For each caption, decide if it makes basic sense as a social media caption for this product. It does NOT need to be brilliant — just relevant to the product and not gibberish.

Return ONLY valid JSON, no other text:
{
  "validUses": <number of answers that are genuine>,
  "totalUses": <total answers submitted>,
  "usesFeedback": "<1-2 sentence explanation of why uses are valid or not>",
  "validCaptions": <number of captions that make sense>,
  "totalCaptions": <total captions submitted>,
  "captionsFeedback": "<1-2 sentence explanation of why captions are valid or not>",
  "passed": <true if validUses >= 2 AND validCaptions >= 3>
}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return NextResponse.json({ valid: true, score: 0 }, { status: 200 })
    }

    const result = await response.json()
    const text = result.content?.[0]?.text || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ valid: true, score: 0 }, { status: 200 })
    }

    const evaluation = JSON.parse(jsonMatch[0])
    return NextResponse.json(evaluation, { status: 200 })
  } catch (error) {
    console.error('Creativity evaluation error:', error)
    return NextResponse.json({ valid: true, score: 0 }, { status: 200 })
  }
}
