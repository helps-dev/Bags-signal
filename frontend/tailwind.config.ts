import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#131313',
        surface: '#131313',
        'on-background': '#e5e2e1',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#b9cbbd',
        'primary-container': '#00ffa3',
        'on-primary-container': '#007146',
        'secondary-container': '#00e0ff',
        'on-secondary-container': '#005f6d',
        'tertiary-fixed-dim': '#ffba20',
        'surface-container': '#201f1f',
        'surface-container-low': '#1c1b1b',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'surface-variant': '#353534',
        'outline-variant': '#3a4a3f',
        error: '#ffb4ab',
        'signal-high': '#00ffa3',
        'signal-mid': '#ffba20',
        'signal-low': '#ffb4ab',
      },
      fontFamily: {
        headline: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      boxShadow: {
        'signal-glow': '0 8px 32px 0 rgba(0,255,163,0.05)',
        'neon-card': '0 0 20px rgba(0, 255, 163, 0.15)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
