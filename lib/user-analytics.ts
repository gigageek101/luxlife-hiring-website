// Pure computations for the per-user analytics page (trend, categories, weakness, script adherence).
import { OverallFeedback, ScriptAdherence, SimCategory, calculateWeightedScore, getSimTypeLabel } from '@/lib/sim-scoring'

export interface AnalyticsReport {
  id: number
  simulationType: string
  completedAt: string
  categories: SimCategory[]
  overallFeedback: OverallFeedback | null
  notes: string
  messageCount: number
  typedCount: number
  pasteCount: number
  wpm: number
  durationMode: string
}

export type Direction = 'improving' | 'declining' | 'flat' | 'new'

export interface Trend {
  direction: Direction
  delta: number
  firstAvg: number
  lastAvg: number
  text: string
}

export interface ScorePoint { id: number; date: string; score: number }

export interface CategoryTrend {
  name: string
  scores: number[]
  avg: number
  latest: number
  trend: Trend
  latestFeedback: string
  latestAdvice: string
  needsWork: string[]
}

export interface AdherenceSummary {
  count: number
  avg: number
  verdict: string
  latest: ScriptAdherence
  series: ScorePoint[]
  trend: Trend
}

export interface TypeAnalysis {
  type: string
  label: string
  count: number
  series: ScorePoint[]
  avg: number
  best: number
  latest: number
  trend: Trend
  categories: CategoryTrend[]
  biggestWeakness: CategoryTrend | null
  recurringWeaknesses: string[]
  adherence: AdherenceSummary | null
}

const round1 = (n: number) => Math.round(n * 10) / 10
const avg = (xs: number[]) => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : 0)

/** Compares the first k sessions with the last k (k = up to 3). `unit` sets the threshold scale (100-point score vs 10-point category). */
export function computeTrend(values: number[], unit: 'score' | 'category' = 'score'): Trend {
  const n = values.length
  if (n < 2) return { direction: 'new', delta: 0, firstAvg: avg(values), lastAvg: avg(values), text: n === 0 ? 'No sessions yet.' : 'Only one session so far. At least two are needed to see a direction.' }
  const k = Math.max(1, Math.min(3, Math.floor(n / 2)))
  const firstAvg = avg(values.slice(0, k))
  const lastAvg = avg(values.slice(n - k))
  const delta = round1(lastAvg - firstAvg)
  const threshold = unit === 'score' ? 5 : 1
  const direction: Direction = delta >= threshold ? 'improving' : delta <= -threshold ? 'declining' : 'flat'
  const span = k === 1 ? 'first vs last session' : `first ${k} vs last ${k} sessions`
  const sign = delta > 0 ? '+' : ''
  const word = direction === 'improving' ? 'Improving' : direction === 'declining' ? 'Declining' : 'Flat'
  return { direction, delta, firstAvg, lastAvg, text: `${word}: ${firstAvg} → ${lastAvg} (${sign}${delta}) over ${n} sessions, ${span}.` }
}

/** Least-squares slope per session, for the dashed trend line in the chart. */
export function linearFit(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] ?? 0 }
  const xs = values.map((_, i) => i)
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = values.reduce((a, b) => a + b, 0) / n
  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (values[i] - my)
    den += (xs[i] - mx) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  return { slope, intercept: my - slope * mx }
}

export function adherenceVerdict(score: number): string {
  if (score >= 8.5) return 'Sticks to the script'
  if (score >= 7) return 'Mostly on script'
  if (score >= 4) return 'Partly off script'
  return 'Off script'
}

/** Types present for this user, most-practised first. */
export function typesWithData(reports: AnalyticsReport[]): string[] {
  const counts = new Map<string, number>()
  for (const r of reports) counts.set(r.simulationType, (counts.get(r.simulationType) || 0) + 1)
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([t]) => t)
}

function categoryTrends(reports: AnalyticsReport[]): CategoryTrend[] {
  const byName = new Map<string, { scores: number[]; feedback: string; advice: string; needsWork: string[] }>()
  for (const r of reports) {
    for (const c of r.categories) {
      const entry = byName.get(c.name) || { scores: [], feedback: '', advice: '', needsWork: [] }
      entry.scores.push(c.score)
      entry.feedback = c.feedback || entry.feedback
      entry.advice = c.advice || entry.advice
      if (c.examples?.needsWork?.length) entry.needsWork = c.examples.needsWork.filter((e) => e.trim())
      byName.set(c.name, entry)
    }
  }
  return Array.from(byName.entries())
    .map(([name, e]) => ({ name, scores: e.scores, avg: avg(e.scores), latest: e.scores[e.scores.length - 1], trend: computeTrend(e.scores, 'category'), latestFeedback: e.feedback, latestAdvice: e.advice, needsWork: e.needsWork.slice(0, 3) }))
    .sort((a, b) => a.avg - b.avg)
}

function adherenceSummary(reports: AnalyticsReport[]): AdherenceSummary | null {
  const withData = reports.filter((r) => r.overallFeedback?.scriptAdherence && Number.isFinite(Number(r.overallFeedback.scriptAdherence.score)))
  if (withData.length === 0) return null
  const series = withData.map((r) => ({ id: r.id, date: r.completedAt, score: Number(r.overallFeedback!.scriptAdherence!.score) }))
  const scores = series.map((s) => s.score)
  const mean = avg(scores)
  return { count: withData.length, avg: mean, verdict: adherenceVerdict(mean), latest: withData[withData.length - 1].overallFeedback!.scriptAdherence!, series, trend: computeTrend(scores, 'category') }
}

export function analyzeType(allReports: AnalyticsReport[], type: string): TypeAnalysis {
  const reports = allReports.filter((r) => r.simulationType === type).sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime() || a.id - b.id)
  const series = reports.map((r) => ({ id: r.id, date: r.completedAt, score: calculateWeightedScore(r.categories, type) }))
  const scores = series.map((s) => s.score)
  const categories = categoryTrends(reports)
  const recurring = reports.slice(-3).reverse().flatMap((r) => r.overallFeedback?.weaknesses || []).filter((w) => typeof w === 'string' && w.trim())
  return {
    type,
    label: getSimTypeLabel(type),
    count: reports.length,
    series,
    avg: avg(scores),
    best: scores.length ? Math.max(...scores) : 0,
    latest: scores.length ? scores[scores.length - 1] : 0,
    trend: computeTrend(scores, 'score'),
    categories,
    biggestWeakness: categories[0] || null,
    recurringWeaknesses: Array.from(new Set(recurring)).slice(0, 5),
    adherence: adherenceSummary(reports),
  }
}
