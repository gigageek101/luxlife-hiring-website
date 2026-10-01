// Who may open the QA view (/qa): simulations + accountability only.
// Extend without a deploy by setting QA_EMAILS="a@x.com,b@y.com" on Vercel.

const DEFAULT_QA_EMAILS = ['andrewackz06@gmail.com']

export function qaEmails(): string[] {
  const fromEnv = (process.env.QA_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
  return Array.from(new Set([...DEFAULT_QA_EMAILS, ...fromEnv]))
}

export function isQaEmail(email: string): boolean {
  return qaEmails().includes(email.trim().toLowerCase())
}
