'use client'

import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { Bell, Settings as SettingsIcon, Check } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function SettingsPage() {
  const { connected, publicKey } = useWallet()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    alertThreshold: 80,
    emailNotifications: false,
    rpcEndpoint: 'https://mainnet.helius-rpc.com',
    autoRefresh: true,
    refreshInterval: 30,
  })

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('bags-signal-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem('bags-signal-settings', JSON.stringify(settings))
      
      // If wallet connected, could also save to backend
      if (connected && publicKey) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey.toBase58(),
            settings
          })
        }).catch(err => console.warn('Failed to sync settings to backend:', err))
      }
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <h1 className="font-headline text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 max-w-lg text-on-surface-variant">
          Configure alert thresholds, RPC endpoints, and account preferences.
        </p>

        <div className="mt-8 space-y-6">
          {/* Alert Settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary-container" />
              <h2 className="font-headline text-xl font-bold text-white">Alert Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface-variant">
                  AI Score Alert Threshold
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={settings.alertThreshold}
                    onChange={(e) => setSettings({ ...settings, alertThreshold: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="font-headline text-lg font-bold text-primary-container">
                    {settings.alertThreshold}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Get notified when tokens score above this threshold
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Email Notifications</label>
                  <p className="text-xs text-white/60">Receive alerts via email (coming soon)</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="h-5 w-5 rounded border-white/20 bg-surface-container text-primary-container focus:ring-2 focus:ring-primary-container"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* RPC Settings */}
          <div className="glass-card rounded-xl p-6">
            <div className="mb-4 flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-secondary-container" />
              <h2 className="font-headline text-xl font-bold text-white">RPC Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface-variant">
                  Solana RPC Endpoint
                </label>
                <select
                  value={settings.rpcEndpoint}
                  onChange={(e) => setSettings({ ...settings, rpcEndpoint: e.target.value })}
                  className="w-full rounded-lg border-none bg-surface-container py-3 px-4 text-white focus:ring-2 focus:ring-primary-container"
                >
                  <option value="https://mainnet.helius-rpc.com">Helius (Recommended)</option>
                  <option value="https://api.mainnet-beta.solana.com">Solana Mainnet</option>
                  <option value="https://solana-api.projectserum.com">Project Serum</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-white">Auto Refresh</label>
                  <p className="text-xs text-white/60">Automatically refresh data</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings({ ...settings, autoRefresh: e.target.checked })}
                  className="h-5 w-5 rounded border-white/20 bg-surface-container text-primary-container focus:ring-2 focus:ring-primary-container"
                />
              </div>

              {settings.autoRefresh && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-on-surface-variant">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })}
                    className="w-full rounded-lg border-none bg-surface-container py-3 px-4 text-white focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Wallet Info */}
          {connected && publicKey && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="mb-4 font-headline text-xl font-bold text-white">Connected Wallet</h2>
              <div className="rounded-lg bg-surface-container p-4">
                <p className="text-xs text-white/60">Wallet Address</p>
                <p className="mt-1 font-mono text-sm text-white">{publicKey.toBase58()}</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-bold text-on-primary-container transition-colors hover:brightness-110 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary-container border-t-transparent" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
