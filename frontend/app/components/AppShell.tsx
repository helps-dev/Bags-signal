'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Activity,
  Bell,
  Menu,
  Rocket,
  Search,
  Settings,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'

const nav = [
  { href: '/', label: 'Signals', icon: Activity },
  { href: '/launcher', label: 'Launcher', icon: Rocket },
  { href: '/optimizer', label: 'Optimizer', icon: SlidersHorizontal },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

type PhantomProvider = {
  isPhantom?: boolean
  publicKey?: { toString: () => string }
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  on?: (event: 'connect' | 'disconnect', handler: () => void) => void
  off?: (event: 'connect' | 'disconnect', handler: () => void) => void
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [wallet, setWallet] = useState<PhantomProvider | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBusy, setWalletBusy] = useState(false)

  useEffect(() => {
    const provider = (window as Window & { solana?: PhantomProvider }).solana
    if (!provider?.isPhantom) return

    const handleConnect = () => {
      setWalletAddress(provider.publicKey?.toString() ?? null)
    }
    const handleDisconnect = () => setWalletAddress(null)

    setWallet(provider)
    handleConnect()
    provider.on?.('connect', handleConnect)
    provider.on?.('disconnect', handleDisconnect)

    return () => {
      provider.off?.('connect', handleConnect)
      provider.off?.('disconnect', handleDisconnect)
    }
  }, [])

  async function handleWalletButton() {
    if (!wallet) {
      window.open('https://phantom.app/', '_blank', 'noopener,noreferrer')
      return
    }

    setWalletBusy(true)
    try {
      if (walletAddress) {
        await wallet.disconnect()
        setWalletAddress(null)
      } else {
        await wallet.connect()
        setWalletAddress(wallet.publicKey?.toString() ?? null)
      }
    } finally {
      setWalletBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#131313]/80 px-4 shadow-signal-glow backdrop-blur-xl md:pl-[17rem]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-primary-container md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="relative hidden md:block">
            <input
              type="search"
              placeholder="Search tokens or pairs..."
              className="focus:ring-primary-container/50 w-64 rounded-lg border-none bg-surface-container-highest py-2 pl-10 pr-4 text-sm text-on-surface placeholder:text-white/30 focus:ring-1"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://x.com/Bags_signals"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-primary-container"
            aria-label="Follow us on Twitter"
            title="Follow @Bags_signals on X"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <button
            type="button"
            className="relative rounded-lg p-2 text-white/60 transition-colors hover:bg-white/5 hover:text-primary-container"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
          </button>
          <button
            type="button"
            className="rounded-full bg-primary-container px-5 py-2 text-sm font-bold text-on-primary-container transition-all hover:brightness-110"
            onClick={handleWalletButton}
            disabled={walletBusy}
            title={wallet ? 'Connect your Phantom wallet' : 'Phantom not found. Click to install.'}
          >
            {walletBusy
              ? 'Connecting...'
              : walletAddress
                ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
                : wallet
                  ? 'Connect Wallet'
                  : 'Install Phantom'}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 bg-[#1c1b1b] py-8 shadow-2xl transition-transform duration-200',
          'md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="mb-10 mt-14 px-6">
          <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
              <Image 
                src="/logo-transparant.png" 
                alt="Bags Signal Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="font-headline text-xl font-bold text-[#00ffa3]">Bags Signal</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Solana Intelligence
              </div>
            </div>
          </Link>
        </div>
        <nav className="font-headline flex-1 space-y-1 text-sm font-medium">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center px-6 py-4 transition-colors',
                  active
                    ? 'border-r-2 border-[#00ffa3] bg-[#00ffa3]/10 text-[#00ffa3]'
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="mr-3 h-5 w-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        {/* Pro Plan section hidden for now */}
        {false && (
          <div className="mt-auto px-6">
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-surface-container p-4">
              <div className="relative z-10">
                <div className="mb-2 text-xs text-white/60">PRO PLAN</div>
                <div className="mb-4 text-sm font-bold text-white">Unlimited Alpha Access</div>
                <button
                  type="button"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2 text-xs text-white transition-colors hover:bg-white/10"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <main className="min-h-screen pt-16 md:ml-64">{children}</main>
    </div>
  )
}
