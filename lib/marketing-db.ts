import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or POSTGRES_URL is not set')
}

export const sql = neon(DATABASE_URL)

export async function initMarketingDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_users (
        id SERIAL PRIMARY KEY,
        telegram_username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS marketing_assessment_results (
        id SERIAL PRIMARY KEY,
        telegram_username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        day INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage DECIMAL(5,2) NOT NULL,
        passed BOOLEAN NOT NULL,
        attempt_number INTEGER DEFAULT 1,
        answers JSONB,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_mkt_assessment_user ON marketing_assessment_results(telegram_username, email)`
    } catch { /* exists */ }

    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_mkt_assessment_day ON marketing_assessment_results(day)`
    } catch { /* exists */ }

    console.log('Marketing database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing marketing database:', error)
    return false
  }
}
