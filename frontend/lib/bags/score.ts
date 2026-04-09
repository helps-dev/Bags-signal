import { bagsGet } from './client'
import type { BagsPoolInfo } from './types'

export interface BagsScoreResult {
  score: number
  factors: Record<string, number | string | boolean | null>
  source: 'bags' | 'mock'
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

/** Heuristic 0–100 from Bags-only signals (no Birdeye yet). Aligns loosely with PRD weights. */
export async function computeBagsHeuristicScore(mint: string, apiKey: string): Promise<BagsScoreResult> {
  const factors: Record<string, number | string | boolean | null> = {}

  let feesLamports = BigInt(0)
  try {
    const raw = await bagsGet<string | number>('/token-launch/lifetime-fees', apiKey, { tokenMint: mint })
    const feesStr = raw != null ? String(raw) : '0'
    feesLamports = BigInt(feesStr || '0')
    factors.lifetimeFeesLamports = feesStr
  } catch {
    factors.lifetimeFeesLamports = null
  }

  let pool: BagsPoolInfo | null = null
  try {
    pool = await bagsGet<BagsPoolInfo>('/solana/bags/pools/token-mint', apiKey, { tokenMint: mint })
    factors.hasDbcPool = Boolean(pool.dbcPoolKey)
    factors.hasDammV2 = Boolean(pool.dammV2PoolKey)
  } catch {
    factors.hasDbcPool = false
    factors.hasDammV2 = false
  }

  let score = 38

  if (pool?.dammV2PoolKey) {
    score += 28
    factors.migrationBonus = 28
  } else if (pool?.dbcPoolKey) {
    score += 18
    factors.dbcBonus = 18
  }

  const feeSol = Number(feesLamports) / 1e9
  if (feeSol > 0) {
    const feePoints = clamp(Math.log10(1 + feeSol) * 12, 0, 22)
    score += feePoints
    factors.feeActivityPoints = Math.round(feePoints * 10) / 10
  } else {
    factors.feeActivityPoints = 0
  }

  score = Math.round(clamp(score, 15, 98))

  return { score, factors, source: 'bags' }
}

export function mockScoreFromMint(mint: string): BagsScoreResult {
  let h = 0
  for (let i = 0; i < mint.length; i++) {
    h = (h * 31 + mint.charCodeAt(i)) >>> 0
  }
  const score = 40 + (h % 56)
  return {
    score,
    factors: { algorithm: 'deterministic_mock' },
    source: 'mock',
  }
}
