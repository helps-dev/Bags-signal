<<<<<<< HEAD
# 🎯 Bags Signal - AI Token Intelligence Platform

> Fee share intelligence, AI signals, and one-click token launch for Bags.fm on Solana

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/bags-signal)

## 🚀 Features

### 🎨 Token Launcher
- **One-Click Launch**: Launch tokens on Bags.fm with professional UI
- **Fee Share Config**: Configure multiple fee recipients with percentage allocation
- **Wallet Integration**: Phantom, Solflare, Backpack support
- **Real-time Status**: Backend health check before launch
- **Bags.fm SDK**: Full integration with official SDK

### 📊 Signal Feed
- **AI-Powered Scoring**: Real-time token scoring with AI analysis
- **Live Updates**: WebSocket for real-time signal updates
- **Advanced Filtering**: Filter by score, volume, age
- **Token Analytics**: Volume, holders, liquidity data

### 💰 Portfolio Management
- **Fee Tracking**: Monitor accumulated fees from launched tokens
- **Claim Interface**: One-click fee claiming
- **Position Overview**: View all your token positions
- **Analytics Dashboard**: Track performance metrics

### ⚙️ Optimizer (Coming Soon)
- **Fee Optimization**: Maximize fee earnings
- **Strategy Recommendations**: AI-powered suggestions
- **Performance Analytics**: Track optimization results

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Styling**: TailwindCSS
- **Wallet**: @solana/wallet-adapter-react
- **SDK**: @bagsfm/bags-sdk
- **Blockchain**: @solana/web3.js
- **State**: Zustand
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **WebSocket**: ws
- **Cache**: Redis (Upstash)
- **API**: Bags.fm API, Helius RPC, Birdeye API

### AI Service
- **Runtime**: Python + FastAPI
- **ML**: Scikit-learn, NumPy, Pandas
- **Scoring**: Custom heuristic + ML model

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+ (for AI service)
- Redis (optional, uses Upstash by default)

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/bags-signal.git
cd bags-signal
```

### 2. Install Dependencies

```bash
# Frontend
cd bags-signal/frontend
npm install

# Backend
cd ../backend
npm install

# AI Service (optional)
cd ../backend/python/scorer
pip install -r requirements.txt
```

### 3. Configure Environment

#### Frontend `.env`
```env
NEXT_PUBLIC_BAGS_API_KEY=your_bags_api_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com?api-key=YOUR_KEY
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
```

#### Backend `.env`
```env
BAGS_API_KEY=your_bags_api_key
BAGS_API_BASE_URL=https://public-api-v2.bags.fm/api/v1
HELIUS_API_KEY=your_helius_key
BIRDEYE_API_KEY=your_birdeye_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
PORT=3001
```

### 4. Run Development

```bash
# Terminal 1: Backend
cd bags-signal/backend
npm run dev

# Terminal 2: Frontend
cd bags-signal/frontend
npm run dev

# Terminal 3: AI Service (optional)
cd bags-signal/backend/python/scorer
uvicorn main:app --reload --port 8000
```

Open http://localhost:3000

## 🚀 Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_BAGS_API_KEY`
   - `NEXT_PUBLIC_SOLANA_RPC_URL`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
4. Deploy

### Render (Backend)

1. Connect GitHub repo
2. Add environment variables
3. Deploy

See [VERCEL-DEPLOY.md](./VERCEL-DEPLOY.md) for detailed instructions.

## 📚 Documentation

- [Token Launcher Guide](./LAUNCHER-READY.md)
- [Bags SDK Implementation](./BAGS-SDK-IMPLEMENTATION.md)
- [Vercel Deployment](./VERCEL-DEPLOY.md)
- [API Documentation](./bags-signal/backend/README.md)

## 🎯 Usage

### Launch a Token

1. Navigate to `/launcher`
2. Connect your wallet
3. Upload token image
4. Fill token details
5. Configure fee recipients
6. Review and launch
7. Sign transactions in wallet

### Monitor Signals

1. Navigate to `/` (home)
2. View real-time token signals
3. Filter by score, volume, age
4. Click token for details

### Manage Portfolio

1. Navigate to `/portfolio`
2. View your launched tokens
3. Track accumulated fees
4. Claim fees when ready

## 🔑 API Keys

Get your API keys from:
- **Bags.fm**: https://dev.bags.fm
- **Helius**: https://helius.dev
- **Birdeye**: https://birdeye.so
- **Upstash Redis**: https://upstash.com

## 🐛 Troubleshooting

### "Wallet not connected"
- Install Phantom/Solflare wallet extension
- Click "Connect Wallet" button
- Approve connection

### "Backend offline"
- Wait 30 seconds for cold start (Render)
- Check backend logs
- Verify environment variables

### "Transaction failed"
- Ensure wallet has enough SOL (≥0.1)
- Check Solana network status
- Verify RPC endpoint

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Acknowledgments

- [Bags.fm](https://bags.fm) - Token launchpad platform
- [Solana](https://solana.com) - Blockchain infrastructure
- [Helius](https://helius.dev) - RPC provider
- [Birdeye](https://birdeye.so) - Token analytics

## 📞 Support

- **Documentation**: [docs.bags.fm](https://docs.bags.fm)
- **Discord**: [Join our community](#)
- **Twitter**: [@bags_fm](#)

---

**Built with ❤️ for the Solana ecosystem**

**Status**: ✅ Production Ready  
**Version**: 2.0.0  
**Last Updated**: 2026-04-09
=======
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
>>>>>>> 1dfc148bff2af9845e2f2218bb02bc2265a1db69
