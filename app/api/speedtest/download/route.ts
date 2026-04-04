import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const CHUNK_SIZE = 1024 * 1024 // 1 MB
const TOTAL_CHUNKS = 25 // 25 MB total

let randomChunk: Uint8Array | null = null

export async function GET(request: NextRequest) {
  if (!randomChunk) {
    randomChunk = new Uint8Array(CHUNK_SIZE)
    for (let i = 0; i < CHUNK_SIZE; i++) {
      randomChunk[i] = Math.floor(Math.random() * 256)
    }
  }

  const totalSize = CHUNK_SIZE * TOTAL_CHUNKS

  const stream = new ReadableStream({
    start(controller) {
      for (let i = 0; i < TOTAL_CHUNKS; i++) {
        controller.enqueue(randomChunk!)
      }
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': totalSize.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  })
}
