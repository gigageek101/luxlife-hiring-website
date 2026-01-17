'use client'

import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface JobSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function JobSelectionModal({ isOpen, onClose }: JobSelectionModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleJobSelect = (jobType: 'chatter' | 'marketing') => {
    if (jobType === 'chatter') {
      router.push('/apply')
    } else {
      router.push('/applyformarketing')
    }
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-8"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-opacity-10"
          style={{ color: 'var(--text-primary)' }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Choose Your Position
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Select the role that best matches your skills and interests
          </p>
        </div>

        {/* Job Options */}
        <div className="space-y-4">
          {/* Chatter Position */}
          <button
            onClick={() => handleJobSelect('chatter')}
            className="w-full text-left p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ 
              borderColor: '#ff6b00',
              background: 'var(--bg-primary)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: '#ff6b00' }}
              >
                💬
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  OnlyFans Chatter
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Engage with subscribers through messages to build relationships and drive revenue.
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>Professional messaging and subscriber engagement</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>Performance-based compensation structure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>Fast-paced, communication-focused role</span>
                  </li>
                </ul>
              </div>
            </div>
          </button>

          {/* Marketing Position */}
          <button
            onClick={() => handleJobSelect('marketing')}
            className="w-full text-left p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ 
              borderColor: '#ff6b00',
              background: 'var(--bg-primary)'
            }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: '#ff6b00' }}
              >
                🎬
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  AI Reels Creator & Marketing Specialist
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Create engaging AI-generated content and manage social media marketing campaigns.
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>AI-powered video content creation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>Social media marketing and campaign management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: '#ff6b00' }}>✓</span>
                    <span>Creative, tech-focused role with latest AI tools</span>
                  </li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid #ff6b00' }}>
          <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            💡 Not sure which role fits you best? Both positions offer great opportunities. Choose the one that excites you most!
          </p>
        </div>
      </div>
    </div>
  )
}
