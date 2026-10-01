// QA accounts: log in on /admin/auth like the admin, but only see Simulations + Accountability.
// Add more without a deploy: QA_ACCOUNTS="email:password,email2:password2" on Vercel.

export interface QaAccount { email: string; password: string }

const DEFAULT_QA_ACCOUNTS: QaAccount[] = [
  { email: 'andrewackz06@gmail.com', password: 'Sims-Check-7281' },
]

export function qaAccounts(): QaAccount[] {
  const fromEnv = (process.env.QA_ACCOUNTS || '')
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const idx = pair.indexOf(':')
      return idx > 0 ? { email: pair.slice(0, idx).trim().toLowerCase(), password: pair.slice(idx + 1) } : null
    })
    .filter((a): a is QaAccount => a !== null)
  return [...DEFAULT_QA_ACCOUNTS, ...fromEnv]
}

export function findQaAccount(email: string, password: string): QaAccount | null {
  const mail = email.trim().toLowerCase()
  return qaAccounts().find((a) => a.email === mail && a.password === password) || null
}
