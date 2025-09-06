'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}

export default function AnimatedCounter({ 
  value, 
  suffix = '', 
  prefix = '',
  duration = 2 
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (latest) => {
    return Math.round(latest)
  })
  const [displayValue, setDisplayValue] = useState('0')
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest).toString())
        }
      })
      
      return controls.stop
    }
  }, [isInView, value, motionValue, duration])

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
