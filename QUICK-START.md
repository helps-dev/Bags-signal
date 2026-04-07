# ⚡ Quick Start - Deploy dalam 15 Menit

Panduan super cepat untuk deploy Bags Signal ke production.

---

## 📝 Checklist

- [ ] Akun Upstash (https://upstash.com)
- [ ] Akun Render (https://render.com)
- [ ] Akun Vercel (https://vercel.com)
- [ ] GitHub repository

---

## 🚀 Step 1: Upstash Redis (2 menit)

1. Login → https://console.upstash.com
2. **Create Database**
   - Name: `bags-signal-redis`
   - Region: US-EAST-1
   - TLS: Enabled
3. **Copy credentials** dari tab "REST API":
   ```
   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
   ```
4. **Paste ke `API-KEY.md`** ✅

---

## 🔧 Step 2: Render Backend (5 menit)

1. Login → https://dashboard.render.com
2. **New +** → **Web Service**
3. **Connect GitHub** → Select `bags-signal` repo
4. **Configure:**
   ```
   Name: bags-signal-backend
   Region: Oregon (US West)
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```
5. **Environment Variables** → Add:
   ```env
   NODE_ENV=production
   PORT=10000
   BAGS_API_KEY=bags_prod_bxHG-iyQ5vURf8LWSagP_c63OF6aKesG4HZT0ZIKe5g
   BAGS_API_BASE_URL=https://public-api-v2.bags.fm/api/v1
   UPSTASH_REDIS_REST_URL=<PASTE_DARI_STEP_1>
   UPSTASH_REDIS_REST_TOKEN=<PASTE_DARI_STEP_1>
   HELIUS_RPC_URL=https://mainnet.helius-rpc.com
   HELIUS_API_KEY=c52abbc9-2158-4ff1-8960-b8dcb7b02b1e
   BIRDEYE_API_KEY=d2ab9ba897f142a19cb31ab45485c32e
   AI_SERVICE_URL=http://localhost:8000
   ```
6. **Create Web Service** → Tunggu deploy (~5 menit)
7. **Copy URL** (contoh: `https://bags-signal-backend.onrender.com`) ✅

---

## 🎨 Step 3: Vercel Frontend (5 menit)

### Via CLI (Recommended):

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Update environment
cd frontend
echo "NEXT_PUBLIC_API_URL=https://bags-signal-backend.onrender.com" > .env.local
echo "NEXT_PUBLIC_WS_URL=wss://bags-signal-backend.onrender.com/ws" >> .env.local
echo "BACKEND_URL=https://bags-signal-backend.onrender.com" >> .env.local

# Deploy
vercel --prod
```

### Via Dashboard:

1. Login → https://vercel.com
2. **Add New** → **Project**
3. **Import** → Select `bags-signal` repo
4. **Configure:**
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```
5. **Environment Variables:**
   ```env
   NEXT_PUBLIC_API_URL=https://bags-signal-backend.onrender.com
   NEXT_PUBLIC_WS_URL=wss://bags-signal-backend.onrender.com/ws
   BACKEND_URL=https://bags-signal-backend.onrender.com
   ```
6. **Deploy** → Tunggu (~3 menit) ✅

---

## ✅ Step 4: Test (2 menit)

### Test Backend:
```bash
curl https://bags-signal-backend.onrender.com/health
# Expected: {"status":"ok","timestamp":"..."}

curl https://bags-signal-backend.onrender.com/api/signals/feed
# Expected: Array of tokens
```

### Test Frontend:
1. Buka: `https://your-app.vercel.app`
2. Cek:
   - ✅ Token feed muncul
   - ✅ AI scores muncul
   - ✅ Volume 24h muncul
   - ✅ Launch time format (e.g., "2h ago")

---

## 🎉 Done!

**Your app is live!**

- Frontend: `https://your-app.vercel.app`
- Backend: `https://bags-signal-backend.onrender.com`
- Redis: Upstash (256MB free)

**Total Cost: $0/month** 🎁

---

## ⚠️ Important Notes

1. **Cold Start:** Backend sleep setelah 15 menit idle
   - First request: ~30 detik
   - Setup keep-alive: Lihat `DEPLOYMENT.md`

2. **Rate Limits:**
   - Upstash: 10k commands/day
   - Birdeye: Rate limited (fallback ke DexScreener)

3. **Monitoring:**
   - Render: https://dashboard.render.com
   - Vercel: https://vercel.com/dashboard
   - Upstash: https://console.upstash.com

---

## 🔄 Update Deployment

```bash
# Update code
git add .
git commit -m "Update feature"
git push

# Auto-deploy:
# - Render: Auto-deploy on push
# - Vercel: Auto-deploy on push
```

---

## 📚 Next Steps

- [ ] Setup custom domain
- [ ] Setup keep-alive cron job
- [ ] Monitor usage & logs
- [ ] Upgrade to paid tier (optional)

**Need help?** Check `DEPLOYMENT.md` for detailed guide.
