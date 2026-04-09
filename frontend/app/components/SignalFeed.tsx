'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import TokenCard from './TokenCard'
import FilterBar, { type FilterState } from './FilterBar'
import { useWebSocket } from '../../lib/hooks/useWebSocket'
import { InlineLoader } from './SignalLoader'

export interface FeedToken {
  tokenMint: string
  name: string
  symbol: string
  imageUrl?: string
  status: 'PRE_LAUNCH' | 'LIVE'
  launchTime: string
  creatorWallet: string
  creatorName?: string
  score?: number
  volume24h?: number
  bagsStatus?: string
  twitter?: string | null
  website?: string | null
}

// Persistent score store - survives WebSocket updates
const scoreStore = new Map<string, number>()
// Persistent volume store - survives WebSocket updates
const volumeStore = new Map<string, number>()
// Track which mints are currently being fetched
const fetchingScores = new Set<string>()

async function fetchScoreOnce(mint: string): Promise<number | undefined> {
  if (fetchingScores.has(mint)) return scoreStore.get(mint)
  if (scoreStore.has(mint)) return scoreStore.get(mint)

  fetchingScores.add(mint)
  try {
    const res = await fetch(`/api/signals/score/${encodeURIComponent(mint)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return undefined
    const data = await res.json()
    if (typeof data.score === 'number') {
      scoreStore.set(mint, data.score)
      return data.score
    }
    return undefined
  } catch {
    return undefined
  } finally {
    fetchingScores.delete(mint)
  }
}

// Merge stored scores and volumes into token list
function mergeStores(list: FeedToken[]): FeedToken[] {
  return list.map(t => ({
    ...t,
    score: t.score ?? scoreStore.get(t.tokenMint),
    volume24h: t.volume24h ?? volumeStore.get(t.tokenMint),
  }))
}

export default function SignalFeed() {
  const [tokens, setTokens] = useState<FeedToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedSource, setFeedSource] = useState<'bags' | 'mock' | null>(null)
  const [feedError, setFeedError] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    bagsStatus: [],
    scoreRange: 'all',
    sortBy: 'newest',
    hasTwitter: null,
    hasWebsite: null,
  })

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
  const { lastMessage } = useWebSocket(wsUrl, 'signals')

  // Fetch scores in batches of 5 with delay to avoid overloading
  const fetchScoresBatch = useCallback(async (list: FeedToken[]) => {
    const toFetch = list.filter(t => !scoreStore.has(t.tokenMint)).slice(0, 30)
    if (toFetch.length === 0) return

    const BATCH = 5
    for (let i = 0; i < toFetch.length; i += BATCH) {
      const batch = toFetch.slice(i, i + BATCH)
      await Promise.all(batch.map(t => fetchScoreOnce(t.tokenMint)))
      // Update state after each batch so scores appear progressively
      setTokens(prev => mergeStores(prev))
      // Small delay between batches
      if (i + BATCH < toFetch.length) {
        await new Promise(r => setTimeout(r, 300))
      }
    }
  }, [])

  const load = useCallback(async (initial = false) => {
    if (initial) setIsLoading(true)
    try {
      const response = await fetch('/api/signals/feed', { cache: 'no-store' })
      const source = (response.headers.get('x-bags-data-source') as 'bags' | 'mock') || 'mock'
      setFeedSource(source)
      setFeedError(response.headers.get('x-bags-feed-error') === '1')

      if (!response.ok) return

      const data = await response.json()
      if (!Array.isArray(data)) return

      const list = data as FeedToken[]

      // Save volumes to store
      list.forEach(t => {
        if (t.volume24h != null) volumeStore.set(t.tokenMint, t.volume24h)
      })

      // Merge with existing stores and set state
      const merged = mergeStores(list)
      setTokens(merged)

      // Fetch scores in background (only for real data)
      if (source === 'bags') {
        fetchScoresBatch(list)
      }
    } catch (err) {
      console.error('[SignalFeed] Load error:', err)
      setFeedSource('mock')
      setFeedError(true)
    } finally {
      if (initial) setIsLoading(false)
    }
  }, [fetchScoresBatch])

  // WebSocket: merge incoming data with stored scores/volumes, don't overwrite
  useEffect(() => {
    if (lastMessage?.type === 'update' && lastMessage.channel === 'signals') {
      const newTokens = lastMessage.data as FeedToken[]
      if (!Array.isArray(newTokens)) return

      // Save new volumes to store
      newTokens.forEach(t => {
        if (t.volume24h != null) volumeStore.set(t.tokenMint, t.volume24h)
      })

      // Merge with stores - preserve existing scores and volumes
      const merged = mergeStores(newTokens)
      setTokens(merged)

      // Fetch scores for any new tokens not yet scored
      fetchScoresBatch(newTokens)
    }
  }, [lastMessage, fetchScoresBatch])

  useEffect(() => {
    load(true)
    const interval = setInterval(() => load(false), 60000)
    return () => clearInterval(interval)
  }, [load])

  const topTicker = tokens[0]

  const filtered = useMemo(() => {
    return tokens.filter((t) => {
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (
          !t.name.toLowerCase().includes(search) &&
          !t.symbol.toLowerCase().includes(search) &&
          !t.creatorWallet?.toLowerCase().includes(search) &&
          !t.creatorName?.toLowerCase().includes(search)
        ) return false
      }
      if (filters.status !== 'all') {
        if (filters.status === 'live' && t.status !== 'LIVE') return false
        if (filters.status === 'pre-launch' && t.status !== 'PRE_LAUNCH') return false
      }
      if (filters.bagsStatus.length > 0) {
        if (!t.bagsStatus || !filters.bagsStatus.includes(t.bagsStatus)) return false
      }
      if (filters.scoreRange !== 'all') {
        const score = t.score ?? 0
        if (filters.scoreRange === 'high' && score < 70) return false
        if (filters.scoreRange === 'medium' && (score < 60 || score >= 70)) return false
        if (filters.scoreRange === 'low' && (score < 50 || score >= 60)) return false
      }
      if (filters.hasTwitter === true && !t.twitter) return false
      if (filters.hasWebsite === true && !t.website) return false
      return true
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest': return new Date(b.launchTime).getTime() - new Date(a.launchTime).getTime()
        case 'oldest': return new Date(a.launchTime).getTime() - new Date(b.launchTime).getTime()
        case 'volume-high': return (b.volume24h ?? 0) - (a.volume24h ?? 0)
        case 'volume-low': return (a.volume24h ?? 0) - (b.volume24h ?? 0)
        case 'score-high': return (b.score ?? 0) - (a.score ?? 0)
        case 'score-low': return (a.score ?? 0) - (b.score ?? 0)
        case 'name-az': return a.name.localeCompare(b.name)
        case 'name-za': return b.name.localeCompare(a.name)
        default: return 0
      }
    })
  }, [tokens, filters])

  return (
    <div className="px-4 pb-12 pt-8 md:px-8">
      <header className="mb-8">
        <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
              Signal Feed
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-3 py-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary-container" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-container">
                  Live Scanning
                </span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Real-time intelligence from the Solana ecosystem.
              </p>
            </div>
          </div>
          <div className="glass-panel flex items-center gap-4 rounded-xl px-4 py-3">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Feed interval</div>
              <div className="font-headline text-sm font-bold text-secondary-container">30s</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tokens</div>
              <div className="font-headline text-sm font-bold text-primary-container">{tokens.length}</div>
            </div>
          </div>
        </div>
        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-white/5 bg-surface-container-low">
          <div className="flex h-full shrink-0 items-center border-r border-white/5 bg-surface-container-high px-4">
            <span className="text-[10px] font-black uppercase tracking-tighter text-white/60">New Signal</span>
          </div>
          <div className="px-4 text-xs font-medium italic text-white/80">
            {topTicker ? (
              <>
                AI scoring active for{' '}
                <span className="font-bold text-primary-container">${topTicker.symbol}</span> • Status:{' '}
                {topTicker.status} • Alpha Score:{' '}
                <span className="text-primary-container">{topTicker.score ?? '—'}/100</span>
              </>
            ) : (
              <span className="text-white/50">Waiting for launch feed…</span>
            )}
          </div>
        </div>
      </header>

      {feedSource && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
          feedSource === 'bags' && !feedError
            ? 'border-primary-container/25 bg-primary-container/10 text-primary-container'
            : 'border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10 text-tertiary-fixed-dim'
        }`}>
          {feedSource === 'bags' && !feedError ? (
            <span>Data source: <strong>Bags.fm API</strong> — real-time token feed with volume &amp; AI scores.</span>
          ) : (
            <span>
              Data source: <strong>mock / fallback</strong>.{' '}
              {feedError ? 'Bags API request failed.' : 'Waiting for real data.'}
            </span>
          )}
        </div>
      )}

      <FilterBar filters={filters} onFilterChange={setFilters} totalTokens={tokens.length} filteredTokens={filtered.length} />

      {isLoading ? (
        <InlineLoader message="Fetching signals from Bags.fm..." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((token) => (
            <TokenCard key={token.tokenMint} token={token} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="py-20 text-center text-on-surface-variant">No tokens match your filters.</p>
      )}
    </div>
  )
}
