import type { BagsTokenLaunchFeedItem } from './types'

/** UI filter uses PRE_LAUNCH vs "live-ish" states */
export type UiLaunchStatus = 'PRE_LAUNCH' | 'LIVE'

export interface MappedFeedToken {
  tokenMint: string
  name: string
  symbol: string
  imageUrl?: string
  status: UiLaunchStatus
  launchTime: string
  creatorWallet: string
  creatorName?: string
  volume24h?: number
  bagsStatus: BagsTokenLaunchFeedItem['status']
  twitter?: string | null
  website?: string | null
}

function mapStatus(s: BagsTokenLaunchFeedItem['status']): UiLaunchStatus {
  if (s === 'PRE_LAUNCH') return 'PRE_LAUNCH'
  return 'LIVE'
}



/** Format creator wallet address for display */
function formatCreatorWallet(creator?: string | null): string {
  if (!creator) return 'Unknown'
  if (creator.length <= 8) return creator
  return `${creator.slice(0, 4)}...${creator.slice(-4)}`
}

/** Extract creator name from Twitter handle if available */
function getCreatorName(twitter?: string | null): string | undefined {
  if (!twitter) return undefined
  // Remove @ if present
  const handle = twitter.startsWith('@') ? twitter.slice(1) : twitter
  return handle || undefined
}

export function mapBagsFeedItem(item: BagsTokenLaunchFeedItem): MappedFeedToken {
  return {
    tokenMint: item.tokenMint,
    name: item.name,
    symbol: item.symbol,
    imageUrl: item.image || undefined,
    status: mapStatus(item.status),
    // Use createdAt from API if available, fallback to Date.now
    launchTime: item.createdAt || item.created_at || new Date().toISOString(),
    creatorWallet: formatCreatorWallet(item.creator || item.creator_wallet || item.user_address),
    creatorName: getCreatorName(item.twitter),
    volume24h: item.volume !== undefined ? item.volume : (item.volume24h !== undefined ? item.volume24h : 0),
    bagsStatus: item.status,
    twitter: item.twitter,
    website: item.website,
    // Store launchSignature for blockchain query
    launchSignature: item.launchSignature,
  } as any
}
