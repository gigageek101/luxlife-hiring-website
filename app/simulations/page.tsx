'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Flame, Heart, ArrowLeft, Zap } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import Reveal from '@/components/Reveal'
import Link from 'next/link'

const simulations = [
  {
    id: 'relationship',
    emoji: '💬',
    icon: MessageCircle,
    title: 'Relationship Building',
    description: 'Practice building genuine connections with subscribers. An AI subscriber messages you first — handle the conversation like a pro by making him feel special, asking the right questions, and tracking his details.',
    path: '/chattingsimulation',
    color: '#ff6b35',
    gradient: 'linear-gradient(135deg, #ff6b35, #e55a2b)',
    categories: [
      'Giving Him What He Wants to Hear (25 pts)',
      'Making the Subscriber Feel Special (20 pts)',
      'Caring About the Subscriber (15 pts)',
      'Asking the Right Questions (15 pts)',
      'American Accent & Texting Style (10 pts)',
      'Grammar & Natural Flow (10 pts)',
      'Note-Taking & Information Tracking (5 pts)',
    ],
  },
  {
    id: 'sexting',
    emoji: '🔥',
    icon: Flame,
    title: 'Sexting & PPV Sales',
    description: 'Master the PPV selling framework in a realistic sexting simulation. Follow the exact framework order — voice memos, PPVs, teasers, and follow-ups — to convert desire into purchases.',
    path: '/chattingsimulation2',
    color: '#e11d48',
    gradient: 'linear-gradient(135deg, #e11d48, #be123c)',
    categories: [
      'Correct Framework Order (35 pts)',
      'Language Mirroring (30 pts)',
      'Tension Building Between PPVs (25 pts)',
      'Response Speed & Engagement (10 pts)',
    ],
  },
  {
    id: 'aftercare',
    emoji: '💗',
    icon: Heart,
    title: 'Aftercare',
    description: 'Practice the soft landing that keeps subscribers coming back. Handle post-PPV emotional moments using the 5-stage aftercare flow — from the Breath Moment to Next Day Re-Entry.',
    path: '/chattingsimulation3',
    color: '#e84393',
    gradient: 'linear-gradient(135deg, #e84393, #d63384)',
    categories: [
      'Emotional Authenticity & Vulnerability (25 pts)',
      'Personalization Using His Notes (22 pts)',
      'Name Usage & Intimacy Anchoring (18 pts)',
      'Re-engagement Seed Planting (15 pts)',
      'Texting Style & Casual American Flow (10 pts)',
      'Pacing & Message Timing (7 pts)',
      'No Hard-Sell / No Desperation (3 pts)',
    ],
  },
  {
    id: 'combined',
    emoji: '⚡',
    icon: Zap,
    title: 'Full Session (All 3 Stages)',
    description: 'The ultimate test — 35 minutes combining Relationship Building, Sexting & PPV Sales, and Aftercare in one continuous conversation with random objections. Same subscriber, full journey.',
    path: '/chattingsimulation4',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    categories: [
      'Relationship Building Quality (12 pts)',
      'Subscriber Engagement (10 pts)',
      'Sexting Framework Execution (15 pts)',
      'Language Mirroring (12 pts)',
      'Tension Building (10 pts)',
      'Aftercare Emotional Quality (12 pts)',
      'Objection Handling (10 pts)',
      'Stage Transitions (7 pts)',
      'American Texting Style (7 pts)',
      'Note-Taking & Consistency (5 pts)',
    ],
  },
]

export default function SimulationsPortal() {
  return (
    <div className="min-h-screen relative">
      <DynamicBackground />

      <section className="section pt-32 md:pt-40 relative z-10">
        <div className="container max-w-5xl">
          <Reveal>
            <div className="text-center mb-4">
              <Link
                href="/training"
                className="inline-flex items-center gap-2 text-sm font-medium mb-6 px-4 py-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Training
              </Link>
              <h1 className="mb-4">Simulation Portal</h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary-on-white)' }}>
                Practice against AI-powered subscribers. Each session is scored out of 100 with detailed feedback. Run as many rounds as you need — target is 80+.
              </p>
            </div>
          </Reveal>

          <div className="space-y-6 mt-12">
            {simulations.map((sim, index) => {
              const Icon = sim.icon
              return (
                <motion.div
                  key={sim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Link href={sim.path} className="block group">
                    <div
                      className="card hover-lift hover-glow overflow-hidden"
                      style={{ border: `1px solid ${sim.color}25` }}
                    >
                      <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
                        <div className="flex-shrink-0 flex items-start justify-center md:justify-start">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: sim.gradient }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h2
                            className="text-2xl font-bold mb-2 group-hover:opacity-80 transition-opacity"
                            style={{ color: sim.color }}
                          >
                            {sim.emoji} {sim.title}
                          </h2>
                          <p className="mb-4" style={{ color: 'var(--text-secondary-on-white)' }}>
                            {sim.description}
                          </p>

                          <div className="mb-4">
                            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted-on-white)' }}>
                              Scoring Categories
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sim.categories.map((cat) => (
                                <span
                                  key={cat}
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ background: `${sim.color}10`, color: sim.color, border: `1px solid ${sim.color}20` }}
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-300" style={{ color: sim.color }}>
                            Start Simulation
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 card glass-card text-center"
          >
            <h3 className="text-xl font-semibold mb-3">How to Improve</h3>
            <div className="space-y-2" style={{ color: 'var(--text-secondary-on-white)' }}>
              <p>1. Run a simulation and get your score</p>
              <p>2. Read the detailed report — note your weak points</p>
              <p>3. Re-read the guide for those specific areas</p>
              <p>4. Run it again. Repeat until you hit 80+</p>
            </div>
            <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--accent)' }}>
              No time limit. Unlimited attempts. The only way to fail is to stop trying.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
