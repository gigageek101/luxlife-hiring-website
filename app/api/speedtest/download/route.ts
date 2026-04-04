import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CHUNK_SIZE = 256 * 1024 // 256 KB per chunk
const TOTAL_SIZE = 25 * 1024 * 1024 // 25 MB total

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      let sent = 0
      const chunk = new Uint8Array(CHUNK_SIZE)
      for (let i = 0; i < CHUNK_SIZE; i++) chunk[i] = i & 0xff

      while (sent < TOTAL_SIZE) {
        const remaining = TOTAL_SIZE - sent
        const size = Math.min(CHUNK_SIZE, remaining)
        controller.enqueue(size === CHUNK_SIZE ? chunk : chunk.slice(0, size))
        sent += size
      }
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': TOTAL_SIZE.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
}
