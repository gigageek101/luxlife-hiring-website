import Link from 'next/link'
import type { Metadata } from 'next'
import { GUIDES, STEP_INFO, STEP_ORDER, guidesForStep } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Chatting Skills Guides | LuxLife Training',
  robots: { index: false, follow: false },
}

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen pt-24 pb-16" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>⛺ Chatting Skills</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>All Chatting Guides</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {GUIDES.length} guides in three steps. Read Step 1 before its simulation, Step 2 before you chat with real subscribers, Step 3 to push your daily score to 100.
          </p>
          <p className="mt-4">
            <Link href="/simulations" className="font-semibold underline" style={{ color: 'var(--accent)' }}>Go to the simulations →</Link>
          </p>
        </div>

        {STEP_ORDER.map((step) => {
          const info = STEP_INFO[step]
          const guides = guidesForStep(step)
          return (
            <section key={step} id={info.anchor} className="mb-12 scroll-mt-28">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{info.title}</h2>
              <p className="mb-5" style={{ color: 'var(--text-secondary)' }}>{info.subtitle}</p>
              <div className="grid gap-4 md:grid-cols-2">
                {guides.map((guide) => (
                  <Link
                    key={guide.slug}
                    href={`/guides/${guide.slug}`}
                    className="block rounded-2xl p-5 transition-all hover:scale-[1.01]"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none">{guide.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>{guide.title.replace(/^💖 /, '')}</p>
                        {guide.simulationLabel && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Practice: {guide.simulationLabel}</p>
                        )}
                        {typeof guide.points === 'number' && (
                          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--accent)' }}>{guide.points} pts of your 100 score</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
