import { NextRequest, NextResponse } from 'next/server'

const PAYLOAD_SIZE = 25 * 1024 * 1024 // 25MB

const buffer = new Uint8Array(PAYLOAD_SIZE)
for (let i = 0; i < PAYLOAD_SIZE; i++) {
  buffer[i] = Math.floor(Math.random() * 256)
}

export async function GET(request: NextRequest) {
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': PAYLOAD_SIZE.toString(),
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
