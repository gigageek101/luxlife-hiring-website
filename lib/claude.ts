/**
 * Single source of truth for every Anthropic (Claude) call on this site.
 *
 * Model: Claude Sonnet 5.5, fixed here. The request presets below are specific to it
 * (`between_tools` exists only on Sonnet 5.5), so the model is not read from the environment.
 *
 * Rules that differ from the old Sonnet 4 code, each enforced by the API with a 400:
 *  - no `temperature` / `top_p` / `top_k`
 *  - thinking is on by default; the only "off" setting is `thinking: { type: 'between_tools' }`
 *  - a response can start with a `thinking` block, so text must be read by block type
 *  - a safety decline is HTTP 200 with `stop_reason: "refusal"` and empty content
 */

export const CLAUDE_MODEL: string = 'claude-sonnet-5-5'

/**
 * Second try for the graders when Sonnet 5.5's `general_harms` classifier declines a transcript.
 * Sonnet 5 has the same price and no such classifier. Graders send no `thinking` field, so the
 * same body can be re-sent with only the model swapped. Not used by the chat presets.
 */
export const CLAUDE_FALLBACK_MODEL: string = 'claude-sonnet-5'

export const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
export const CLAUDE_API_VERSION = '2023-06-01'

/** Roleplay replies of a few words: no extended thinking, the whole token budget goes to the reply. */
export const CLAUDE_CHAT_SETTINGS = {
  thinking: { type: 'between_tools' },
  output_config: { effort: 'low' },
} as const

/** Rubric grading that returns JSON: adaptive thinking at medium effort. Thinking counts toward max_tokens. */
export const CLAUDE_GRADING_SETTINGS = {
  output_config: { effort: 'medium' },
} as const

export interface ClaudeContentBlock {
  type: string
  text?: string
}

export interface ClaudeResponse {
  model?: string
  stop_reason?: string | null
  stop_details?: { type?: string; category?: string | null; explanation?: string | null } | null
  content?: ClaudeContentBlock[]
  usage?: { input_tokens?: number; output_tokens?: number }
}

/** All text blocks joined. Never read content[0] directly: it may be a thinking block. */
export function claudeText(data: ClaudeResponse): string {
  return (data.content ?? [])
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('')
}

/** True when Claude's safety classifiers declined the request (HTTP 200, empty content). */
export function claudeRefused(data: ClaudeResponse): boolean {
  return data.stop_reason === 'refusal'
}

/** True when the reply was cut off by max_tokens (thinking counts toward it even though it is not returned). */
export function claudeTruncated(data: ClaudeResponse): boolean {
  return data.stop_reason === 'max_tokens'
}

/** One-line description of why a response ended, for server logs. */
export function claudeStopInfo(data: ClaudeResponse): string {
  const reason = data.stop_reason ?? 'unknown'
  const category = data.stop_details?.category
  return category ? `${reason} (${category})` : reason
}
