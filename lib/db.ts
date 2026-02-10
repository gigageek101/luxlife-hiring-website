import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL or POSTGRES_URL is not set')
}

export const sql = neon(DATABASE_URL)

// Database schema initialization
export async function initDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create assessment_results table (without foreign key constraint for flexibility)
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_results (
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

    // Create indexes for faster lookups
    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_assessment_user 
        ON assessment_results(telegram_username, email)
      `
    } catch (e) {
      // Index might already exist
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_assessment_day 
        ON assessment_results(day)
      `
    } catch (e) {
      // Index might already exist
    }

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    // Don't throw error if tables already exist
    return false
  }
}
