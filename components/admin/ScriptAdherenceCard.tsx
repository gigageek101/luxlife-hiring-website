'use client'

import { ScriptAdherence, getCategoryScoreColor } from '@/lib/sim-scoring'

interface Props {
  data: ScriptAdherence
  title?: string
  subtitle?: string
}

/** "Did they stick to the script?" block, used in the expanded report and on the user analytics page. */
export default function ScriptAdherenceCard({ data, title = 'Script adherence', subtitle }: Props) {
  const score = Number(data.score) || 0
  const color = getCategoryScoreColor(score)
  const followed = Array.isArray(data.followed) ? data.followed : []
  const deviations = Array.isArray(data.deviations) ? data.deviations : []
  return (
    <div className="rounded-xl p-4 md:p-5" style={{ background: `${color}0d`, border: `1px solid ${color}55` }}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg" style={{ background: `${color}22`, color }}>{score}</div>
        <div>
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm font-semibold capitalize" style={{ color }}>{data.verdict || ''}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-700 mb-1">Followed the script</p>
          {followed.length === 0 ? <p className="text-gray-500">Nothing followed as taught.</p> : (
            <ul className="space-y-1">{followed.map((f, i) => <li key={i} className="pl-3 border-l-2 border-green-400 text-gray-700">{f}</li>)}</ul>
          )}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1">Went off script</p>
          {deviations.length === 0 ? <p className="text-gray-500">No deviations.</p> : (
            <ul className="space-y-1">{deviations.map((d, i) => <li key={i} className="pl-3 border-l-2 border-red-400 text-gray-700">{d}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  )
}
