'use client'

import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollRocket() {
  const { scrollYProgress } = useScroll()
  
  // Transform scroll progress to rocket position - starts in view, flies up as you scroll
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, -300, -800])
  const rotate = useTransform(scrollYProgress, [0, 0.5], [0, -10])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 1.1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.6, 0.8], [0.3, 0.6, 0.4, 0.1])

  return (
    <motion.div
      className="absolute right-10 md:right-20 bottom-10 md:bottom-20 pointer-events-none z-0"
      style={{ y, rotate, scale, opacity }}
      initial={{ opacity: 0.3 }}
      animate={{ opacity: 0.6 }}
    >
      {/* Large Background Rocket SVG */}
      <motion.svg
        width="300"
        height="400"
        viewBox="0 0 50 70"
        className="drop-shadow-2xl"
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Rocket Body */}
        <defs>
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
          <linearGradient id="softFlameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Soft Cloud Exhaust */}
        <motion.g
          animate={{
            scaleY: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ellipse cx="25" cy="58" rx="8" ry="4" fill="#fbbf24" opacity="0.3" />
          <ellipse cx="25" cy="62" rx="6" ry="3" fill="#f59e0b" opacity="0.4" />
          <ellipse cx="25" cy="65" rx="4" ry="2" fill="#d97706" opacity="0.5" />
        </motion.g>
        
        {/* Main Rocket Body */}
        <ellipse cx="25" cy="12" rx="10" ry="12" fill="url(#rocketGradient)" />
        <rect x="15" y="12" width="20" height="30" fill="url(#rocketGradient)" />
        <ellipse cx="25" cy="42" rx="10" ry="6" fill="url(#rocketGradient)" />
        
        {/* Elegant Nose Cone */}
        <path d="M15 12 Q25 3 35 12" fill="url(#accentGradient)" />
        
        {/* Refined Wings */}
        <path d="M15 38 L10 46 L15 42 Z" fill="url(#accentGradient)" />
        <path d="M35 38 L40 46 L35 42 Z" fill="url(#accentGradient)" />
        
        {/* Elegant Window */}
        <circle cx="25" cy="20" r="5" fill="#1e293b" stroke="url(#accentGradient)" strokeWidth="1.5" />
        <circle cx="25" cy="20" r="2.5" fill="#3b82f6" opacity="0.3" filter="url(#softGlow)" />
        
        {/* Subtle Details */}
        <rect x="22" y="28" width="6" height="1.5" rx="0.75" fill="url(#accentGradient)" opacity="0.7" />
        <rect x="22" y="32" width="6" height="1.5" rx="0.75" fill="url(#accentGradient)" opacity="0.7" />
        <rect x="22" y="36" width="6" height="1.5" rx="0.75" fill="url(#accentGradient)" opacity="0.7" />
      </motion.svg>
      
      {/* Large Soft Cloud Trail */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${24 - i * 3}px`,
              height: `${24 - i * 3}px`,
              backgroundColor: i % 2 === 0 ? '#93c5fd' : '#fbbf24',
              left: `${(i - 2.5) * 8}px`,
              top: `${i * 20}px`,
            }}
            animate={{
              y: [0, 60, 120],
              opacity: [0.4, 0.2, 0],
              scale: [1, 0.8, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
