import AppShell from '../components/AppShell'

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="px-4 py-10 md:px-8">
        <h1 className="font-headline text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 max-w-lg text-on-surface-variant">
          Alert thresholds, RPC endpoints, and account preferences will live here. Connect a wallet to sync
          preferences with Bags Signal.
        </p>
      </div>
    </AppShell>
  )
}
