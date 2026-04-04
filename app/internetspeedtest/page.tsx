'use client'

import { useState, useRef, useCallback } from 'react'

/*
 * Parameters aligned with LibreSpeed (https://github.com/librespeed/speedtest)
 * - Download: 6 streams, 1.5s grace time
 * - Upload: 3 streams, 3s grace time
 * - Overhead compensation: 1.06 (HTTP + TCP + IPv4 + ETH)
 * - Stream stagger delay: 300ms
 */
const DL_STREAMS = 6
const UL_STREAMS = 3
const DL_GRACE_MS = 1500
const UL_GRACE_MS = 3000
const DL_DURATION_MS = 15000
const UL_DURATION_MS = 15000
const UL_BLOB_SIZE = 10 * 1024 * 1024
const OVERHEAD = 1.06
const STREAM_DELAY = 300

function SpeedGauge({ speed, maxSpeed = 500, label }: { speed: number; maxSpeed?: number; label: string }) {
  const clampedSpeed = Math.min(speed, maxSpeed)
  const angle = -135 + (clampedSpeed / maxSpeed) * 270
  const cx = 140, cy = 140, r = 110

  const ticks = [0, 50, 100, 200, 300, 400, 500]
  const getTickPos = (val: number) => {
    const a = (-135 + (Math.min(val, maxSpeed) / maxSpeed) * 270) * (Math.PI / 180)
    return {
      x1: cx + (r - 12) * Math.cos(a), y1: cy + (r - 12) * Math.sin(a),
      x2: cx + (r - 2) * Math.cos(a), y2: cy + (r - 2) * Math.sin(a),
      lx: cx + (r - 28) * Math.cos(a), ly: cy + (r - 28) * Math.sin(a),
    }
  }

  const arcPath = (startAngle: number, endAngle: number) => {
    const s = (startAngle * Math.PI) / 180, e = (endAngle * Math.PI) / 180
    const x1g = cx + r * Math.cos(s), y1g = cy + r * Math.sin(s)
    const x2g = cx + r * Math.cos(e), y2g = cy + r * Math.sin(e)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1g} ${y1g} A ${r} ${r} 0 ${large} 1 ${x2g} ${y2g}`
  }

  const needleAngle = angle * (Math.PI / 180)
  const needleLen = r - 25
  const nx = cx + needleLen * Math.cos(needleAngle)
  const ny = cy + needleLen * Math.sin(needleAngle)

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 280 200" className="w-full max-w-[300px]">
        <defs>
          <linearGradient id="gaugeGradST" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="20%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glowST">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d={arcPath(-135, 135)} fill="none" stroke="#2a2a3a" strokeWidth="14" strokeLinecap="round" />
        <path d={arcPath(-135, 135)} fill="none" stroke="url(#gaugeGradST)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
        {ticks.map(val => {
          const t = getTickPos(val)
          return (
            <g key={val}>
              <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#9ca3af" strokeWidth="2" />
              <text x={t.lx} y={t.ly} fill="#9ca3af" fontSize="10" textAnchor="middle" dominantBaseline="middle">{val}</text>
            </g>
          )
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#ff6b00" strokeWidth="3" strokeLinecap="round" filter="url(#glowST)"
          style={{ transition: 'x2 0.5s ease-out, y2 0.5s ease-out' }} />
        <circle cx={cx} cy={cy} r="8" fill="#ff6b00" />
        <circle cx={cx} cy={cy} r="4" fill="#1a1a2e" />
        <text x={cx} y={cy + 35} fill="#ff6b00" fontSize="28" fontWeight="bold" textAnchor="middle">{speed.toFixed(1)}</text>
        <text x={cx} y={cy + 52} fill="#9ca3af" fontSize="12" textAnchor="middle">Mbps</text>
      </svg>
      <p className="text-sm font-semibold mt-1 text-gray-400">{label}</p>
    </div>
  )
}

function measureDownload(
  durationMs: number,
  graceMs: number,
  onProgress: (speed: number) => void,
  abortRef: React.MutableRefObject<boolean>
): Promise<number> {
  return new Promise((resolve) => {
    const testStart = performance.now()
    let graceEnded = false
    let measureStart = 0
    let totalBytes = 0
    let done = false
    const xhrs: XMLHttpRequest[] = []

    const tick = setInterval(() => {
      if (!graceEnded || done) return
      const elapsed = (performance.now() - measureStart) / 1000
      if (elapsed > 0) {
        onProgress((totalBytes * 8 * OVERHEAD) / elapsed / 1e6)
      }
    }, 200)

    const finish = () => {
      if (done) return
      done = true
      clearInterval(tick)
      xhrs.forEach(x => { try { x.abort() } catch {} })
      if (graceEnded) {
        const elapsed = (performance.now() - measureStart) / 1000
        resolve(elapsed > 0 ? Math.round(((totalBytes * 8 * OVERHEAD) / elapsed / 1e6) * 10) / 10 : 0)
      } else {
        resolve(0)
      }
    }

    const launch = (i: number) => {
      if (done || abortRef.current) return
      const xhr = new XMLHttpRequest()
      xhrs[i] = xhr
      let lastLoaded = 0

      xhr.open('GET', '/api/speedtest/download?r=' + Math.random(), true)
      xhr.responseType = 'blob'

      xhr.onprogress = (e) => {
        if (done || abortRef.current) return
        const now = performance.now()
        const bytes = e.loaded - lastLoaded
        lastLoaded = e.loaded
        if ((now - testStart) < graceMs) return
        if (!graceEnded) { graceEnded = true; measureStart = now }
        totalBytes += bytes
      }

      xhr.onload = () => {
        if (done || abortRef.current) return
        if ((performance.now() - testStart) < durationMs) launch(i)
      }

      xhr.onerror = () => {
        if (!done && !abortRef.current && (performance.now() - testStart) < durationMs) {
          setTimeout(() => launch(i), 200)
        }
      }

      xhr.send()
    }

    for (let i = 0; i < DL_STREAMS; i++) setTimeout(() => launch(i), i * STREAM_DELAY)
    setTimeout(finish, durationMs)
  })
}

function measureUpload(
  durationMs: number,
  graceMs: number,
  onProgress: (speed: number) => void,
  abortRef: React.MutableRefObject<boolean>
): Promise<number> {
  return new Promise((resolve) => {
    const testStart = performance.now()
    let graceEnded = false
    let measureStart = 0
    let totalBytes = 0
    let done = false
    const xhrs: XMLHttpRequest[] = []

    const blob = new Uint8Array(UL_BLOB_SIZE)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      for (let off = 0; off < UL_BLOB_SIZE; off += 65536) {
        crypto.getRandomValues(blob.subarray(off, Math.min(off + 65536, UL_BLOB_SIZE)))
      }
    }

    const tick = setInterval(() => {
      if (!graceEnded || done) return
      const elapsed = (performance.now() - measureStart) / 1000
      if (elapsed > 0) {
        onProgress((totalBytes * 8 * OVERHEAD) / elapsed / 1e6)
      }
    }, 200)

    const finish = () => {
      if (done) return
      done = true
      clearInterval(tick)
      xhrs.forEach(x => { try { x.abort() } catch {} })
      if (graceEnded) {
        const elapsed = (performance.now() - measureStart) / 1000
        resolve(elapsed > 0 ? Math.round(((totalBytes * 8 * OVERHEAD) / elapsed / 1e6) * 10) / 10 : 0)
      } else {
        resolve(0)
      }
    }

    const launch = (i: number) => {
      if (done || abortRef.current) return
      const xhr = new XMLHttpRequest()
      xhrs[i] = xhr
      let lastLoaded = 0

      xhr.open('POST', '/api/speedtest/upload?r=' + Math.random(), true)

      xhr.upload.onprogress = (e) => {
        if (done || abortRef.current) return
        const now = performance.now()
        const bytes = e.loaded - lastLoaded
        lastLoaded = e.loaded
        if ((now - testStart) < graceMs) return
        if (!graceEnded) { graceEnded = true; measureStart = now }
        totalBytes += bytes
      }

      xhr.onload = () => {
        if (done || abortRef.current) return
        if ((performance.now() - testStart) < durationMs) launch(i)
      }

      xhr.onerror = () => {
        if (!done && !abortRef.current && (performance.now() - testStart) < durationMs) {
          setTimeout(() => launch(i), 200)
        }
      }

      xhr.send(blob)
    }

    for (let i = 0; i < UL_STREAMS; i++) setTimeout(() => launch(i), i * STREAM_DELAY)
    setTimeout(finish, durationMs)
  })
}

export default function InternetSpeedTestPage() {
  const [phase, setPhase] = useState<'idle' | 'download' | 'upload' | 'done'>('idle')
  const [liveSpeed, setLiveSpeed] = useState(0)
  const [downloadResult, setDownloadResult] = useState<number | null>(null)
  const [uploadResult, setUploadResult] = useState<number | null>(null)
  const [log, setLog] = useState<string[]>([])
  const abortRef = useRef(false)

  const addLog = useCallback((msg: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  const runTest = async () => {
    abortRef.current = false
    setPhase('download')
    setLiveSpeed(0)
    setDownloadResult(null)
    setUploadResult(null)
    setLog([])

    addLog(`Download: ${DL_STREAMS} streams, ${DL_DURATION_MS / 1000}s, ${DL_GRACE_MS / 1000}s grace, overhead x${OVERHEAD}`)

    const dl = await measureDownload(DL_DURATION_MS, DL_GRACE_MS, (s) => setLiveSpeed(s), abortRef)
    setDownloadResult(dl)
    setLiveSpeed(dl)
    addLog(`Download complete: ${dl} Mbps`)

    if (abortRef.current) return

    setPhase('upload')
    setLiveSpeed(0)
    addLog(`Upload: ${UL_STREAMS} streams, ${UL_DURATION_MS / 1000}s, ${UL_GRACE_MS / 1000}s grace, overhead x${OVERHEAD}`)

    const ul = await measureUpload(UL_DURATION_MS, UL_GRACE_MS, (s) => setLiveSpeed(s), abortRef)
    setUploadResult(ul)
    setLiveSpeed(ul)
    addLog(`Upload complete: ${ul} Mbps`)

    setPhase('done')
  }

  const stopTest = () => {
    abortRef.current = true
    setPhase('done')
    addLog('Test aborted by user')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">Internet Speed Test</h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          LibreSpeed-aligned measurement &mdash; random payloads, overhead compensation, staggered streams
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          {phase === 'idle' ? (
            <div className="text-center">
              <SpeedGauge speed={0} label="Ready" />
              <button onClick={runTest} className="mt-4 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition-all">
                Start Test
              </button>
            </div>
          ) : phase === 'done' ? (
            <div className="text-center">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-5 bg-gray-800 border-2 border-green-500">
                  <p className="text-sm text-gray-400 mb-1">Download</p>
                  <p className="text-4xl font-bold text-green-400">{downloadResult ?? '--'}</p>
                  <p className="text-sm text-gray-400">Mbps</p>
                </div>
                <div className="rounded-xl p-5 bg-gray-800 border-2 border-blue-500">
                  <p className="text-sm text-gray-400 mb-1">Upload</p>
                  <p className="text-4xl font-bold text-blue-400">{uploadResult ?? '--'}</p>
                  <p className="text-sm text-gray-400">Mbps</p>
                </div>
              </div>
              <button onClick={runTest} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition-all">
                Run Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <SpeedGauge speed={liveSpeed} label={phase === 'download' ? 'Downloading...' : 'Uploading...'} />
              {downloadResult !== null && phase === 'upload' && (
                <p className="text-sm text-gray-400 mt-2">Download: {downloadResult} Mbps</p>
              )}
              <button onClick={stopTest} className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-all">
                Stop
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Debug Log</h3>
          <div className="font-mono text-xs text-gray-500 space-y-0.5 max-h-48 overflow-y-auto">
            {log.length === 0 ? <p>Press &ldquo;Start Test&rdquo; to begin...</p> : log.map((entry, i) => <p key={i}>{entry}</p>)}
          </div>
        </div>

        <div className="mt-6 bg-gray-900 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Configuration (LibreSpeed-aligned)</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <p>DL streams: {DL_STREAMS}</p>
            <p>UL streams: {UL_STREAMS}</p>
            <p>DL grace time: {DL_GRACE_MS}ms</p>
            <p>UL grace time: {UL_GRACE_MS}ms</p>
            <p>DL duration: {DL_DURATION_MS / 1000}s</p>
            <p>UL duration: {UL_DURATION_MS / 1000}s</p>
            <p>UL blob size: {UL_BLOB_SIZE / 1024 / 1024} MB</p>
            <p>Overhead factor: {OVERHEAD}</p>
            <p>Stream stagger: {STREAM_DELAY}ms</p>
            <p>Payload: random (incompressible)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
