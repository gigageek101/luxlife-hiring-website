// "Made today / yesterday" helpers for the admin lists. Buckets use the viewer's local timezone.

export type DayBucket = 'today' | 'yesterday' | 'week' | 'older'

export const DAY_BUCKETS: DayBucket[] = ['today', 'yesterday', 'week', 'older']

export const DAY_BUCKET_LABELS: Record<DayBucket, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'Last 7 days',
  older: 'Older',
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function dayBucket(iso: string, now: Date = new Date()): DayBucket {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return 'older'
  const today = startOfDay(now)
  const dayMs = 24 * 60 * 60 * 1000
  if (t >= today) return 'today'
  if (t >= today - dayMs) return 'yesterday'
  if (t >= today - 7 * dayMs) return 'week'
  return 'older'
}

const SHORT_DATE: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }
const LONG_DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

/** "Today, 14:32" / "Yesterday, 09:10" / "Mon 28 Sep, 14:32" / "3 Aug 2026, 14:32". `short` drops the time. */
export function relativeDateLabel(iso: string, short = false, now: Date = new Date()): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  const bucket = dayBucket(iso, now)
  const time = d.toLocaleTimeString([], TIME)
  const day = bucket === 'today' ? 'Today' : bucket === 'yesterday' ? 'Yesterday' : bucket === 'week' ? d.toLocaleDateString([], SHORT_DATE) : d.toLocaleDateString([], LONG_DATE)
  return short ? day : `${day}, ${time}`
}
