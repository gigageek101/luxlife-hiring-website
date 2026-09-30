'use client'

import { useCallback, useEffect, useState } from 'react'

interface UsageStatus {
  creditStatus: { value: string; updatedAt: string | null }
  lastFailure: { created_at: string; route: string; status: string; detail: string | null } | null
}

/** Red banner when the Claude account is out of credit, amber when the last call failed recently. */
export default function ClaudeCreditBanner() {
  const [status, setStatus] = useState<UsageStatus | null>(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/claude-usage', { cache: 'no-store' })
      if (response.ok) setStatus(await response.json())
    } catch {
      /* keep the previous state */
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60000)
    return () => clearInterval(timer)
  }, [load])

  const check = async () => {
    setChecking(true)
    try {
      const response = await fetch('/api/admin/claude-usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ping' }) })
      const data = await response.json()
      setCheckResult(data.ok ? 'Claude answered. Credit is fine again.' : `Still failing: ${data.error || `HTTP ${data.status}`}`)
      await load()
    } finally {
      setChecking(false)
    }
  }

  if (!status) return null
  const empty = status.creditStatus.value === 'empty'
  const failure = status.lastFailure
  const recentFailure = failure && failure.status !== 'refusal' && Date.now() - new Date(failure.created_at).getTime() < 15 * 60 * 1000
  if (!empty && !recentFailure) return null

  return (
    <div className={`rounded-2xl p-4 md:p-5 mb-6 border-2 ${empty ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-400'}`}>
      <p className={`font-black text-lg ${empty ? 'text-red-700' : 'text-amber-800'}`}>
        {empty ? '🚨 Claude API credit is EMPTY. Simulations and grading are failing for everyone.' : '⚠️ The last Claude call failed.'}
      </p>
      <p className={`text-sm mt-1 ${empty ? 'text-red-800' : 'text-amber-900'}`}>
        {empty
          ? 'Top up at console.anthropic.com → Plans & Billing, then press "Check again". The same key keeps working after the top-up.'
          : `${failure?.route}: ${failure?.status}${failure?.detail ? ` — ${failure.detail.slice(0, 160)}` : ''}`}
      </p>
      <div className="flex items-center gap-3 mt-3">
        <button onClick={check} disabled={checking} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: empty ? '#dc2626' : '#d97706' }}>
          {checking ? 'Checking…' : 'Check again'}
        </button>
        {checkResult && <span className="text-sm font-semibold">{checkResult}</span>}
      </div>
    </div>
  )
}
