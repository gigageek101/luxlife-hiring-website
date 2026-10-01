'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { notifyPath, syncQaTracker } from '@/lib/qa-tracker'

/** Mounted once in the root layout. Does nothing unless a QA account is logged in. */
export default function QaActivityTracker() {
  const pathname = usePathname()
  const search = useSearchParams()

  useEffect(() => {
    syncQaTracker()
    notifyPath()
  }, [pathname, search])

  useEffect(() => {
    const id = window.setInterval(syncQaTracker, 5000)
    window.addEventListener('storage', syncQaTracker)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('storage', syncQaTracker)
    }
  }, [])

  return null
}
