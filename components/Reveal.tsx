'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export default function Reveal({ 
  children, 
  delay = 0,
  duration = 0.5,
  className = ''
}: RevealProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ 
        duration,
        ease: [0.22, 1, 0.36, 1],
        delay 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
