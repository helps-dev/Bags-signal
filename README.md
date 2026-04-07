# Bags Signal

AI Token Intelligence Platform built for Bags.fm Hackathon - $4M Fund

## Overview

Bags Signal adalah platform intelijen token berbasis AI yang dibangun di atas ekosistem Bags.fm dan jaringan Solana. Platform ini menyediakan:

- **Fee Share Intelligence**: Kalkulator dan optimizer real-time untuk memaksimalkan pendapatan fee sharing
- **AI Signal Engine**: Sistem scoring berbasis machine learning untuk menilai potensi token launches
- **One-Click Token Launcher**: Interface terintegrasi untuk launch token, konfigurasi fee share, dan listing Dexscreener
- **Real-Time Updates**: Integrasi WebSocket untuk update signal secara instan tanpa refresh
- **Production-Ready Backend**: Redis caching, Zod validation, dan background polling untuk performa maksimal

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js 20, Express 5, TypeScript, Redis, Zod |
| AI Engine | Python 3.11, FastAPI, scikit-learn |
| Blockchain | Anchor 0.30, Solana web3.js 2.x |
| Database | PostgreSQL 16, Redis 7 |

## Project Structure

```
bags-signal/
├── frontend/                  # Next.js 14 App Router
│   ├── app/                   # App Router pages
│   │   ├── page.tsx          # Signal Feed (Home)
│   │   ├── launcher/         # Token launch wizard
│   │   ├── optimizer/        # Fee share optimizer
│   │   ├── portfolio/        # Portfolio tracker
│   │   └── components/       # React components
│   │       ├── Header.tsx
│   │       ├── SignalFeed.tsx
│   │       ├── TokenCard.tsx
│   │       └── ScoreBadge.tsx
│   ├── lib/                  # Utilities
│   │   ├── hooks/            # Custom hooks (e.g., useWebSocket)
│   │   └── bags/             # Bags API client
│   └── package.json
├── backend/                   # Node.js + Express
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   │   ├── bags.service.ts
│   │   │   ├── redis.service.ts
│   │   │   └── worker.service.ts # Background polling & WS broadcast
│   │   ├── utils/            # Utilities (config, logger)
│   │   └── websocket/        # Real-time layer
│   │       └── websocket.manager.ts
│   └── python/               # Python AI Service
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Rust & Anchor CLI (for smart contracts)
- Redis (Recommended for caching)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd bags-signal
```

2. **Install dependencies**

Root (monorepo):
```bash
npm install
```

3. **Setup environment variables**

Backend (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
BAGS_API_KEY=your_bags_api_key
REDIS_URL=redis://localhost:6379
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

4. **Run development servers**

Root:
```bash
npm run dev
```

### Verification

Backend API Test:
```bash
cd backend
npm run test:api
```

## Features

### Signal Feed (Home)
- Real-time token launch feed via WebSocket
- AI scoring (0-100) dengan color-coded badges
- Filter by status (Pre-Launch/Live) dan score
- Auto-refresh fallback polling
- Caching layer dengan Redis untuk performa tinggi

### Token Launcher
- 4-step wizard untuk token launch
- Integrated fee share configuration
- Auto-listing ke Dexscreener
- Estimasi gas cost

### Fee Optimizer
- Revenue projection calculator
- Simulasi konfigurasi fee share
- Daily/Weekly/Monthly estimasi

### Portfolio
- Lifetime fees tracking
- Claimable positions
- One-click claim all

## API Endpoints

### Signals
- `GET /api/signals/feed` - Get token feed dengan scores
- `GET /api/signals/score/:tokenMint` - Get AI score untuk token
- `GET /api/signals/alerts` - User alert configuration

### Tokens
- `GET /api/tokens/launch-feed` - Token launch feed
- `GET /api/tokens/:tokenMint/details` - Token details
- `POST /api/tokens/launch` - Launch new token

### Fees
- `GET /api/fees/wallet/:walletAddress` - Fee share config
- `POST /api/fees/config` - Configure fee share
- `GET /api/fees/claim-stats/:tokenMint` - Claim statistics
- `POST /api/fees/claim` - Claim fees

### Partners
- `GET /api/partners/stats` - Partner statistics
- `POST /api/partners/config` - Register partner

## AI Scoring Algorithm

Bags Signal menggunakan multi-factor heuristic scoring:

| Faktor | Bobot | Deskripsi |
|--------|-------|-----------|
| Liquidity Depth | 25 pts | Total SOL dalam pool (>50 SOL = full) |
| Fee Share Config | 20 pts | Konfigurasi fee share yang benar |
| Creator History | 20 pts | Track record creator |
| Volume Velocity | 15 pts | Rate kenaikan volume 1h pertama |
| Social Presence | 10 pts | Website dan Twitter terisi |
| Price Stability | 10 pts | Volatilitas harga rendah = lebih baik |

Score ranges:
- **80-100** (Green): High quality token
- **50-79** (Yellow): Medium quality, proceed with caution
- **0-49** (Red): High risk token

## Smart Contracts

### ClaimRouter
- Auto fee claiming dengan minimum threshold
- Atomic distribution ke multiple recipients
- PDA-based state management

### PartnerRegistry
- On-chain partner tracking
- Referral recording
- Transparent revenue tracking

## Development Timeline

| Sprint | Deliverables | Duration |
|--------|--------------|----------|
| Sprint 1 | Foundation, Signal Feed, AI Engine | 7 days |
| Sprint 2 | Fee Optimizer, Portfolio, Alerts | 7 days |
| Sprint 3 | Token Launcher, Dexscreener, Partners | 7 days |
| Sprint 4 | Anchor Programs, Polish, Demo | 7 days |

## Dependencies

### External APIs
- **Bags.fm API** - Core data & transactions
- **Helius RPC** - Solana on-chain data
- **Birdeye API** - Price & volume data
- **Meteora** - Liquidity pool data
- **Privy** - Wallet authentication

### Services
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **PostgreSQL** - Database
- **Redis** - Cache & rate limiting

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details

## Contact

Bags Signal Team - Bags.fm Hackathon 2026

---

**Note**: This is a hackathon project. Smart contracts are not audited and should not be used in production without proper review.
