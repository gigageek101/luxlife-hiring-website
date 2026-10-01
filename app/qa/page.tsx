'use client'

import { useEffect, useState } from 'react'
import AccountabilityTab from '@/components/admin/AccountabilityTab'
import SimulationsList from '@/components/admin/SimulationsList'

interface QaUser { telegramUsername: string; email: string }

/** QA view: all simulations + accountability, nothing else. Access list in lib/qa-access.ts. */
export default function QaPage() {
  const [user, setUser] = useState<QaUser | null | undefined>(undefined)
  const [telegram, setTelegram] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<'simulations' | 'accountability'>('simulations')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('qa_user')
      setUser(stored ? JSON.parse(stored) : null)
    } catch {
      setUser(null)
    }
  }, [])

  const login = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/qa-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ telegramUsername: telegram, email }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      localStorage.setItem('qa_user', JSON.stringify(data.user))
      localStorage.setItem('qa_token', data.token)
      setUser(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('qa_user')
    localStorage.removeItem('qa_token')
    setUser(null)
  }

  if (user === undefined) return null

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
        <form onSubmit={login} className="max-w-md mx-auto rounded-2xl p-8 space-y-4 bg-white border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">QA access</h1>
          <p className="text-sm text-gray-600">Simulations and accountability overview. Log in with your Telegram username and email.</p>
          <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="Telegram username" required className="w-full px-4 py-3 rounded-xl border border-gray-200" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200" />
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl font-bold text-white bg-violet-600 disabled:opacity-60">{busy ? 'Checking…' : 'Open QA view'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QA view</h1>
            <p className="text-sm text-gray-600">Logged in as @{user.telegramUsername.replace(/^@/, '')} · read-only</p>
          </div>
          <button onClick={logout} className="text-sm font-semibold underline text-gray-600">Log out</button>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('simulations')} className={`px-5 py-2.5 rounded-xl font-semibold ${tab === 'simulations' ? 'bg-violet-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>Simulations</button>
          <button onClick={() => setTab('accountability')} className={`px-5 py-2.5 rounded-xl font-semibold ${tab === 'accountability' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}>Accountability</button>
        </div>
        {tab === 'simulations' ? <SimulationsList /> : <AccountabilityTab />}
      </div>
    </div>
  )
}
