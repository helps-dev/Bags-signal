import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from './components/ErrorBoundary'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bags Signal - AI Token Intelligence',
  description: 'Fee share intelligence, AI signals, and one-click launch for Bags.fm on Solana.',
  metadataBase: new URL('https://bags-signal.vercel.app'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo-transparant.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-transparant.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo-transparant.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#00ffa3',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-transparant.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bags Signal" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#00ffa3" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
