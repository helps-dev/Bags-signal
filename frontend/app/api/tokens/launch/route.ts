import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function backendBase(): string {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://bags-signal.onrender.com'
}

export async function POST(request: NextRequest) {
  const backendUrl = backendBase()

  try {
    const body = await request.json()
    const { name, symbol, creatorWallet } = body

    if (!name || !symbol || !creatorWallet) {
      return NextResponse.json(
        { error: 'Token name, symbol, and creator wallet are required' },
        { status: 400 }
      )
    }

    let response: Response
    try {
      response = await fetch(`${backendUrl}/api/tokens/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000), // 30s timeout for Render cold start
      })
    } catch (fetchErr: any) {
      console.error('[launch] Backend unreachable:', fetchErr.message)
      return NextResponse.json(
        { error: `Backend unavailable: ${fetchErr.message}. The server may be starting up, please try again in 30 seconds.` },
        { status: 503 }
      )
    }

    // Always read as text first to avoid JSON parse crash on HTML error pages
    const rawText = await response.text()
    let data: any = {}
    try {
      data = JSON.parse(rawText)
    } catch {
      console.error('[launch] Backend returned non-JSON:', rawText.slice(0, 200))
      return NextResponse.json(
        { error: `Backend returned invalid response (status ${response.status}). Server may be starting up.` },
        { status: 502 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || `Backend error: ${response.status}` },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[launch] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
