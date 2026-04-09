# 🔑 API Keys & Credentials

## OpenRouter
```
API_KEY: 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
```

## Bags.fm API
```
API_KEY: bags_prod_bxHG-iyQ5vURf8LWSagP_c63OF6aKesG4HZT0ZIKe5g
BASE_URL: https://public-api-v2.bags.fm/api/v1
```

## Helius RPC (Solana)
```
RPC_URL: https://mainnet.helius-rpc.com
API_KEY: c52abbc9-2158-4ff1-8960-b8dcb7b02b1e
```

## Birdeye API (Volume Data)
```
API_KEY: d2ab9ba897f142a19cb31ab45485c32e
```

## Upstash Redis (PRODUCTION)
✅ **CONFIGURED**

```
UPSTASH_REDIS_REST_URL=https://moved-bluejay-94267.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAXA7AAIncDE5ODQyNzA2Mzc3ZDk0MTdjOTVmMmE2NzgyYmU2OGI4OXAxOTQyNjc
```

**Database:** moved-bluejay-94267
**Region:** US-EAST-1
**Status:** Active ✅

---

## 🚀 Deployment URLs

### Backend (Render)
```
URL: https://bags-signal-backend.onrender.com
Status: ⏳ Pending deployment
```

### Frontend (Vercel)
```
URL: https://your-app.vercel.app
Status: ⏳ Pending deployment
```

---

## 📝 Next Steps

1. ✅ Daftar Upstash & Render
2. ✅ Paste Upstash credentials
3. ⏳ Push code ke GitHub
4. ⏳ Deploy backend ke Render
5. ⏳ Deploy frontend ke Vercel
6. ⏳ Test deployment

**Follow guide:** `QUICK-START.md`

---

## 📋 Environment Variables untuk Render

Copy ini ke Render Dashboard → Environment Variables:

```env
NODE_ENV=production
PORT=10000
BAGS_API_KEY=bags_prod_bxHG-iyQ5vURf8LWSagP_c63OF6aKesG4HZT0ZIKe5g
BAGS_API_BASE_URL=https://public-api-v2.bags.fm/api/v1
UPSTASH_REDIS_REST_URL=https://moved-bluejay-94267.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAXA7AAIncDE5ODQyNzA2Mzc3ZDk0MTdjOTVmMmE2NzgyYmU2OGI4OXAxOTQyNjc
HELIUS_RPC_URL=https://mainnet.helius-rpc.com
HELIUS_API_KEY=c52abbc9-2158-4ff1-8960-b8dcb7b02b1e
BIRDEYE_API_KEY=d2ab9ba897f142a19cb31ab45485c32e
AI_SERVICE_URL=http://localhost:8000
```

## 📋 Environment Variables untuk Vercel

Copy ini ke Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://bags-signal-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://bags-signal-backend.onrender.com/ws
BACKEND_URL=https://bags-signal-backend.onrender.com
```
