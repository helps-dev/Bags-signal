'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import AppShell from '../components/AppShell'
import { SignalLoader } from '../components/SignalLoader'

// Dynamic import to prevent SSR issues with wallet
const LauncherContent = dynamic(() => import('../components/LauncherContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <SignalLoader />
    </div>
  ),
})

export default function TokenLauncherPage() {
  return (
    <AppShell>
      <Suspense fallback={<SignalLoader />}>
        <LauncherContent />
      </Suspense>
    </AppShell>
  )
}
