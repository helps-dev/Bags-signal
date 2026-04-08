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
  metadataBase: new URL('http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo-transparant.png',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container`}
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  )
}
