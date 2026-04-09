import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function backendBase(): string {
  return process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

function isValidMintAddress(mint: string): boolean {
  if (!mint || mint.length < 32 || mint.length > 44) return false;
  return /^[1-9A-HJ-NP-Za-km-z]+$/.test(mint);
}

export async function GET(_req: Request, { params }: { params: { mint: string } }) {
  const mint = decodeURIComponent(params.mint || '').trim();
  if (!mint) {
    return NextResponse.json({ error: 'mint parameter is required', code: 'MISSING_MINT' }, { status: 400 });
  }

  if (!isValidMintAddress(mint)) {
    return NextResponse.json({ error: 'Invalid mint address format', code: 'INVALID_MINT' }, { status: 400 });
  }

  try {
    const response = await fetch(`${backendBase()}/api/signals/score/${encodeURIComponent(mint)}`, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    const body = await response.text();
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from backend', code: 'BACKEND_INVALID_JSON' },
        { status: 502 }
      );
    }

    return NextResponse.json(json, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Backend unavailable',
        code: 'BACKEND_UNAVAILABLE',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
