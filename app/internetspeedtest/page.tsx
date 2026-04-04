'use client'

import { useState, useRef, useCallback } from 'react'

const STREAMS = 6
const WARMUP_MS = 2000
const DOWNLOAD_DURATION_MS = 15000
const UPLOAD_DURATION_MS = 15000
const UPLOAD_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB per upload stream

function SpeedGauge({ speed, maxSpeed = 500, label }: { speed: number, maxSpeed?: number, label: string }) {
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
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s)
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e)
    const large = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`
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

type MeasureResult = { speed: number }

function measureDownload(
  durationMs: number,
  onProgress: (speed: number) => void,
  abortRef: React.MutableRefObject<boolean>
): Promise<MeasureResult> {
  return new Promise((resolve) => {
    const xhrs: XMLHttpRequest[] = []
    const testStart = performance.now()
    let measurementStart: number | null = null
    let totalBytesAfterWarmup = 0
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      xhrs.forEach(xhr => { try { xhr.abort() } catch {} })
      if (measurementStart !== null) {
        const elapsed = (performance.now() - measurementStart) / 1000
        const speed = elapsed > 0 ? (totalBytesAfterWarmup * 8) / elapsed / 1_000_000 : 0
        resolve({ speed: Math.round(speed * 10) / 10 })
      } else {
        resolve({ speed: 0 })
      }
    }

    const timeout = setTimeout(finish, durationMs + 500)

    const launchStream = (index: number) => {
      if (finished || abortRef.current) return
      const xhr = new XMLHttpRequest()
      xhrs[index] = xhr
      let lastLoaded = 0

      xhr.open('GET', '/api/speedtest/download?t=' + Math.random() + '&s=' + index, true)
      xhr.responseType = 'arraybuffer'

      xhr.onprogress = (e) => {
        if (finished || abortRef.current) return
        const now = performance.now()
        const elapsed = now - testStart
        const bytesThisEvent = e.loaded - lastLoaded
        lastLoaded = e.loaded

        if (elapsed < WARMUP_MS) return

        if (measurementStart === null) {
          measurementStart = now
          totalBytesAfterWarmup = 0
          return
        }

        totalBytesAfterWarmup += bytesThisEvent
        const measureElapsed = (now - measurementStart) / 1000
        if (measureElapsed > 0.1) {
          const currentSpeed = (totalBytesAfterWarmup * 8) / measureElapsed / 1_000_000
          onProgress(currentSpeed)
        }

        if (elapsed >= durationMs) finish()
      }

      xhr.onload = () => {
        if (finished || abortRef.current) return
        const now = performance.now()
        const bytesThisEvent = xhr.response?.byteLength || 0
        const remaining = bytesThisEvent - lastLoaded
        if (remaining > 0 && (now - testStart) >= WARMUP_MS) {
          if (measurementStart === null) measurementStart = now
          totalBytesAfterWarmup += remaining
        }
        if ((now - testStart) < durationMs) {
          launchStream(index)
        } else {
          finish()
        }
      }

      xhr.onerror = () => {
        if (!finished && !abortRef.current && (performance.now() - testStart) < durationMs) {
          setTimeout(() => launchStream(index), 200)
        }
      }

      xhr.send()
    }

    for (let i = 0; i < STREAMS; i++) {
      launchStream(i)
    }

    setTimeout(() => { if (!finished) finish(); clearTimeout(timeout) }, durationMs)
  })
}

function measureUpload(
  durationMs: number,
  onProgress: (speed: number) => void,
  abortRef: React.MutableRefObject<boolean>
): Promise<MeasureResult> {
  return new Promise((resolve) => {
    const xhrs: XMLHttpRequest[] = []
    const testStart = performance.now()
    let measurementStart: number | null = null
    let totalBytesAfterWarmup = 0
    let finished = false

    const uploadData = new Uint8Array(UPLOAD_CHUNK_SIZE)

    const finish = () => {
      if (finished) return
      finished = true
      xhrs.forEach(xhr => { try { xhr.abort() } catch {} })
      if (measurementStart !== null) {
        const elapsed = (performance.now() - measurementStart) / 1000
        const speed = elapsed > 0 ? (totalBytesAfterWarmup * 8) / elapsed / 1_000_000 : 0
        resolve({ speed: Math.round(speed * 10) / 10 })
      } else {
        resolve({ speed: 0 })
      }
    }

    const timeout = setTimeout(finish, durationMs + 500)

    const launchStream = (index: number) => {
      if (finished || abortRef.current) return
      const xhr = new XMLHttpRequest()
      xhrs[index] = xhr
      let lastLoaded = 0

      xhr.open('POST', '/api/speedtest/upload?t=' + Math.random() + '&s=' + index, true)

      xhr.upload.onprogress = (e) => {
        if (finished || abortRef.current) return
        const now = performance.now()
        const elapsed = now - testStart
        const bytesThisEvent = e.loaded - lastLoaded
        lastLoaded = e.loaded

        if (elapsed < WARMUP_MS) return

        if (measurementStart === null) {
          measurementStart = now
          totalBytesAfterWarmup = 0
          return
        }

        totalBytesAfterWarmup += bytesThisEvent
        const measureElapsed = (now - measurementStart) / 1000
        if (measureElapsed > 0.1) {
          const currentSpeed = (totalBytesAfterWarmup * 8) / measureElapsed / 1_000_000
          onProgress(currentSpeed)
        }

        if (elapsed >= durationMs) finish()
      }

      xhr.onload = () => {
        if (finished || abortRef.current) return
        if ((performance.now() - testStart) < durationMs) {
          launchStream(index)
        } else {
          finish()
        }
      }

      xhr.onerror = () => {
        if (!finished && !abortRef.current && (performance.now() - testStart) < durationMs) {
          setTimeout(() => launchStream(index), 200)
        }
      }

      xhr.send(uploadData)
    }

    for (let i = 0; i < STREAMS; i++) {
      launchStream(i)
    }

    setTimeout(() => { if (!finished) finish(); clearTimeout(timeout) }, durationMs)
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

    addLog(`Starting download test (${STREAMS} streams, ${DOWNLOAD_DURATION_MS / 1000}s, ${WARMUP_MS / 1000}s warmup)...`)

    const dlResult = await measureDownload(
      DOWNLOAD_DURATION_MS,
      (speed) => setLiveSpeed(speed),
      abortRef
    )
    setDownloadResult(dlResult.speed)
    setLiveSpeed(dlResult.speed)
    addLog(`Download complete: ${dlResult.speed} Mbps`)

    if (abortRef.current) return

    setPhase('upload')
    setLiveSpeed(0)
    addLog(`Starting upload test (${STREAMS} streams, ${UPLOAD_DURATION_MS / 1000}s, ${WARMUP_MS / 1000}s warmup)...`)

    const ulResult = await measureUpload(
      UPLOAD_DURATION_MS,
      (speed) => setLiveSpeed(speed),
      abortRef
    )
    setUploadResult(ulResult.speed)
    setLiveSpeed(ulResult.speed)
    addLog(`Upload complete: ${ulResult.speed} Mbps`)

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
          Standalone test page -- {STREAMS} parallel XHR streams, {WARMUP_MS / 1000}s warmup, progress-event based measurement
        </p>

        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          {phase === 'idle' ? (
            <div className="text-center">
              <SpeedGauge speed={0} label="Ready" />
              <button
                onClick={runTest}
                className="mt-4 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition-all"
              >
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
              <button
                onClick={runTest}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition-all"
              >
                Run Again
              </button>
            </div>
          ) : (
            <div className="text-center">
              <SpeedGauge
                speed={liveSpeed}
                label={phase === 'download' ? 'Downloading...' : 'Uploading...'}
              />
              {downloadResult !== null && phase === 'upload' && (
                <p className="text-sm text-gray-400 mt-2">Download: {downloadResult} Mbps</p>
              )}
              <button
                onClick={stopTest}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-all"
              >
                Stop
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-900 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Debug Log</h3>
          <div className="font-mono text-xs text-gray-500 space-y-0.5 max-h-48 overflow-y-auto">
            {log.length === 0 ? (
              <p>Press "Start Test" to begin...</p>
            ) : (
              log.map((entry, i) => <p key={i}>{entry}</p>)
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-900 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Configuration</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <p>Parallel streams: {STREAMS}</p>
            <p>Warmup: {WARMUP_MS}ms</p>
            <p>Download duration: {DOWNLOAD_DURATION_MS / 1000}s</p>
            <p>Upload duration: {UPLOAD_DURATION_MS / 1000}s</p>
            <p>Download payload: 25 MB/stream</p>
            <p>Upload payload: {UPLOAD_CHUNK_SIZE / 1024 / 1024} MB/stream</p>
          </div>
        </div>
      </div>
    </div>
  )
}
