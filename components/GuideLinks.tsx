import Link from 'next/link'
import { guideBySlug, guidesForStep } from '@/lib/guides'

interface Props {
  /** Extra guides that belong to this simulation, shown above the Step 2 list. */
  alsoRead?: string[]
}

/** Box under a simulation's "Read the Guide First" block: extra guides for this simulation + the Step 2 guides. */
export default function GuideLinks({ alsoRead = [] }: Props) {
  const extra = alsoRead.map(guideBySlug).filter((guide): guide is NonNullable<typeof guide> => Boolean(guide))
  const stepTwo = guidesForStep('general')
  const linkStyle = { color: 'var(--accent)' }

  return (
    <div className="max-w-2xl mx-auto rounded-2xl p-6 mb-8 text-left" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      {extra.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Also read for this simulation:</p>
          <ul className="space-y-1">
            {extra.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="text-sm font-medium underline" style={linkStyle}>
                  {guide.emoji} {guide.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Also check out the Step 2 guides:</p>
      <ul className="space-y-1">
        {stepTwo.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="text-sm font-medium underline" style={linkStyle}>
              {guide.emoji} {guide.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm mt-4" style={{ color: 'var(--text-secondary)' }}>
        <Link href="/guides" className="font-semibold underline" style={linkStyle}>All chatting guides (Steps 1 to 3) →</Link>
      </p>
    </div>
  )
}
