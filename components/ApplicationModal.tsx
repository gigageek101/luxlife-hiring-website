'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, MessageCircle } from 'lucide-react'

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApplicationModal({ isOpen, onClose }: ApplicationModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleChoice = (path: string) => {
    onClose()
    router.push(path)
  }

  if (!isOpen && !isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:bg-opacity-20"
          style={{ background: 'rgba(255, 107, 0, 0.1)' }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Header */}
        <div className="p-6 md:p-8 text-center border-b" style={{ borderColor: 'var(--accent)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
            <span className="text-3xl">🎯</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Choose Your Position
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Select the role that best matches your skills and interests
          </p>
        </div>

        {/* Options */}
        <div className="p-6 md:p-8 grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Frontend (Marketing) Option */}
          <button
            onClick={() => handleChoice('/applyformarketing')}
            className="group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left"
            style={{ 
              borderColor: 'var(--accent)',
              background: 'var(--bg-primary)'
            }}
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: 'var(--accent)' }} />
            
            <div className="relative">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Frontend (Marketing)
              </h3>
              
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                AI Reels Creation & Marketing Specialist
              </p>
              
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Create engaging AI-generated reels</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Manage social media campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Drive traffic & engagement</span>
                </li>
              </ul>
              
              <div className="mt-6 text-center py-3 px-4 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white' }}>
                Apply for Marketing →
              </div>
            </div>
          </button>

          {/* Backend (Customer Service) Option */}
          <button
            onClick={() => handleChoice('/apply')}
            className="group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl text-left"
            style={{ 
              borderColor: 'var(--accent)',
              background: 'var(--bg-primary)'
            }}
          >
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: 'var(--accent)' }} />
            
            <div className="relative">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Backend (Customer Service)
              </h3>
              
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                Professional OnlyFans Chatter
              </p>
              
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Engage with subscribers</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Build customer relationships</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2" style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Drive revenue through messaging</span>
                </li>
              </ul>
              
              <div className="mt-6 text-center py-3 px-4 rounded-lg font-semibold" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
                Apply for Customer Service →
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 pt-0 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Both applications take approximately 5 minutes to complete
          </p>
        </div>
      </div>
    </div>
  )
}
