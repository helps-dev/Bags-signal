import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, tokenMint } = body

    if (!walletAddress || !tokenMint) {
      return NextResponse.json(
        { error: 'Wallet address and token mint are required' },
        { status: 400 }
      )
    }

    // Call backend API to claim fees
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${backendUrl}/api/fees/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, tokenMint }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Backend API error:', error)
      return NextResponse.json(
        { error: error.error || 'Failed to claim fees' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Claim API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
