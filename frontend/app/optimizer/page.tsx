'use client'

import { useMemo, useState } from 'react'
import AppShell from '../components/AppShell'
import { TrendingUp, Wallet } from 'lucide-react'

const SOL_USD = 141

export default function FeeOptimizerPage() {
  const [dailyVolumeSol, setDailyVolumeSol] = useState(12500)
  const [feePercent, setFeePercent] = useState(0.35)
  const [recipientCount, setRecipientCount] = useState(2)

  const projections = useMemo(() => {
    const dailyFeeSol = (dailyVolumeSol * feePercent) / 100
    return {
      dailySol: dailyFeeSol,
      weeklySol: dailyFeeSol * 7,
      monthlySol: dailyFeeSol * 30,
      dailyUsd: dailyFeeSol * SOL_USD,
    }
  }, [dailyVolumeSol, feePercent])

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          Fee optimizer <span className="text-secondary-container">&amp; simulator</span>
        </h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          Project creator and partner earnings from estimated daily volume (SOL) and fee percentage — aligned with Bags
          fee-share flows (apply via POST /fee-share/config when wired).
        </p>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <section className="space-y-6 border-l border-primary-container/30 bg-surface-container-low p-6 rounded-xl lg:col-span-5 lg:p-8">
            <h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-primary-container">◆</span> Simulation parameters
            </h2>
            <div className="space-y-8">
              <div>
                <div className="mb-4 flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Daily volume (SOL)
                  </label>
                  <span className="font-headline font-bold text-primary-container">
                    {dailyVolumeSol.toLocaleString()} SOL
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={100}
                  value={dailyVolumeSol}
                  onChange={(e) => setDailyVolumeSol(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer accent-primary-container"
                />
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-tighter text-white/30">
                  <span>0</span>
                  <span>50,000 SOL</span>
                </div>
              </div>
              <div>
                <div className="mb-4 flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                    Target fee (%)
                  </label>
                  <span className="font-headline font-bold text-secondary-container">{feePercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={feePercent}
                  onChange={(e) => setFeePercent(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer accent-secondary-container"
                />
                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-tighter text-white/30">
                  <span>0%</span>
                  <span>1.0%</span>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-white/60">
                Fee recipients (count)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={recipientCount}
                onChange={(e) => setRecipientCount(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white"
              />
            </div>
          </section>

          <section className="space-y-4 lg:col-span-7">
            <h2 className="font-headline flex items-center gap-2 text-lg font-semibold text-white">
              <TrendingUp className="h-5 w-5 text-primary-container" />
              Revenue projection
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-surface-container-low p-5">
                <p className="text-xs text-on-surface-variant">Daily (SOL)</p>
                <p className="font-headline mt-1 text-2xl font-bold tabular-nums text-white">
                  {projections.dailySol.toFixed(2)}
                </p>
                <p className="text-xs text-white/40">≈ ${projections.dailyUsd.toFixed(0)} USD</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-surface-container-low p-5">
                <p className="text-xs text-on-surface-variant">Weekly (SOL)</p>
                <p className="font-headline mt-1 text-2xl font-bold tabular-nums text-primary-container">
                  {projections.weeklySol.toFixed(1)}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-surface-container-low p-5">
                <p className="text-xs text-on-surface-variant">Monthly (SOL)</p>
                <p className="font-headline mt-1 text-2xl font-bold tabular-nums text-secondary-container">
                  {projections.monthlySol.toFixed(0)}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-primary-container/20 bg-primary-container/5 p-4 text-sm text-primary-container">
              <strong>Per recipient (monthly):</strong>{' '}
              {(projections.monthlySol / Math.max(1, recipientCount)).toFixed(2)} SOL
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-headline font-bold text-on-primary-container transition-all hover:brightness-110"
            >
              <Wallet className="h-4 w-4" />
              Apply configuration
            </button>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
