'use client'

import { useRouter } from 'next/navigation'

export default function ChoosePositionPage() {
  const router = useRouter()

  const handleJobSelect = (jobType: 'backend' | 'frontend') => {
    if (jobType === 'backend') {
      router.push('/apply')
    } else {
      router.push('/applyformarketing')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Choose Your Career Path
          </h1>
          <p className="text-lg sm:text-xl mb-2" style={{ color: 'var(--text-secondary)' }}>
            Select the role that best matches your skills and interests
          </p>
          <p className="text-base sm:text-lg" style={{ color: '#ff6b00' }}>
            ✓ No previous experience needed • ✓ Fast typing & work speed required • ✓ Reliable internet essential
          </p>
        </div>

        {/* Job Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Backend Position */}
          <button
            onClick={() => handleJobSelect('backend')}
            className="text-left p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            style={{ 
              borderColor: '#ff6b00',
              background: 'var(--surface)'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-110"
                  style={{ background: '#ff6b00' }}
                >
                  💬
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Backend
                  </h2>
                  <div className="text-base sm:text-lg font-semibold" style={{ color: '#ff6b00' }}>
                    Customer Satisfaction
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="mb-6 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Direct customer interaction and relationship building
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Learn:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Professional communication, sales psychology, customer retention strategies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Benefits:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Performance-based earnings, flexible schedule, work from anywhere
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Skills:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Fast typing speed, empathy, quick thinking, multitasking
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#ff6b00' }}>
                <div className="text-center font-bold text-lg" style={{ color: '#ff6b00' }}>
                  Click to Apply →
                </div>
              </div>
            </div>
          </button>

          {/* Frontend Position */}
          <button
            onClick={() => handleJobSelect('frontend')}
            className="text-left p-6 sm:p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
            style={{ 
              borderColor: '#ff6b00',
              background: 'var(--surface)'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition-transform group-hover:scale-110"
                  style={{ background: '#ff6b00' }}
                >
                  🎬
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Frontend
                  </h2>
                  <div className="text-base sm:text-lg font-semibold" style={{ color: '#ff6b00' }}>
                    Marketing
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <p className="mb-6 text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Creative content creation and marketing campaigns
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Learn:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        AI content tools, social media marketing, viral content strategies
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Benefits:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Creative freedom, cutting-edge AI tools, portfolio building
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-1" style={{ color: '#ff6b00' }}>✓</span>
                    <div>
                      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Skills:</p>
                      <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                        Creativity, trend awareness, attention to detail, tech-savvy
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t" style={{ borderColor: '#ff6b00' }}>
                <div className="text-center font-bold text-lg" style={{ color: '#ff6b00' }}>
                  Click to Apply →
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 rounded-xl text-center" style={{ background: 'var(--surface)', border: '2px solid #ff6b00' }}>
          <p className="text-base sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            💡 <strong style={{ color: '#ff6b00' }}>Both positions are beginner-friendly!</strong> We provide full training and support. Choose based on your interests and strengths.
          </p>
        </div>
      </div>
    </div>
  )
}
