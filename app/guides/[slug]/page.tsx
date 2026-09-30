import { readFileSync } from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { GUIDES, STEP_INFO, guideBySlug } from '@/lib/guides'
import ReadingProgress from '@/components/ReadingProgress'
import GuideGate from '@/components/GuideGate'
import '../guide.css'

export const dynamic = 'force-static'
export const dynamicParams = false

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const guide = guideBySlug(params.slug)
  return {
    title: guide ? `${guide.title} | LuxLife Training` : 'Guide',
    robots: { index: false, follow: false },
  }
}

export default function GuidePage({ params }: Params) {
  const guide = guideBySlug(params.slug)
  if (!guide) notFound()
  const html = readFileSync(path.join(process.cwd(), 'content', 'guides', `${guide.slug}.html`), 'utf8')
  const step = STEP_INFO[guide.step]

  return (
    <main className="guide-page">
      <ReadingProgress />
      <div className="guide-container">
        <nav className="guide-nav">
          <Link href={`/guides#${step.anchor}`} className="guide-back">← All guides · {step.title}</Link>
          {guide.simulation && (
            <Link href={guide.simulation} className="guide-practice">Practice: {guide.simulationLabel} →</Link>
          )}
        </nav>
        <h1 className="guide-title">{guide.emoji} {guide.title.replace(/^💖 /, '')}</h1>
        <GuideGate slug={guide.slug} html={html} />
        <nav className="guide-nav guide-nav-bottom">
          <Link href={`/guides#${step.anchor}`} className="guide-back">← All guides</Link>
          {guide.simulation && (
            <Link href={guide.simulation} className="guide-practice">Practice: {guide.simulationLabel} →</Link>
          )}
        </nav>
      </div>
    </main>
  )
}
