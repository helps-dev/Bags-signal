'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronRight, Rocket, X } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { SignalLoader } from './SignalLoader'

const STEPS = ['Token Info', 'Fee Config', 'Launch Settings', 'Review'] as const

export default function LauncherContent() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadError, setUploadError] = useState<string>('')
  const [mounted, setMounted] = useState(false)
  const wallet = useWallet()
  
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

  // Ensure component is mounted before accessing wallet
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug wallet connection
  useEffect(() => {
    if (mounted) {
      console.log('Wallet status:', {
        connected: wallet.connected,
        connecting: wallet.connecting,
        publicKey: wallet.publicKey?.toBase58(),
        wallet: wallet.wallet?.adapter?.name
      })
    }
  }, [mounted, wallet.connected, wallet.connecting, wallet.publicKey, wallet.wallet])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, GIF)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB')
      return
    }

    setUploadError('')
    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setUploadError('')
  }

  const handleNext = () => {
    // Validate step 1
    if (step === 1) {
      if (!formData.name || !formData.symbol) {
        alert('⚠️ Please fill in token name and symbol');
        return;
      }
      if (!imageFile) {
        alert('⚠️ Please upload a token image');
        return;
      }
    }
    
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleLaunch = async () => {
    if (!mounted) {
      alert('⚠️ Please wait for the page to fully load');
      return;
    }

    // Better wallet detection
    console.log('Launch attempt - Wallet state:', {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toBase58(),
      wallet: wallet.wallet?.adapter?.name
    });

    if (!wallet.publicKey) {
      alert('⚠️ Please connect your wallet first!\n\nClick the "Connect Wallet" button in the top right corner.');
      return;
    }

    if (!wallet.connected) {
      alert('⚠️ Wallet is not fully connected. Please try reconnecting your wallet.');
      return;
    }

    // Validate form data
    if (!formData.name || !formData.symbol) {
      alert('⚠️ Please fill in token name and symbol');
      return;
    }

    if (!imageFile) {
      alert('⚠️ Please upload a token image');
      return;
    }

    setIsLoading(true);
    try {
      // Convert image to base64
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      console.log('Sending launch request...');

      // Call backend API to launch token
      const res = await fetch('/api/tokens/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imageBase64,
          creatorWallet: wallet.publicKey.toBase58(),
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Launch failed');
      }
      
      const result = await res.json();
      console.log('Launch result:', result);
      
      // Show success message with transaction signature
      if (result.signature) {
        alert(`✅ Token launched successfully!\n\n🔗 Transaction: ${result.signature}\n\n👉 View on Solscan:\nhttps://solscan.io/tx/${result.signature}`);
      } else if (result.transaction) {
        alert('✅ Token launch transaction created!\n\n⚠️ Please sign the transaction in your wallet to complete the launch.');
      } else {
        alert('✅ Token launch initiated! Check your wallet for transaction confirmation.');
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
      removeImage();
      setStep(1);
      
    } catch (e: any) {
      console.error('Launch error:', e);
      alert(`❌ Error launching token:\n\n${e.message}\n\nPlease check console for details.`);
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SignalLoader />
      </div>
    )
  }

  const isWalletConnected = wallet.connected && wallet.publicKey

  return (
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

            {/* Image Upload Section */}
            <div className="mb-6">
              <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60 mb-3 block">
                Token Image <span className="text-error-container">*</span>
              </label>
              
              {!imagePreview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="token-image-upload"
                  />
                  <label
                    htmlFor="token-image-upload"
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-outline-variant/30 rounded-lg cursor-pointer bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    <Rocket className="h-12 w-12 text-primary-container mb-3" />
                    <p className="text-sm text-white/80 font-medium">Click to upload token image</p>
                    <p className="text-xs text-white/40 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-container">
                  <img
                    src={imagePreview}
                    alt="Token preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-error-container/90 hover:bg-error-container rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-on-error-container" />
                  </button>
                  <div className="absolute bottom-2 left-2 right-2 bg-surface-container-highest/90 backdrop-blur-sm rounded px-3 py-2">
                    <p className="text-xs text-white/80 truncate">{imageFile?.name}</p>
                    <p className="text-xs text-white/40">{(imageFile!.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="mt-2 flex items-center gap-2 text-error-container text-sm">
                  <X className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                  Token name <span className="text-error-container">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                  placeholder="e.g. Bags Artificial Intelligence"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                  Symbol <span className="text-error-container">*</span>
                </label>
                <input
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container uppercase"
                  placeholder="e.g. BAGS"
                  maxLength={10}
                  required
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
                  className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container resize-none"
                  placeholder="Tell the community what this token is for..."
                  maxLength={500}
                />
                <p className="text-xs text-white/40 mt-1 text-right">{formData.description.length}/500</p>
              </div>
              <div>
                <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60">
                  Twitter / X
                </label>
                <input
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="mt-2 w-full rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                  placeholder="@handle or https://x.com/handle"
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
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-6 flex items-center gap-3">
              <Rocket className="h-6 w-6 text-secondary-container" />
              <h2 className="font-headline text-xl font-bold text-white">Fee configuration</h2>
            </div>
            
            <div className="rounded-lg border border-tertiary-fixed-dim/25 bg-tertiary-fixed-dim/10 p-4 mb-6">
              <p className="text-sm text-tertiary-fixed-dim">
                Configure how trading fees are distributed. You can set a fee percentage and specify recipient wallets.
              </p>
            </div>

            <div>
              <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60 mb-2 block">
                Fee percentage (0.5% - 5%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={formData.feePercentage}
                  onChange={(e) =>
                    setFormData({ ...formData, feePercentage: Number(e.target.value) })
                  }
                  className="flex-1 h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-primary-container">{formData.feePercentage}%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60 mb-3 block">
                Fee Recipients
              </label>
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="mt-3 flex gap-3">
                  <input
                    value={recipient.wallet}
                    onChange={(e) => {
                      const next = [...formData.recipients]
                      next[index] = { ...next[index], wallet: e.target.value }
                      setFormData({ ...formData, recipients: next })
                    }}
                    className="flex-1 rounded-lg border-none bg-surface-container py-3.5 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                    placeholder="Solana wallet address"
                  />
                  <div className="flex items-center gap-2 bg-surface-container rounded-lg px-4">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={recipient.percentage}
                      onChange={(e) => {
                        const next = [...formData.recipients]
                        next[index] = {
                          ...next[index],
                          percentage: Number(e.target.value),
                        }
                        setFormData({ ...formData, recipients: next })
                      }}
                      className="w-16 bg-transparent text-white text-center focus:outline-none"
                    />
                    <span className="text-white/60">%</span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    recipients: [...formData.recipients, { wallet: '', percentage: 0 }]
                  })
                }}
                className="mt-3 text-sm text-primary-container hover:text-primary-container/80 transition-colors"
              >
                + Add recipient
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="mb-6 flex items-center gap-3">
              <Rocket className="h-6 w-6 text-secondary-container" />
              <h2 className="font-headline text-xl font-bold text-white">Launch settings</h2>
            </div>

            <div className="rounded-lg border border-tertiary-fixed-dim/25 bg-tertiary-fixed-dim/10 p-4 mb-6">
              <p className="text-sm text-tertiary-fixed-dim">
                Optional: Configure initial buy amount and slippage tolerance for your token launch.
              </p>
            </div>

            <div>
              <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60 mb-2 block">
                Initial buy amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={formData.initialBuy}
                  onChange={(e) => setFormData({ ...formData, initialBuy: Number(e.target.value) })}
                  className="w-full rounded-lg border-none bg-surface-container py-3.5 px-4 pr-16 text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary-container"
                  placeholder="0.0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 font-medium">SOL</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Amount of SOL to buy immediately after launch (optional)</p>
            </div>

            <div>
              <label className="text-xs font-headline font-bold uppercase tracking-widest text-white/60 mb-2 block">
                Slippage tolerance
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={1}
                  value={formData.slippage}
                  onChange={(e) => setFormData({ ...formData, slippage: Number(e.target.value) })}
                  className="flex-1 h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-primary-container">{formData.slippage}%</span>
                </div>
              </div>
              <p className="text-xs text-white/40 mt-2">Maximum price movement tolerance for transactions</p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="mb-6 flex items-center gap-3">
              <Check className="h-6 w-6 text-secondary-container" />
              <h2 className="font-headline text-xl font-bold text-white">Review & Launch</h2>
            </div>

            {/* Token Preview Card */}
            <div className="rounded-lg bg-surface-container-high/50 p-6 space-y-4">
              <div className="flex items-start gap-4">
                {imagePreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    <img src={imagePreview} alt="Token" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{formData.name || 'Token Name'}</h3>
                  <p className="text-primary-container font-bold">${formData.symbol || 'SYMBOL'}</p>
                  {formData.description && (
                    <p className="text-sm text-white/60 mt-2 line-clamp-2">{formData.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Fee Percentage</p>
                  <p className="text-white font-bold">{formData.feePercentage}%</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Recipients</p>
                  <p className="text-white font-bold">{formData.recipients.length}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Initial Buy</p>
                  <p className="text-white font-bold">{formData.initialBuy} SOL</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Slippage</p>
                  <p className="text-white font-bold">{formData.slippage}%</p>
                </div>
              </div>

              {(formData.twitter || formData.website) && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Social Links</p>
                  <div className="flex gap-3">
                    {formData.twitter && (
                      <span className="text-sm text-primary-container">🐦 Twitter</span>
                    )}
                    {formData.website && (
                      <span className="text-sm text-primary-container">🌐 Website</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-tertiary-fixed-dim/25 bg-tertiary-fixed-dim/10 p-4">
              <div className="flex items-start gap-3">
                <Rocket className="h-5 w-5 text-tertiary-fixed-dim flex-shrink-0 mt-0.5" />
                <div className="text-sm text-tertiary-fixed-dim space-y-2">
                  <p className="font-bold">Important Information:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Estimated network fee: ~0.02-0.05 SOL</li>
                    <li>Transaction will be sent to Bags.fm API</li>
                    <li>You will need to sign the transaction in your wallet</li>
                    <li>Token will be created on Solana blockchain</li>
                  </ul>
                </div>
              </div>
            </div>
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
              disabled={isLoading || !isWalletConnected}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-bold text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <SignalLoader size="sm" />
                  <span>Launching...</span>
                </>
              ) : !isWalletConnected ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Connect Wallet First</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  <span>Launch Token</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
