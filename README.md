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
