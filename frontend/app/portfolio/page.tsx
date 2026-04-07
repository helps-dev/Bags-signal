'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Coins, Download, RefreshCw } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

const SOL_USD = 141

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [portfolioData, setPortfolioData] = useState<any>({
    totalFeesSol: 0,
    tokensLaunched: 0,
    partnerReferrals: 0,
    tokens: []
  })
  const { connected, publicKey, signTransaction } = useWallet()

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!connected || !publicKey) {
        // Reset to empty state when wallet disconnected
        setPortfolioData({
          totalFeesSol: 0,
          totalFeesUsd: 0,
          claimedSol: 0,
          pendingSol: 0,
          tokensLaunched: 0,
          partnerReferrals: 0,
          tokens: [],
          launchedTokensList: []
        });
        return;
      }
      
      setIsLoading(true);
      try {
        const res = await fetch(`/api/fees/positions?walletAddress=${publicKey.toBase58()}`);
        if (res.ok) {
          const data = await res.json();
          setPortfolioData(data);
        } else {
          console.error('Failed to fetch portfolio:', await res.text());
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPortfolio();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey])

  const handleClaimAll = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!portfolioData.tokens || portfolioData.tokens.length === 0) {
      alert('No claimable positions found');
      return;
    }

    setIsLoading(true);
    try {
      // Claim fees for all tokens
      const claimPromises = portfolioData.tokens.map(async (token: any) => {
        const res = await fetch('/api/fees/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            tokenMint: token.tokenMint
          })
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Claim failed');
        }
        
        return await res.json();
      });

      const results = await Promise.allSettled(claimPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (successful > 0) {
        alert(`Successfully claimed fees for ${successful} token(s)${failed > 0 ? `, ${failed} failed` : ''}`);
        
        // Refresh portfolio data
        const res = await fetch(`/api/fees/positions?walletAddress=${publicKey.toBase58()}`);
        if (res.ok) {
          const data = await res.json();
          setPortfolioData(data);
        }
      } else {
        alert('Failed to claim fees. Please try again.');
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      alert(`Error claiming fees: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="relative mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-primary-container/[0.05] blur-3xl" />
        <header className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
              Revenue dashboard
            </h1>
            <p className="mt-2 text-on-surface-variant">
              Lifetime fees, launched tokens, and referral footprint (mock data until Bags APIs are connected).
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-outline-variant/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleClaimAll}
              disabled={isLoading}
              className="rounded-lg bg-primary-container px-6 py-2 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="inline h-4 w-4 animate-spin" />
              ) : (
                (!connected ? 'Connect to Claim' : 'Claim all fees')
              )}
            </button>
          </div>
        </header>

        <section className="relative mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="group rounded-xl border border-white/5 bg-surface-container-low p-8 transition-colors hover:border-primary-container/20">
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Total lifetime fees
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold text-[#00ffa3] tabular-nums">
                {portfolioData.totalFeesSol.toLocaleString()}
              </span>
              <span className="font-headline text-xl text-on-primary-container/60">SOL</span>
            </div>
            <p className="mt-2 font-medium text-on-surface-variant/60">
              ≈ ${(portfolioData.totalFeesSol * SOL_USD).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
            </p>
          </div>
          <div className="group rounded-xl border border-white/5 bg-surface-container-low p-8 transition-colors hover:border-secondary-container/20">
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Tokens launched
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold text-secondary-container tabular-nums">
                {portfolioData.tokensLaunched}
              </span>
              <span className="font-headline text-xl text-secondary-container/60">active</span>
            </div>
            <p className="mt-2 font-medium text-on-surface-variant/60">+2 in the last 7 days</p>
          </div>
          <div className="group rounded-xl border border-white/5 bg-surface-container-low p-8 transition-colors hover:border-tertiary-fixed-dim/20">
            <p className="text-sm font-medium uppercase tracking-widest text-on-surface-variant">
              Partner referrals
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-headline text-5xl font-bold text-tertiary-fixed-dim tabular-nums">
                {portfolioData.partnerReferrals}
              </span>
              <span className="font-headline text-xl text-tertiary-fixed-dim/60">wallets</span>
            </div>
            <p className="mt-2 font-medium text-on-surface-variant/60">12.4% conversion (demo)</p>
          </div>
        </section>

        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-container-low">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-on-surface-variant">
                <th className="p-4 font-medium">Token</th>
                <th className="p-4 text-right font-medium">Lifetime fees</th>
                <th className="p-4 text-right font-medium">Claimable</th>
                <th className="p-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.tokens.map((token: any) => (
                <tr
                  key={token.mint}
                  className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/15 font-bold text-primary-container">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{token.name}</p>
                        <p className="text-on-surface-variant">${token.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right tabular-nums text-white">
                    {token.lifetimeFees.toLocaleString()} SOL
                  </td>
                  <td className="p-4 text-right tabular-nums text-primary-container">
                    {token.claimableFees.toLocaleString()} SOL
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      className="rounded-lg bg-surface-container-high px-4 py-2 text-xs font-bold text-primary-container transition-colors hover:bg-primary-container/15"
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant">
          <Coins className="h-4 w-4" />
          Wire to GET /token-launch/lifetime-fees, /fee-claiming/positions, and POST claim-v3 per PRD.
        </p>
      </div>
    </AppShell>
  )
}
