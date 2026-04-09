'use client'

import dynamic from 'next/dynamic'
import AppShell from '../components/AppShell'
import { SignalLoader } from '../components/SignalLoader'

// ssr: false prevents wallet access during server-side rendering
const LauncherContent = dynamic(
  () => import('../components/LauncherContent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <SignalLoader />
      </div>
    ),
  }
)

export default function TokenLauncherPage() {
  return (
    <AppShell>
      <LauncherContent />
    </AppShell>
  )
}
