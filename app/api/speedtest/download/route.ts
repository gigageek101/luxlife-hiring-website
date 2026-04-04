import { NextResponse } from 'next/server'

const PAYLOAD_SIZE = 2 * 1024 * 1024 // 2MB

export async function GET() {
  const buffer = new Uint8Array(PAYLOAD_SIZE)
  for (let i = 0; i < PAYLOAD_SIZE; i++) {
    buffer[i] = Math.floor(Math.random() * 256)
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': PAYLOAD_SIZE.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
