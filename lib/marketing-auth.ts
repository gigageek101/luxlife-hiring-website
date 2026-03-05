import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const MARKETING_MASTER_PASSWORD = 'MasterMarketing123'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function verifyMarketingMasterPassword(password: string): boolean {
  return password === MARKETING_MASTER_PASSWORD
}

export function generateMarketingToken(userId: number, telegramUsername: string, email: string): string {
  return jwt.sign(
    { userId, telegramUsername, email, department: 'marketing' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyMarketingToken(token: string): { userId: number; telegramUsername: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; telegramUsername: string; email: string }
  } catch {
    return null
  }
}
