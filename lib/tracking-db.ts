import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

// Tracking tables (guide reads, Claude usage, app status). Separate from lib/db so a missing
// DATABASE_URL (local dev) turns tracking into a no-op instead of crashing the Claude routes.

type Sql = NeonQueryFunction<false, false>
let client: Sql | null | undefined
let ensured: Promise<void> | null = null

export function getSql(): Sql | null {
  if (client === undefined) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
    client = url ? neon(url) : null
  }
  return client
}

/** Creates the tracking tables once per process. Safe to call on every request. */
export function ensureTrackingTables(): Promise<void> {
  const sql = getSql()
  if (!sql) return Promise.resolve()
  if (!ensured) {
    ensured = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS guide_views (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(64) UNIQUE NOT NULL,
          telegram_username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          slug VARCHAR(100) NOT NULL,
          opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          max_scroll INTEGER DEFAULT 0,
          seconds INTEGER DEFAULT 0,
          completed BOOLEAN DEFAULT FALSE
        )`
      await sql`CREATE INDEX IF NOT EXISTS idx_guide_views_user ON guide_views(telegram_username, email)`
      await sql`
        CREATE TABLE IF NOT EXISTS claude_usage (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          route VARCHAR(100) NOT NULL,
          model VARCHAR(100),
          input_tokens INTEGER DEFAULT 0,
          output_tokens INTEGER DEFAULT 0,
          cache_read_tokens INTEGER DEFAULT 0,
          cost_usd DECIMAL(10,6) DEFAULT 0,
          status VARCHAR(30) NOT NULL,
          detail TEXT
        )`
      await sql`CREATE INDEX IF NOT EXISTS idx_claude_usage_created ON claude_usage(created_at)`
      await sql`
        CREATE TABLE IF NOT EXISTS app_status (
          key VARCHAR(50) PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
    })().catch((error) => {
      ensured = null
      throw error
    })
  }
  return ensured
}

export async function setAppStatus(key: string, value: string): Promise<void> {
  const sql = getSql()
  if (!sql) return
  await ensureTrackingTables()
  await sql`
    INSERT INTO app_status (key, value, updated_at) VALUES (${key}, ${value}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
}

export async function getAppStatus(key: string): Promise<{ value: string; updatedAt: string } | null> {
  const sql = getSql()
  if (!sql) return null
  await ensureTrackingTables()
  const rows = await sql`SELECT value, updated_at FROM app_status WHERE key = ${key}`
  return rows.length ? { value: String(rows[0].value), updatedAt: String(rows[0].updated_at) } : null
}

export interface ClaudeUsageRow {
  route: string
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  costUsd: number
  status: string
  detail: string | null
}

export async function logClaudeUsage(row: ClaudeUsageRow): Promise<void> {
  const sql = getSql()
  if (!sql) return
  await ensureTrackingTables()
  await sql`
    INSERT INTO claude_usage (route, model, input_tokens, output_tokens, cache_read_tokens, cost_usd, status, detail)
    VALUES (${row.route}, ${row.model}, ${row.inputTokens}, ${row.outputTokens}, ${row.cacheReadTokens}, ${row.costUsd}, ${row.status}, ${row.detail})`
}
