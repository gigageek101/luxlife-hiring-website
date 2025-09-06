'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ParallaxTextProps {
  children: React.ReactNode
  offset?: number
}

export default function ParallaxText({ children, offset = 50 }: ParallaxTextProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  )
}
