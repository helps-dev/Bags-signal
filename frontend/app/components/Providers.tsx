'use client'

import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { clusterApiUrl } from '@solana/web3.js'

// Import Solana Wallet Adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

export function Providers({ children }: { children: ReactNode }) {
  // Solana RPC endpoint - using public endpoint for development
  // For production, consider using a dedicated RPC provider (Helius, QuickNode, etc.)
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')
  }, [])

  // Initialize wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
