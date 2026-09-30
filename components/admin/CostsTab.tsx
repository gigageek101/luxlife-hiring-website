'use client'

import { useCallback, useEffect, useState } from 'react'

interface Totals {
  calls_today: number; cost_today: number; calls_week: number; cost_week: number
  calls_month: number; cost_month: number; calls_all: number; cost_all: number
  input_all: number; output_all: number; since: string | null
}
interface RouteRow { route: string; calls: number; cost: number; input_tokens: number; output_tokens: number; failures: number; last: string }
interface RecentRow { created_at: string; route: string; model: string; input_tokens: number; output_tokens: number; cache_read_tokens: number; cost_usd: number; status: string; detail: string | null }
interface Usage {
  creditStatus: { value: string; updatedAt: string | null }
  totals: Totals
  byRoute: RouteRow[]
  recent: RecentRow[]
  pricing: string
}

const money = (value: number) => `$${(value || 0).toFixed(value >= 1 ? 2 : 4)}`
const when = (value: string | null) => (value ? new Date(value).toLocaleString() : '—')

/** Claude API spend: per period, per route, recent calls, and the credit flag. */
export default function CostsTab() {
  const [usage, setUsage] = useState<Usage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/claude-usage', { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      setUsage(await response.json())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const check = async () => {
    setChecking(true)
    try {
      await fetch('/api/admin/claude-usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ping' }) })
      await load()
    } finally {
      setChecking(false)
    }
  }

  if (error) return <p className="text-red-600 font-semibold">Could not load costs: {error}</p>
  if (!usage) return <p className="text-gray-500">Loading costs…</p>
  const t = usage.totals
  const empty = usage.creditStatus.value === 'empty'
  const tiles = [
    ['Today', t.cost_today, t.calls_today], ['Last 7 days', t.cost_week, t.calls_week],
    ['Last 30 days', t.cost_month, t.calls_month], ['All time', t.cost_all, t.calls_all],
  ] as const

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-5 border-2 ${empty ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`font-black text-lg ${empty ? 'text-red-700' : 'text-green-800'}`}>
              {empty ? '🚨 Claude credit: EMPTY' : usage.creditStatus.value === 'ok' ? '✅ Claude credit: OK' : 'ℹ️ Claude credit: not checked yet'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Last confirmed {when(usage.creditStatus.updatedAt)} · Anthropic does not expose the remaining balance, so this reflects the last real call. Top up at console.anthropic.com when it turns red.
            </p>
          </div>
          <button onClick={check} disabled={checking} className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-gray-900 disabled:opacity-60">
            {checking ? 'Checking…' : 'Check now (one tiny call)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map(([label, cost, calls]) => (
          <div key={label} className="rounded-2xl p-4 bg-white border border-gray-200">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">{label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{money(cost)}</p>
            <p className="text-xs text-gray-500">{calls} calls</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {usage.pricing}. Tracked since {when(t.since)} · {Number(t.input_all).toLocaleString()} input and {Number(t.output_all).toLocaleString()} output tokens in total.
      </p>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-x-auto">
        <p className="px-4 pt-4 font-bold text-gray-800">Per route, last 30 days</p>
        <table className="w-full text-sm mt-2">
          <thead className="text-xs uppercase text-gray-500">
            <tr><th className="text-left px-4 py-2">Route</th><th className="text-right px-2">Calls</th><th className="text-right px-2">Failed</th><th className="text-right px-2">In tokens</th><th className="text-right px-2">Out tokens</th><th className="text-right px-4">Cost</th></tr>
          </thead>
          <tbody>
            {usage.byRoute.map((row) => (
              <tr key={row.route} className="border-t border-gray-100">
                <td className="px-4 py-2 font-semibold">{row.route}</td>
                <td className="text-right px-2">{row.calls}</td>
                <td className={`text-right px-2 ${row.failures ? 'text-red-600 font-bold' : ''}`}>{row.failures}</td>
                <td className="text-right px-2">{Number(row.input_tokens).toLocaleString()}</td>
                <td className="text-right px-2">{Number(row.output_tokens).toLocaleString()}</td>
                <td className="text-right px-4 font-bold">{money(row.cost)}</td>
              </tr>
            ))}
            {usage.byRoute.length === 0 && <tr><td className="px-4 py-3 text-gray-500" colSpan={6}>No Claude calls recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 overflow-x-auto">
        <p className="px-4 pt-4 font-bold text-gray-800">Last 25 calls</p>
        <table className="w-full text-sm mt-2">
          <thead className="text-xs uppercase text-gray-500">
            <tr><th className="text-left px-4 py-2">When</th><th className="text-left px-2">Route</th><th className="text-left px-2">Status</th><th className="text-right px-2">In</th><th className="text-right px-2">Out</th><th className="text-right px-4">Cost</th></tr>
          </thead>
          <tbody>
            {usage.recent.map((row, i) => (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-4 py-1.5 whitespace-nowrap">{when(row.created_at)}</td>
                <td className="px-2">{row.route}</td>
                <td className={`px-2 font-semibold ${row.status === 'ok' ? 'text-green-700' : 'text-red-600'}`} title={row.detail || ''}>{row.status}</td>
                <td className="text-right px-2">{row.input_tokens + row.cache_read_tokens}</td>
                <td className="text-right px-2">{row.output_tokens}</td>
                <td className="text-right px-4">{money(row.cost_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
