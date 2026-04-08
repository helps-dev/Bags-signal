import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://bags-signal.onrender.com'

    // Forward the request body directly to backend
    const body = await request.json()

    const {
      name,
      symbol,
      description,
      twitter,
      website,
      feePercentage,
      recipients,
      initialBuy,
      slippage,
      creatorWallet,
      image,
    } = body

    if (!name || !symbol || !creatorWallet) {
      return NextResponse.json(
        { error: 'Token name, symbol, and creator wallet are required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${backendUrl}/api/tokens/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        symbol,
        description,
        twitter,
        website,
        feePercentage,
        recipients,
        initialBuy,
        slippage,
        creatorWallet,
        image,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to launch token' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Launch API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
