/** Bags API `TokenLaunchStatus` */
export type BagsLaunchStatus = 'PRE_LAUNCH' | 'PRE_GRAD' | 'MIGRATING' | 'MIGRATED'

export interface BagsTokenLaunchFeedItem {
  name: string
  symbol: string
  description: string
  image: string
  tokenMint: string
  status: BagsLaunchStatus
  twitter?: string | null
  website?: string | null
  launchSignature?: string | null
  uri?: string | null
  dbcPoolKey?: string | null
  dbcConfigKey?: string | null
  createdAt?: string | null
  creator?: string | null
  creator_wallet?: string | null
  user_address?: string | null
  created_at?: string | null
  volume?: number | null
  volume24h?: number | null
}

export interface BagsPoolInfo {
  tokenMint: string
  dbcConfigKey: string
  dbcPoolKey: string
  dammV2PoolKey?: string | null
}
