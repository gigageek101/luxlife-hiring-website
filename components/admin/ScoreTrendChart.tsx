'use client'

import { getScoreColor } from '@/lib/sim-scoring'
import { linearFit, ScorePoint } from '@/lib/user-analytics'

interface Props {
  points: ScorePoint[]
  max?: number
  colorFor?: (score: number) => string
}

const W = 640
const H = 240
const PAD = { l: 38, r: 14, t: 14, b: 34 }

const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' })

/** Dependency-free SVG line chart: one dot per session, dashed least-squares trend line. */
export default function ScoreTrendChart({ points, max = 100, colorFor }: Props) {
  if (points.length === 0) return <p className="text-sm text-gray-500">No sessions yet.</p>
  const color = colorFor || ((s: number) => getScoreColor(max === 10 ? s * 10 : s))
  const innerW = W - PAD.l - PAD.r
  const innerH = H - PAD.t - PAD.b
  const x = (i: number) => PAD.l + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v: number) => PAD.t + innerH - (Math.max(0, Math.min(max, v)) / max) * innerH
  const fit = linearFit(points.map((p) => p.score))
  const gridSteps = max === 10 ? [0, 2.5, 5, 7.5, 10] : [0, 25, 50, 75, 100]
  const labelEvery = Math.max(1, Math.ceil(points.length / 7))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Score over time">
      {gridSteps.map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="#e5e7eb" strokeWidth={1} />
          <text x={PAD.l - 6} y={y(g) + 4} fontSize={11} fill="#9ca3af" textAnchor="end">{g}</text>
        </g>
      ))}
      {points.length >= 2 && (
        <line x1={x(0)} y1={y(fit.intercept)} x2={x(points.length - 1)} y2={y(fit.intercept + fit.slope * (points.length - 1))} stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 5" opacity={0.7} />
      )}
      {points.length >= 2 && (
        <polyline fill="none" stroke="#111827" strokeWidth={2} strokeLinejoin="round" points={points.map((p, i) => `${x(i)},${y(p.score)}`).join(' ')} />
      )}
      {points.map((p, i) => (
        <g key={p.id}>
          <circle cx={x(i)} cy={y(p.score)} r={6} fill={color(p.score)} stroke="#fff" strokeWidth={2}>
            <title>{`${new Date(p.date).toLocaleString()}: ${p.score}`}</title>
          </circle>
          <text x={x(i)} y={y(p.score) - 10} fontSize={11} fontWeight={700} fill={color(p.score)} textAnchor="middle">{p.score}</text>
          {(i % labelEvery === 0 || i === points.length - 1) && (
            <text x={x(i)} y={H - 10} fontSize={11} fill="#6b7280" textAnchor="middle">{shortDate(p.date)}</text>
          )}
        </g>
      ))}
    </svg>
  )
}
