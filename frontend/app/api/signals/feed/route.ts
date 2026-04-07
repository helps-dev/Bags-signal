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

function headers(source: 'bags' | 'mock', reason?: string, hasError = false): Headers {
  const h = new Headers();
  h.set('X-Bags-Data-Source', source);
  h.set('X-Bags-Feed-Error', hasError ? '1' : '0');
  h.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  if (reason) h.set('X-Error-Reason', reason.slice(0, 200));
  return h;
}

export async function GET() {
  const backendUrl = backendBase();
  console.log('[API Route] Fetching from backend:', backendUrl);
  
  try {
    const response = await fetch(`${backendUrl}/api/signals/feed`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    console.log('[API Route] Backend response status:', response.status);

    if (!response.ok) {
      const body = await response.text();
      console.error('[API Route] Backend error:', response.status, body.slice(0, 200));
      return NextResponse.json(MOCK_FEED, {
        headers: headers('mock', `backend status ${response.status}: ${body}`, true),
      });
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error('[API Route] Backend returned non-array:', typeof data);
      if (lastGoodFeed.length > 0) {
        return NextResponse.json(lastGoodFeed, {
          headers: headers('bags', 'using cached data'),
        });
      }
      return NextResponse.json(MOCK_FEED, {
        headers: headers('mock', 'backend returned non-array feed', true),
      });
    }

    console.log('[API Route] Success! Got', data.length, 'tokens from backend');
    lastGoodFeed = data;
    return NextResponse.json(data, {
      headers: headers('bags', `${data.length} tokens`),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[API Route] Fetch error:', errorMsg);
    
    if (lastGoodFeed.length > 0) {
      return NextResponse.json(lastGoodFeed, {
        headers: headers('bags', 'using cached data after error'),
      });
    }
    return NextResponse.json(MOCK_FEED, {
      headers: headers('mock', errorMsg, true),
    });
  }
}
