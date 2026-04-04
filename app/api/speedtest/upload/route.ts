import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const data = await request.arrayBuffer()
  return NextResponse.json({
    success: true,
    bytesReceived: data.byteLength,
  })
}
