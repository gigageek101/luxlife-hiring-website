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

  const handleJobSelect = (jobType: 'backend' | 'frontend') => {
    if (jobType === 'backend') {
      router.push('/apply')
    } else {
      router.push('/applyformarketing')
    }
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8"
          style={{ background: '#1a1a1a' }}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg transition-all hover:bg-white hover:bg-opacity-10 z-10"
          style={{ color: '#ffffff' }}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 pr-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: '#ffffff' }}>
            Choose Your Career Path
          </h2>
          <p className="text-base sm:text-lg" style={{ color: '#cccccc' }}>
            No previous experience needed • Fast typing & work speed required • Reliable internet connection essential
          </p>
        </div>

        {/* Job Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Backend Position */}
          <button
            onClick={() => handleJobSelect('backend')}
            className="text-left p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            style={{ 
              borderColor: '#ff6b00',
              background: '#252525'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-transform group-hover:scale-110"
                  style={{ background: '#ff6b00' }}
                >
                  💬
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#ffffff' }}>
                  Backend
                  <div className="text-xs sm:text-sm font-normal" style={{ color: '#ff6b00' }}>
                    Customer Satisfaction
                  </div>
                </h3>
              </div>
              
              <div className="flex-1">
                <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: '#cccccc' }}>
                  Direct customer interaction and relationship building
                </p>
                
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Learn:</strong> Professional communication, sales psychology, customer retention strategies
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Benefits:</strong> Performance-based earnings, flexible schedule, work from anywhere
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Skills:</strong> Fast typing speed, empathy, quick thinking, multitasking
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Frontend Position */}
          <button
            onClick={() => handleJobSelect('frontend')}
            className="text-left p-4 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl group"
            style={{ 
              borderColor: '#ff6b00',
              background: '#252525'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div 
                  className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl flex items-center justify-center text-2xl sm:text-3xl transition-transform group-hover:scale-110"
                  style={{ background: '#ff6b00' }}
                >
                  🎬
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#ffffff' }}>
                  Frontend
                  <div className="text-xs sm:text-sm font-normal" style={{ color: '#ff6b00' }}>
                    Marketing
                  </div>
                </h3>
              </div>
              
              <div className="flex-1">
                <p className="mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: '#cccccc' }}>
                  Creative content creation and marketing campaigns
                </p>
                
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Learn:</strong> AI content tools, social media marketing, viral content strategies
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Benefits:</strong> Creative freedom, cutting-edge AI tools, portfolio building
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base sm:text-lg flex-shrink-0" style={{ color: '#ff6b00' }}>✓</span>
                    <span className="text-xs sm:text-sm" style={{ color: '#cccccc' }}>
                      <strong style={{ color: '#ffffff' }}>Skills:</strong> Creativity, trend awareness, attention to detail, tech-savvy
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg" style={{ background: '#252525', border: '1px solid #ff6b00' }}>
          <p className="text-xs sm:text-sm text-center" style={{ color: '#cccccc' }}>
            💡 <strong style={{ color: '#ff6b00' }}>Both positions are beginner-friendly!</strong> We provide full training and support. Choose based on your interests and strengths.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
