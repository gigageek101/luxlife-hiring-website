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

    await sql`
      CREATE TABLE IF NOT EXISTS simulation_reports (
        id SERIAL PRIMARY KEY,
        telegram_username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        overall_score INTEGER NOT NULL,
        categories JSONB NOT NULL,
        overall_feedback TEXT NOT NULL,
        notes TEXT,
        conversation JSONB NOT NULL,
        duration_mode VARCHAR(20) NOT NULL,
        message_count INTEGER NOT NULL,
        typed_count INTEGER DEFAULT 0,
        paste_count INTEGER DEFAULT 0,
        simulation_type VARCHAR(20) DEFAULT 'chatting',
        wpm DECIMAL(5,1) DEFAULT 0,
        session_recording JSONB,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS inbound_leads (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255),
        email VARCHAR(255),
        city VARCHAR(255),
        age INTEGER,
        position_type VARCHAR(50) NOT NULL,
        english_quiz_score INTEGER,
        english_quiz_total INTEGER,
        memory_test_score INTEGER,
        memory_test_total INTEGER,
        education_type VARCHAR(100),
        english_rating VARCHAR(50),
        quiz_answers JSONB,
        qualified BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS application_stats (
        id SERIAL PRIMARY KEY,
        position_type VARCHAR(50) NOT NULL,
        qualified BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_simulation_user
        ON simulation_reports(telegram_username, email)
      `
    } catch (e) {
      // Index might already exist
    }

    // Add new columns to inbound_leads for typing/speed/creativity tests (non-destructive)
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS typing_wpm DECIMAL(5,1)` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS typing_accuracy DECIMAL(5,2)` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS typing_passed BOOLEAN` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS download_speed DECIMAL(8,2)` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS upload_speed DECIMAL(8,2)` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS speed_passed BOOLEAN` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS creativity_score INTEGER` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS creativity_data JSONB` } catch (e) {}
    try { await sql`ALTER TABLE inbound_leads ADD COLUMN IF NOT EXISTS creativity_passed BOOLEAN` } catch (e) {}

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_inbound_leads_position
        ON inbound_leads(position_type)
      `
    } catch (e) {
      // Index might already exist
    }

    try {
      await sql`
        CREATE INDEX IF NOT EXISTS idx_application_stats_position
        ON application_stats(position_type, qualified)
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
