import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
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
    } = body

    if (!name || !symbol || !creatorWallet) {
      return NextResponse.json(
        { error: 'Token name, symbol, and creator wallet are required' },
        { status: 400 }
      )
    }

    // Call backend API to launch token
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/tokens/launch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend API error:', error)
      return NextResponse.json(
        { error: error.error || 'Failed to launch token' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Launch API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
