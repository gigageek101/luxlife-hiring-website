'use client'

import Link from 'next/link'
import { Lock, ArrowRight, Home } from 'lucide-react'

interface PositionClosedNoticeProps {
  closedPosition: 'backend' | 'marketing'
  otherPositionOpen: boolean
}

const positionMeta = {
  backend: {
    title: 'Backend – Customer Satisfaction',
    emoji: '💬',
  },
  marketing: {
    title: 'Frontend – Marketing',
    emoji: '🎬',
  },
} as const

const otherMeta = {
  backend: {
    title: 'Frontend – Marketing',
    description:
      'Creative content creation and marketing campaigns using cutting-edge AI tools.',
    href: '/applyformarketing',
    emoji: '🎬',
  },
  marketing: {
    title: 'Backend – Customer Satisfaction',
    description:
      'Direct customer interaction, relationship building, and professional communication.',
    href: '/apply',
    emoji: '💬',
  },
} as const

export default function PositionClosedNotice({
  closedPosition,
  otherPositionOpen,
}: PositionClosedNoticeProps) {
  const closed = positionMeta[closedPosition]
  const other = otherMeta[closedPosition]

  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-2xl w-full">
        <div
          className="rounded-2xl border-2 p-6 sm:p-10 text-center shadow-xl"
          style={{
            borderColor: '#ff6b00',
            background: 'var(--surface)',
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255, 107, 0, 0.12)' }}
          >
            <Lock className="w-10 h-10" style={{ color: '#ff6b00' }} />
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Sorry — we&apos;re not currently hiring for this position
          </h1>

          <p
            className="text-base sm:text-lg mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            The <strong>{closed.emoji} {closed.title}</strong> role is
            temporarily closed to new applicants.
          </p>

          {otherPositionOpen ? (
            <>
              <p
                className="text-base sm:text-lg mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Good news — we <strong style={{ color: '#ff6b00' }}>are</strong>{' '}
                still hiring for another position that might be a great fit for
                you:
              </p>

              <div
                className="rounded-xl border-2 p-5 sm:p-6 mb-6 text-left"
                style={{
                  borderColor: '#ff6b00',
                  background: 'rgba(255, 107, 0, 0.05)',
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center text-3xl"
                    style={{ background: '#ff6b00' }}
                  >
                    {other.emoji}
                  </div>
                  <div>
                    <div
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {other.title}
                    </div>
                    <div
                      className="text-sm sm:text-base"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {other.description}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={other.href}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ background: '#ff6b00' }}
              >
                Apply Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <p
                className="text-base sm:text-lg mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                All of our open roles are currently paused. Please check back
                with us soon — we&apos;d love to hear from you when hiring
                reopens.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base border-2 transition-all hover:scale-105"
                style={{
                  borderColor: '#ff6b00',
                  color: '#ff6b00',
                  background: 'transparent',
                }}
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
