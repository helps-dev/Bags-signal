'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Activity,
  Bell,
  Menu,
  Rocket,
  Settings,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

const nav = [
  { href: '/', label: 'Signals', icon: Activity },
  { href: '/launcher', label: 'Launcher', icon: Rocket },
  { href: '/optimizer', label: 'Optimizer', icon: SlidersHorizontal },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/settings', label: 'Settings', icon: Settings },
] as const

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { connected, publicKey, disconnect, connecting } = useWallet()
  const { setVisible } = useWalletModal()

  function handleWalletButton() {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null

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
            <Bell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            className={clsx(
              'rounded-full px-5 py-2 text-sm font-bold transition-all hover:brightness-110',
              connected
                ? 'bg-primary-container/20 border border-primary-container/40 text-primary-container'
                : 'bg-primary-container text-on-primary-container'
            )}
            onClick={handleWalletButton}
            disabled={connecting}
          >
            {connecting
              ? 'Connecting...'
              : connected && shortAddress
                ? shortAddress
                : 'Connect Wallet'}
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

        {/* Social Media */}
        <div className="mt-auto border-t border-white/5 px-6 py-4">
          <a
            href="https://x.com/Bags_signals"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-lg p-3 text-white/60 transition-colors hover:bg-white/5 hover:text-primary-container"
            onClick={() => setMobileOpen(false)}
            aria-label="Follow @Bags_signals on X"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </aside>

      <main className="min-h-screen pt-16 md:ml-64">{children}</main>
    </div>
  )
}
