'use client'

import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollRocket() {
  const [isVisible, setIsVisible] = useState(false)
  const { scrollYProgress } = useScroll()
  
  // Transform scroll progress to rocket position
  const y = useTransform(scrollYProgress, [0, 1], [100, -200])
  const rotate = useTransform(scrollYProgress, [0, 0.5, 1], [0, 5, -5])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1.2, 1, 0.8])

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      setIsVisible(scrolled > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      className="fixed right-8 bottom-8 z-50 pointer-events-none"
      style={{ y, rotate, scale }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Rocket SVG */}
      <motion.svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        className="drop-shadow-lg"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Rocket Body */}
        <defs>
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        
        {/* Flame/Exhaust */}
        <motion.path
          d="M20 65 L30 80 L40 65 L35 70 L30 75 L25 70 Z"
          fill="url(#flameGradient)"
          animate={{
            scaleY: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Rocket Body */}
        <ellipse cx="30" cy="15" rx="12" ry="15" fill="url(#rocketGradient)" />
        <rect x="18" y="15" width="24" height="35" fill="url(#rocketGradient)" />
        <ellipse cx="30" cy="50" rx="12" ry="8" fill="url(#rocketGradient)" />
        
        {/* Rocket Nose */}
        <path d="M18 15 Q30 5 42 15" fill="#1e40af" />
        
        {/* Rocket Wings */}
        <path d="M18 45 L12 55 L18 50 Z" fill="#1e40af" />
        <path d="M42 45 L48 55 L42 50 Z" fill="#1e40af" />
        
        {/* Window */}
        <circle cx="30" cy="25" r="6" fill="#0f172a" stroke="#60a5fa" strokeWidth="2" />
        <circle cx="30" cy="25" r="3" fill="#60a5fa" opacity="0.5" />
        
        {/* Details */}
        <rect x="25" y="35" width="10" height="2" fill="#1e40af" />
        <rect x="25" y="40" width="10" height="2" fill="#1e40af" />
      </motion.svg>
      
      {/* Particle Trail */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              left: `${(i - 2) * 4}px`,
              top: `${i * 8}px`,
            }}
            animate={{
              y: [0, 20, 40],
              opacity: [1, 0.5, 0],
              scale: [1, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
