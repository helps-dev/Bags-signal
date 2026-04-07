'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Check, ChevronRight, Rocket } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

const STEPS = ['Token Info', 'Fee Config', 'Launch Settings', 'Review'] as const

export default function TokenLauncherPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isWalletReady, setIsWalletReady] = useState(false)
  const { connected, publicKey, signTransaction } = useWallet()
  
  // Wait for wallet to be ready
  useEffect(() => {
    setIsWalletReady(true)
  }, [])
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    website: '',
    feePercentage: 1,
    recipients: [{ wallet: '', percentage: 100 }],
    initialBuy: 0,
    slippage: 5,
  })

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleLaunch = async () => {
    if (!isWalletReady || !connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    // Validate form data
    if (!formData.name || !formData.symbol) {
      alert('Please fill in token name and symbol');
      return;
    }

    setIsLoading(true);
    try {
      // Call backend API to launch token
      const res = await fetch('/api/tokens/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorWallet: publicKey.toBase58(),
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Launch failed');
      }
      
      const result = await res.json();
      
      // Show success message with transaction signature
      if (result.signature) {
        alert(`Token launched successfully!\n\nTransaction: ${result.signature}\n\nView on Solscan: https://solscan.io/tx/${result.signature}`);
      } else {
        alert('Token launch initiated! Check your wallet for transaction confirmation.');
      }
      
      // Reset form
      setFormData({
        name: '',
        symbol: '',
        description: '',
        twitter: '',
        website: '',
        feePercentage: 1,
        recipients: [{ wallet: '', percentage: 100 }],
        initialBuy: 0,
        slippage: 5,
      });
      setStep(1);
      
    } catch (e: any) {
      console.error('Launch error:', e);
      alert(`Error launching token: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          Launch Your Token
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Four-step wizard: metadata, fee share, launch params, then sign (Bags.fm + Solana).
        </p>

        <div className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-1 items-center gap-2 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-headline font-bold ${
                    s < step
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                      : s === step
                        ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                        : 'border border-outline-variant/30 bg-surface-container text-white/40'
                  }`}
                >
                  {s < step ? <Check className="h-5 w-5" /> : s}
                </div>
                <span
                  className={`hidden text-center text-[10px] font-headline font-medium uppercase tracking-widest sm:block ${
                    s === step ? 'text-primary-container' : 'text-white/40'
                  }`}
                >
                  {STEPS[s - 1]}
                </span>
              </div>
              {s < 4 && (
                <div className="mb-6 h-[2px] min-w-[1rem] flex-1 bg-surface-container-highest">
                  <div
                    className="h-full bg-primary-container transition-all duration-500"
                    style={{ width: s < step ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="glass-card mt-10 rounded-xl p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="mb-6 flex items-center gap-3">
                <Rocket className="h-6 w-6 text-secondary-container" />
                <h2 className="font-headline text-xl font-bold text-white">Basic token information</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                    Token name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="e.g. Bags Artificial Intelligence"
                  />
                </div>
                <div>
                  <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                    Symbol
                  </label>
                  <input
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="e.g. BAGS"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="Tell the community what this token is for."
                  />
                </div>
                <div>
                  <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                    Twitter / X
                  </label>
                  <input
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="@handle"
                  />
                </div>
                <div>
                  <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                    Website
                  </label>
                  <input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-headline text-xl font-bold text-white">Fee configuration</h2>
              <div>
                <label className="text-sm text-on-surface-variant">Fee percentage</label>
                <input
                  type="number"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={formData.feePercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, feePercentage: Number(e.target.value) })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white focus:border-primary-container focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant">Recipients</label>
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="mt-2 flex gap-2">
                    <input
                      value={recipient.wallet}
                      onChange={(e) => {
                        const next = [...formData.recipients]
                        next[index] = { ...next[index], wallet: e.target.value }
                        setFormData({ ...formData, recipients: next })
                      }}
                      className="flex-1 rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white"
                      placeholder="Wallet address"
                    />
                    <input
                      type="number"
                      value={recipient.percentage}
                      onChange={(e) => {
                        const next = [...formData.recipients]
                        next[index] = {
                          ...next[index],
                          percentage: Number(e.target.value),
                        }
                        setFormData({ ...formData, recipients: next })
                      }}
                      className="w-24 rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-headline text-xl font-bold text-white">Launch settings</h2>
              <div>
                <label className="text-sm text-on-surface-variant">Initial buy (SOL)</label>
                <input
                  type="number"
                  value={formData.initialBuy}
                  onChange={(e) => setFormData({ ...formData, initialBuy: Number(e.target.value) })}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-on-surface-variant">Slippage (%)</label>
                <input
                  type="number"
                  value={formData.slippage}
                  onChange={(e) => setFormData({ ...formData, slippage: Number(e.target.value) })}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-surface-container py-3 px-4 text-white"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-headline text-xl font-bold text-white">Review & sign</h2>
              <div className="space-y-3 rounded-lg bg-surface-container-high/50 p-4">
                {[
                  ['Token', `${formData.name} ($${formData.symbol})`],
                  ['Fee', `${formData.feePercentage}%`],
                  ['Recipients', String(formData.recipients.length)],
                  ['Initial buy', `${formData.initialBuy} SOL`],
                  ['Slippage', `${formData.slippage}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
              <p className="rounded-lg border border-tertiary-fixed-dim/25 bg-tertiary-fixed-dim/10 p-4 text-sm text-tertiary-fixed-dim">
                Estimated network fee ~0.02–0.05 SOL. Dexscreener order can run after launch via Bags API.
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-white/15 bg-surface-container-high px-6 py-3 text-white transition-colors hover:bg-white/10"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-bold text-on-primary-container hover:brightness-110"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={isLoading || !isWalletReady}
                className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-bold text-on-primary-container disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary-container border-t-transparent" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {isLoading ? 'Signing…' : (!isWalletReady || !connected ? 'Connect to Launch' : 'Launch token')}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
