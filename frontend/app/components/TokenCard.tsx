'use client'

import { Clock, Download, ExternalLink, ExternalLink as LinkIcon, Eye, Share2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import ScoreBadge from './ScoreBadge'
import type { FeedToken } from './SignalFeed'
import { formatTimeAgo } from '../../lib/utils/timeFormat'

export default function TokenCard({ token }: { token: FeedToken }) {
  const [isWatching, setIsWatching] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const handleTrade = () => {
    const tradeUrl = `https://bags.fm/${token.tokenMint}`
    window.open(tradeUrl, '_blank', 'noopener,noreferrer')
  }

  const handleWatch = () => {
    setIsWatching(!isWatching)
    console.log(`${isWatching ? 'Unwatched' : 'Watched'} token:`, token.symbol)
  }

  const handleShare = async () => {
    setShowShareModal(true)
  }

  const handleCopyLink = async () => {
    const shareUrl = `https://bags.fm/${token.tokenMint}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return
    
    setIsGeneratingImage(true)
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      })
      
      const link = document.createElement('a')
      link.download = `bags-signal-${token.symbol}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleShareNative = async () => {
    if (!shareCardRef.current) return
    
    setIsGeneratingImage(true)
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
      })
      
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `bags-signal-${token.symbol}.png`, { type: 'image/png' })
      
      const shareUrl = `https://bags.fm/${token.tokenMint}`
      const shareText = `Check out ${token.name} (${token.symbol}) on @BagsApp - AI Score: ${token.score || '--'}/100\n\nFound via Bags Signal:\n`
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${token.name} (${token.symbol})`,
          text: shareText,
          url: shareUrl,
          files: [file],
        })
      } else {
        // Fallback for desktop: Try copying image to clipboard, then open Twitter intent
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({
              'image/png': blob
            })
          ])
          alert('Share card copied to clipboard! Paste it into your tweet.')
        } catch {
          // Ignore copy errors
        }
        const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        window.open(xUrl, '_blank')
      }
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleExternal = () => {
    const solscanUrl = `https://solscan.io/token/${token.tokenMint}`
    window.open(solscanUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <article className="glass-card neon-glow group rounded-xl p-5 transition-all duration-300 hover:border-primary-container/25">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary-container/20 bg-primary-container/10">
              {token.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={token.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <span className="font-headline text-lg font-bold text-primary-container">
                  {token.symbol.slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-headline font-semibold text-white">{token.name}</h3>
              <p className="text-sm text-on-surface-variant">${token.symbol}</p>
            </div>
          </div>
          {token.score !== undefined && <ScoreBadge score={token.score} />}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              token.status === 'LIVE'
                ? 'bg-primary-container/15 text-primary-container'
                : 'bg-tertiary-fixed-dim/15 text-tertiary-fixed-dim'
            }`}
          >
            {token.status === 'LIVE' ? 'Live' : 'Pre-Launch'}
          </span>
          {token.bagsStatus && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-on-surface-variant">
              {token.bagsStatus}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm text-on-surface-variant">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{formatTimeAgo(token.launchTime)}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-container-high/80 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/45">24h volume</p>
            <p className="font-headline font-semibold tabular-nums text-white">
              {token.volume24h != null && token.volume24h > 0
                ? `${token.volume24h.toLocaleString()}`
                : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-surface-container-high/80 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/45">Liquidity</p>
            <p className="text-sm text-secondary-container">Meteora / Bags pool</p>
          </div>
        </div>

        <p className="mb-4 font-mono text-xs text-on-surface-variant">
          {token.creatorName ? (
            <>Creator <span className="text-primary-container">@{token.creatorName}</span> · {token.creatorWallet}</>
          ) : (
            <>Creator {token.creatorWallet}</>
          )}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTrade}
            className="flex-1 rounded-lg bg-primary-container py-2.5 text-sm font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-95"
          >
            Trade
          </button>
          <button
            type="button"
            onClick={handleWatch}
            className={`rounded-lg p-2.5 transition-all active:scale-95 ${
              isWatching
                ? 'bg-primary-container/20 text-primary-container'
                : 'bg-surface-container-high text-white/50 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={isWatching ? 'Unwatch' : 'Watch'}
            title={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Eye className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg bg-surface-container-high p-2.5 text-white/50 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              aria-label="Share"
              title="Share token"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {showCopied && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary-container px-2 py-1 text-xs text-on-primary-container">
                Copied!
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleExternal}
            className="rounded-lg bg-surface-container-high p-2.5 text-white/50 transition-all hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="View on Solscan"
            title="View on Solscan"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </article>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setShowShareModal(false)}>
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              className="absolute -top-12 right-0 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Share Card Preview */}
            <div ref={shareCardRef} className="rounded-xl bg-gradient-to-br from-surface-container via-surface-container-high to-surface-container p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-primary-container/30 bg-primary-container/10">
                    {token.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={token.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      <span className="font-headline text-2xl font-bold text-primary-container">
                        {token.symbol.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-white">{token.name}</h3>
                    <p className="text-on-surface-variant">${token.symbol}</p>
                  </div>
                </div>
                {token.score !== undefined && (
                  <div className="text-right">
                    <div className="text-xs text-white/50">AI Score</div>
                    <div className="font-headline text-3xl font-bold text-primary-container">{token.score}</div>
                  </div>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-container-low p-3">
                  <p className="mb-1 text-xs text-white/50">Status</p>
                  <p className="font-semibold text-primary-container">{token.status}</p>
                </div>
                <div className="rounded-lg bg-surface-container-low p-3">
                  <p className="mb-1 text-xs text-white/50">24h Volume</p>
                  <p className="font-semibold text-white">
                    {token.volume24h != null && token.volume24h > 0
                      ? `$${token.volume24h.toLocaleString()}`
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-primary-container/20 bg-primary-container/5 p-3">
                <p className="text-xs text-white/70 mb-1">bags.fm/{token.tokenMint.slice(0, 8)}...</p>
                <p className="text-[10px] text-white/50">Powered by Bags Signal</p>
              </div>
            </div>

            {/* Share Actions */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                disabled={isGeneratingImage}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-surface-container-high py-3 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                <LinkIcon className="h-4 w-4" />
                Copy Link
              </button>
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isGeneratingImage}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-surface-container-high py-3 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isGeneratingImage ? 'Generating...' : 'Download'}
              </button>
              <button
                type="button"
                onClick={handleShareNative}
                disabled={isGeneratingImage}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary-container py-3 text-sm font-bold text-on-primary-container hover:brightness-110 disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
