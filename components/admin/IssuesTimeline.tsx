'use client'

import { getCategoryScoreColor } from '@/lib/sim-scoring'
import { AnalyticsReport, FLAG_THRESHOLD, ISSUE_STATUS_LABEL, IssueStatus, issuesTimeline, weaknessLog } from '@/lib/user-analytics'
import { relativeDateLabel } from '@/lib/dates'

const STATUS_STYLE: Record<IssueStatus, { bg: string; color: string }> = {
  still: { bg: '#fee2e2', color: '#b91c1c' },
  new: { bg: '#ffedd5', color: '#c2410c' },
  fixed: { bg: '#d1fae5', color: '#047857' },
  ok: { bg: '#f3f4f6', color: '#4b5563' },
}

const shortDate = (iso: string) => new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' })

/** Heatmap of category scores per session plus the grader's written weaknesses, so recurring issues are visible at a glance. */
export default function IssuesTimeline({ reports }: { reports: AnalyticsReport[] }) {
  const { sessions, rows } = issuesTimeline(reports)
  const log = weaknessLog(reports)
  const flaggedRows = rows.filter((r) => r.status !== 'ok')
  if (sessions.length === 0) return <p className="text-sm text-gray-500">No sessions yet.</p>

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-500">
        One column per session (oldest left, newest right), one row per category. A score of {FLAG_THRESHOLD} or less counts as an issue.
        {reports.length > sessions.length ? ` Showing the last ${sessions.length} of ${reports.length} sessions.` : ''}
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-gray-500 pb-2 pr-3">Category</th>
              {sessions.map((s) => <th key={s.id} className="font-semibold text-gray-500 pb-2 px-1 text-xs whitespace-nowrap">{shortDate(s.date)}</th>)}
              <th className="text-left font-semibold text-gray-500 pb-2 pl-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const st = STATUS_STYLE[row.status]
              return (
                <tr key={row.name} className="border-t border-gray-100">
                  <td className="py-1.5 pr-3 font-semibold text-gray-900 whitespace-nowrap">{row.name}</td>
                  {row.cells.map((cell) => (
                    <td key={cell.id} className="py-1.5 px-1 text-center">
                      {cell.score === null ? <span className="text-gray-300">·</span> : (
                        <span className="inline-flex w-8 h-8 items-center justify-center rounded-lg font-black text-xs" style={{ background: `${getCategoryScoreColor(cell.score)}22`, color: getCategoryScoreColor(cell.score), boxShadow: cell.score <= FLAG_THRESHOLD ? `inset 0 0 0 2px ${getCategoryScoreColor(cell.score)}` : 'none' }}>{cell.score}</span>
                      )}
                    </td>
                  ))}
                  <td className="py-1.5 pl-3 whitespace-nowrap">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: st.bg, color: st.color }}>{ISSUE_STATUS_LABEL[row.status]}{row.flaggedCount > 0 ? ` · ${row.flaggedCount}×` : ''}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {flaggedRows.length === 0 && <p className="text-sm font-semibold text-green-700">No category has dropped to {FLAG_THRESHOLD} or below in these sessions.</p>}
      {log.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">What the grader flagged, session by session (newest first)</p>
          <div className="space-y-3">
            {log.map((entry) => (
              <div key={entry.id} className="rounded-xl p-3 bg-gray-50 border border-gray-100">
                <p className="text-xs font-bold text-gray-700 mb-1">{relativeDateLabel(entry.date)}</p>
                <ul className="space-y-1">{entry.weaknesses.map((w, i) => <li key={i} className="pl-3 border-l-2 border-red-300 text-sm text-gray-700">{w}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
