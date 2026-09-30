import { readFileSync } from 'fs'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import '../guide.css'

export const dynamic = 'force-static'
export const dynamicParams = false

// Guides are converted from Notion exports with scripts/convert-notion-guide.py
// into content/guides/<slug>.html (images under public/guides/<slug>/).
const GUIDES: Record<string, { title: string; simulation: string; simulationLabel: string }> = {
  'relationship-building': {
    title: 'Complete PRACTICAL Subscriber Relationship Building Guide',
    simulation: '/chattingsimulation',
    simulationLabel: 'Relationship Building Simulation',
  },
  sexting: {
    title: 'Sexting Guide',
    simulation: '/chattingsimulation2',
    simulationLabel: 'Sexting & PPV Simulation',
  },
}

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const guide = GUIDES[params.slug]
  return {
    title: guide ? `${guide.title} | LuxLife Training` : 'Guide',
    robots: { index: false, follow: false },
  }
}

export default function GuidePage({ params }: Params) {
  const guide = GUIDES[params.slug]
  if (!guide) notFound()
  const html = readFileSync(path.join(process.cwd(), 'content', 'guides', `${params.slug}.html`), 'utf8')

  return (
    <main className="guide-page">
      <div className="guide-container">
        <Link href={guide.simulation} className="guide-back">← Back to the {guide.simulationLabel}</Link>
        <h1 className="guide-title">{guide.title}</h1>
        <article className="guide" dangerouslySetInnerHTML={{ __html: html }} />
        <Link href={guide.simulation} className="guide-back guide-back-bottom">← Back to the {guide.simulationLabel}</Link>
      </div>
    </main>
  )
}
