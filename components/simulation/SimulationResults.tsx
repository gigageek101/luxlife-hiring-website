'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SimulationConfig } from '@/lib/simulations'
import { weightedScore } from '@/lib/simulations'

export interface Category {
  name: string
  score: number
  feedback: string
  examples?: { good?: string[]; needsWork?: string[] }
  advice?: string
}
export interface Evaluation {
  categories: Category[]
  overallFeedback: {
    strengths?: string[]
    weaknesses?: string[]
    missedOpportunities?: string[]
    practiceScenarios?: string[]
    summary?: string
    objectionsHandled?: { objection: string; handled: string; note: string }[]
  }
}
interface Message { role: string; content: string }

const scoreColor = (score: number) => (score >= 8 ? '#16a34a' : score >= 6 ? '#f59e0b' : '#dc2626')

function ListBlock({ title, items, tone }: { title: string; items?: string[]; tone: string }) {
  if (!items || items.length === 0) return null
  return (
    <div className="rounded-2xl p-5" style={{ background: tone, border: '1px solid var(--border)' }}>
      <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
        {items.map((item, i) => <li key={i} className="flex gap-2"><span>•</span><span>{item}</span></li>)}
      </ul>
    </div>
  )
}

function CategoryCard({ cat, weight }: { cat: Category; weight: number }) {
  const [open, setOpen] = useState(false)
  const earned = Math.round((cat.score / 10) * weight * 10) / 10
  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--bg-secondary)', border: `2px solid ${open ? scoreColor(cat.score) : 'var(--border)'}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 text-left">
        <span className="text-3xl font-black w-12" style={{ color: scoreColor(cat.score) }}>{cat.score}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cat.name}</p>
          <div className="h-1.5 rounded-full mt-1.5" style={{ background: 'var(--border)' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${cat.score * 10}%`, background: scoreColor(cat.score) }} />
          </div>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap" style={{ color: scoreColor(cat.score) }}>{earned} / {weight}</span>
      </button>
      {open && (
        <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
          <p>{cat.feedback}</p>
          {cat.examples?.good?.length ? <p><span className="font-bold text-green-700">Good: </span>{cat.examples.good.join(' · ')}</p> : null}
          {cat.examples?.needsWork?.length ? <p><span className="font-bold text-red-600">Needs work: </span>{cat.examples.needsWork.join(' · ')}</p> : null}
          {cat.advice && <p className="rounded-xl p-3" style={{ background: 'rgba(255,107,0,0.08)' }}><span className="font-bold">Advice: </span>{cat.advice}</p>}
        </div>
      )}
    </div>
  )
}

/** Results screen shared by the practice simulations. */
export default function SimulationResults({ config, evaluation, messages, onRestart }: { config: SimulationConfig; evaluation: Evaluation; messages: Message[]; onRestart: () => void }) {
  const total = weightedScore(evaluation.categories, config.categoryWeights)
  const fb = evaluation.overallFeedback || {}
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="text-center rounded-3xl p-8" style={{ background: config.gradient, color: '#fff' }}>
        <p className="text-sm uppercase tracking-widest opacity-80">{config.emoji} {config.title}</p>
        <p className="text-6xl font-black mt-2">{total}<span className="text-2xl opacity-80">/100</span></p>
        <p className="mt-3 max-w-2xl mx-auto opacity-95">{fb.summary}</p>
      </div>
      <div className="space-y-3">
        {evaluation.categories.map((cat) => <CategoryCard key={cat.name} cat={cat} weight={config.categoryWeights[cat.name] ?? 0} />)}
      </div>
      {fb.objectionsHandled && fb.objectionsHandled.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>His objections and how you handled them</p>
          <ul className="space-y-2 text-sm">
            {fb.objectionsHandled.map((o, i) => (
              <li key={i} className="rounded-xl p-3" style={{ background: o.handled === 'good' ? '#f0fdf4' : o.handled === 'weak' ? '#fffbeb' : '#fef2f2' }}>
                <p className="font-semibold">{o.handled === 'good' ? '✅' : o.handled === 'weak' ? '⚠️' : '❌'} “{o.objection}”</p>
                <p style={{ color: 'var(--text-secondary)' }}>{o.note}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        <ListBlock title="✅ Strengths" items={fb.strengths} tone="#f0fdf4" />
        <ListBlock title="⚠️ Weaknesses" items={fb.weaknesses} tone="#fff7ed" />
        <ListBlock title="💡 Missed opportunities" items={fb.missedOpportunities} tone="#eff6ff" />
        <ListBlock title="🎯 Practice next" items={fb.practiceScenarios} tone="#faf5ff" />
      </div>
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <p className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Your conversation</p>
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-2">
          {messages.filter((m) => m.role !== 'system').map((m, i) => (
            <div key={i} className={`flex ${m.role === 'creator' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm" style={{ background: m.role === 'creator' ? config.color : '#fff', color: m.role === 'creator' ? '#fff' : '#000', border: m.role === 'creator' ? 'none' : '1px solid var(--border)' }}>{m.content}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={onRestart} className="px-8 py-3 rounded-xl font-bold text-white" style={{ background: config.gradient }}>Try again</button>
        <Link href={`/guides/${config.guideSlug}`} className="px-8 py-3 rounded-xl font-bold" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>Re-read the {config.guideTitle}</Link>
        <Link href="/simulations" className="px-8 py-3 rounded-xl font-bold" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>All simulations</Link>
      </div>
    </div>
  )
}
