'use client'

import { useEffect, useState } from 'react'

export default function DynamicBackground() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const scrollProgress = Math.min(scrolled / maxScroll, 1)
      
      setScrollY(scrolled)
      
      // Update CSS custom properties for dynamic effects
      document.documentElement.style.setProperty('--scroll-y', `${scrolled * 0.5}px`)
      document.documentElement.style.setProperty('--circle-scale', `${1 - scrollProgress * 0.3}`)
      document.documentElement.style.setProperty('--scroll-progress', scrollProgress.toString())
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Dynamic background circles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        {/* Main circle */}
        <div 
          className="absolute -top-1/2 -right-1/4 w-[150%] h-[200%] rounded-full transition-transform duration-300 ease-out"
          style={{
            background: 'linear-gradient(135deg, #ff6b35 0%, #e55a2b 50%, #000000 100%)',
            transform: `translateY(${scrollY * 0.3}px) scale(${1 - scrollY * 0.0005})`,
            opacity: Math.max(0.1, 0.9 - scrollY * 0.001),
          }}
        />
        
        {/* Secondary circle */}
        <div 
          className="absolute -top-2/5 -right-1/5 w-[120%] h-[160%] rounded-full opacity-40 transition-transform duration-300 ease-out"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, #ffb5a0 30%, transparent 70%)',
            transform: `translateY(${scrollY * 0.15}px) scale(${1 - scrollY * 0.0003})`,
          }}
        />
        
        {/* Accent particles */}
        <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-orange-400 rounded-full opacity-60 float-animation" />
        <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-orange-300 rounded-full opacity-40 pulse-animation" />
        <div className="absolute top-1/2 right-1/6 w-3 h-3 bg-orange-500 rounded-full opacity-50 float-animation" style={{ animationDelay: '2s' }} />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-l from-transparent via-white/5 to-white/20" />
    </>
  )
}
