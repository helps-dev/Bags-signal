import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MOCK_FEED = [
  {
    tokenMint: 'So11111111111111111111111111111111111111112',
    name: 'Bags Moon',
    symbol: 'BAGMOON',
    imageUrl: '',
    status: 'LIVE',
    bagsStatus: 'MIGRATED',
    launchTime: new Date().toISOString(),
    creatorWallet: '...X6X5',
    volume24h: 45000,
  },
];
let lastGoodFeed: unknown[] = [];

function backendBase(): string {
  // BACKEND_URL is server-side only (preferred), fallback to NEXT_PUBLIC_API_URL
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

function headers(source: 'bags' | 'mock', reason?: string): Headers {
  const h = new Headers();
  h.set('X-Bags-Data-Source', source);
  h.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (reason) h.set('X-Error-Reason', reason.slice(0, 200));
  return h;
}

export async function GET() {
  try {
    const response = await fetch(`${backendBase()}/api/signals/feed`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(MOCK_FEED, {
        headers: headers('mock', `backend status ${response.status}: ${body}`),
      });
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      if (lastGoodFeed.length > 0) {
        return NextResponse.json(lastGoodFeed, {
          headers: headers('bags'),
        });
      }
      return NextResponse.json(MOCK_FEED, {
        headers: headers('mock', 'backend returned non-array feed'),
      });
    }

    lastGoodFeed = data;
    return NextResponse.json(data, {
      headers: headers('bags'),
    });
  } catch (error) {
    if (lastGoodFeed.length > 0) {
      return NextResponse.json(lastGoodFeed, {
        headers: headers('bags'),
      });
    }
    return NextResponse.json(MOCK_FEED, {
      headers: headers('mock', error instanceof Error ? error.message : String(error)),
    });
  }
}
