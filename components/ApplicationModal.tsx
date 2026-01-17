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
    setTimeout(() => router.push(path), 100)
  }

  if (!isOpen && !isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl transform transition-all duration-300 overflow-hidden ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          border: '2px solid var(--accent)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full transition-all duration-200 hover:scale-110 z-10"
          style={{ background: 'rgba(255, 107, 0, 0.2)' }}
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Header */}
        <div className="p-8 md:p-10 text-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
            Choose Your Position
          </h2>
          <p className="text-lg md:text-xl text-white/90">
            No previous experience needed - Full training provided!
          </p>
        </div>

        {/* Options */}
        <div className="p-8 md:p-10 grid md:grid-cols-2 gap-6">
          {/* Frontend (Marketing) Option */}
          <button
            onClick={() => handleChoice('/applyformarketing')}
            className="group relative p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-left overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: '2px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: 'white' }} />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Frontend (Marketing)
              </h3>
              
              <p className="text-base md:text-lg mb-6 text-white/90">
                Create viral content & manage social media
              </p>
              
              <ul className="space-y-3 text-sm md:text-base text-white/90 mb-8">
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Create engaging AI-generated reels</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Manage social media campaigns</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Drive traffic & engagement</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>No experience needed - full training included</span>
                </li>
              </ul>
              
              <div className="text-center py-4 px-6 rounded-xl font-bold text-lg bg-white text-purple-600 group-hover:scale-105 transition-transform duration-300">
                Apply for Marketing →
              </div>
            </div>
          </button>

          {/* Backend (Customer Service) Option */}
          <button
            onClick={() => handleChoice('/apply')}
            className="group relative p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-left overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: '2px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: 'white' }} />
            
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-white/20 backdrop-blur-sm">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Backend (Customer Service)
              </h3>
              
              <p className="text-base md:text-lg mb-6 text-white/90">
                Chat with customers & build relationships
              </p>
              
              <ul className="space-y-3 text-sm md:text-base text-white/90 mb-8">
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Engage with subscribers via messages</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Build strong customer relationships</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>Help drive revenue through chat</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-xl">✓</span>
                  <span>No experience needed - full training included</span>
                </li>
              </ul>
              
              <div className="text-center py-4 px-6 rounded-xl font-bold text-lg bg-white text-orange-600 group-hover:scale-105 transition-transform duration-300">
                Apply for Customer Service →
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <p className="text-base text-white/70">
            ⏱️ Both applications take approximately 5 minutes to complete
          </p>
        </div>
      </div>
    </div>
  )
}
