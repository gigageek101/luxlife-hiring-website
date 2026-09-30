import { CLAUDE_API_URL, CLAUDE_API_VERSION, claudeStopInfo, type ClaudeResponse } from '@/lib/claude'
import { logClaudeUsage, setAppStatus } from '@/lib/tracking-db'

// The one place every server route calls Claude through: retries on 429/529/5xx, logs tokens and
// cost per call, and flags the account when the API says the credit balance is empty.

const PRICES_PER_MILLION: Record<string, { input: number; output: number; cacheRead: number }> = {
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-sonnet-5': { input: 2, output: 10, cacheRead: 0.2 },
}
export const CREDIT_EMPTY_MARKER = 'credit balance is too low'

interface Usage {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
}

export type ClaudeData = ClaudeResponse & { usage?: Usage }
export type ClaudeCall =
  | { ok: true; status: 200; data: ClaudeData; errorText: '' }
  | { ok: false; status: number; data: null; errorText: string }

let lastKnownCredit: 'ok' | 'empty' | null = null

export function estimateCost(model: string, usage: Usage): number {
  const base = Object.keys(PRICES_PER_MILLION).find((id) => model.startsWith(id))
  const price = base ? PRICES_PER_MILLION[base] : PRICES_PER_MILLION['claude-sonnet-5-5']
  const input = usage.input_tokens ?? 0
  const output = usage.output_tokens ?? 0
  const cached = usage.cache_read_input_tokens ?? 0
  return (input * price.input + output * price.output + cached * price.cacheRead) / 1_000_000
}

async function record(row: Parameters<typeof logClaudeUsage>[0], credit: 'ok' | 'empty' | null): Promise<void> {
  try {
    await logClaudeUsage(row)
    if (credit && credit !== lastKnownCredit) {
      await setAppStatus('claude_credit', credit)
      lastKnownCredit = credit
    }
  } catch (error) {
    console.error('Claude usage logging failed:', error)
  }
}

/** POST to the Messages API for `route` (a short label used in the cost overview). */
export async function callClaude(route: string, body: Record<string, unknown>, maxRetries = 3): Promise<ClaudeCall> {
  const apiKey = process.env.CLAUDE_API_KEY
  if (!apiKey) return { ok: false, status: 500, data: null, errorText: 'CLAUDE_API_KEY not configured' }
  const model = String(body.model ?? '')
  let response: Response | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': CLAUDE_API_VERSION, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (response.ok) break
    const retryable = response.status === 429 || response.status === 529 || response.status >= 500
    if (!retryable || attempt === maxRetries - 1) break
    await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * 2 ** attempt, 8000)))
  }
  if (!response) return { ok: false, status: 500, data: null, errorText: 'no response' }
  if (!response.ok) {
    const errorText = await response.text()
    const creditEmpty = response.status === 400 && errorText.toLowerCase().includes(CREDIT_EMPTY_MARKER)
    await record(
      { route, model, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, costUsd: 0, status: creditEmpty ? 'credit_empty' : `http_${response.status}`, detail: errorText.slice(0, 500) },
      creditEmpty ? 'empty' : null,
    )
    return { ok: false, status: response.status, data: null, errorText }
  }
  const data = (await response.json()) as ClaudeData
  const usage = data.usage ?? {}
  const refused = data.stop_reason === 'refusal'
  await record(
    {
      route,
      model: data.model ?? model,
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      costUsd: estimateCost(data.model ?? model, usage),
      status: refused ? 'refusal' : 'ok',
      detail: refused ? claudeStopInfo(data) : null,
    },
    'ok',
  )
  return { ok: true, status: 200, data, errorText: '' }
}
