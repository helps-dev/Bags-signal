# 🚀 Deployment Guide - Bags Signal

Panduan lengkap untuk deploy Bags Signal ke production menggunakan **Vercel + Render + Upstash** (100% GRATIS).

---

## 📋 Prerequisites

1. ✅ Akun GitHub (untuk auto-deploy)
2. ✅ Akun Vercel (https://vercel.com) - GRATIS
3. ✅ Akun Render (https://render.com) - GRATIS
4. ✅ Akun Upstash (https://upstash.com) - GRATIS

---

## 🗄️ Step 1: Setup Upstash Redis

1. Login ke https://console.upstash.com
2. Klik **"Create Database"**
3. Pilih:
   - **Name:** bags-signal-redis
   - **Type:** Regional
   - **Region:** Pilih yang terdekat (e.g., AWS US-EAST-1)
   - **TLS:** Enabled
4. Klik **"Create"**
5. Copy credentials:
   - `UPSTASH_REDIS_REST_URL` (contoh: https://xxx.upstash.io)
   - `UPSTASH_REDIS_REST_TOKEN` (contoh: AXXXxxx...)

**Simpan credentials ini!** Anda akan membutuhkannya nanti.

---

## 🔧 Step 2: Setup Backend di Render

### 2.1 Push Code ke GitHub

```bash
# Jika belum init git
cd bags-signal
git init
git add .
git commit -m "Initial commit"

# Create repo di GitHub, lalu:
git remote add origin https://github.com/YOUR_USERNAME/bags-signal.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy ke Render

1. Login ke https://dashboard.render.com
2. Klik **"New +"** → **"Web Service"**
3. Connect GitHub repository: **bags-signal**
4. Configure:
   - **Name:** `bags-signal-backend`
   - **Region:** Oregon (US West) - gratis
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. **Environment Variables** - Klik "Advanced" dan tambahkan:

```env
NODE_ENV=production
PORT=10000
BAGS_API_KEY=bags_prod_bxHG-iyQ5vURf8LWSagP_c63OF6aKesG4HZT0ZIKe5g
BAGS_API_BASE_URL=https://public-api-v2.bags.fm/api/v1
UPSTASH_REDIS_REST_URL=<PASTE_DARI_UPSTASH>
UPSTASH_REDIS_REST_TOKEN=<PASTE_DARI_UPSTASH>
HELIUS_RPC_URL=https://mainnet.helius-rpc.com
HELIUS_API_KEY=c52abbc9-2158-4ff1-8960-b8dcb7b02b1e
BIRDEYE_API_KEY=d2ab9ba897f142a19cb31ab45485c32e
AI_SERVICE_URL=http://localhost:8000
```

6. Klik **"Create Web Service"**
7. Tunggu ~5-10 menit untuk build & deploy
8. Copy URL backend Anda (contoh: `https://bags-signal-backend.onrender.com`)

---

## 🎨 Step 3: Setup Frontend di Vercel

### 3.1 Update Environment Variables

Edit file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://bags-signal-backend.onrender.com
NEXT_PUBLIC_WS_URL=wss://bags-signal-backend.onrender.com/ws
BACKEND_URL=https://bags-signal-backend.onrender.com
```

Commit perubahan:
```bash
git add frontend/.env.local
git commit -m "Update backend URL for production"
git push
```

### 3.2 Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

Atau deploy via Vercel Dashboard:
1. Login ke https://vercel.com
2. Klik **"Add New"** → **"Project"**
3. Import repository: **bags-signal**
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://bags-signal-backend.onrender.com
   NEXT_PUBLIC_WS_URL=wss://bags-signal-backend.onrender.com/ws
   BACKEND_URL=https://bags-signal-backend.onrender.com
   ```
6. Klik **"Deploy"**

---

## ✅ Step 4: Verifikasi Deployment

### 4.1 Test Backend

```bash
# Health check
curl https://bags-signal-backend.onrender.com/health

# Test API
curl https://bags-signal-backend.onrender.com/api/signals/feed
```

### 4.2 Test Frontend

Buka browser: `https://your-app.vercel.app`

Cek:
- ✅ Token feed muncul
- ✅ AI scores muncul
- ✅ Volume 24h muncul
- ✅ Launch time akurat
- ✅ Real-time updates (WebSocket)

---

## ⚠️ Catatan Penting

### Render Free Tier Limitations:

1. **Cold Start:** Service sleep setelah 15 menit tidak ada request
   - First request setelah sleep: ~30 detik
   - Solusi: Gunakan cron job untuk keep-alive (lihat Step 5)

2. **750 Hours/Month:** Cukup untuk 1 service 24/7
   - Jika over limit, service akan stop
   - Monitor usage di Render dashboard

3. **WebSocket:** Supported, tapi koneksi akan drop saat cold start

### Upstash Free Tier Limitations:

1. **10,000 Commands/Day:** ~7 commands/menit
   - Cukup untuk demo/testing
   - Monitor usage di Upstash dashboard

2. **256MB Storage:** Cukup untuk cache

---

## 🔄 Step 5: Keep-Alive (Opsional)

Untuk menghindari cold start, setup cron job untuk ping backend setiap 10 menit.

### Opsi 1: Cron-job.org (Gratis)

1. Daftar di https://cron-job.org
2. Create job:
   - **URL:** `https://bags-signal-backend.onrender.com/health`
   - **Interval:** Every 10 minutes
   - **Method:** GET

### Opsi 2: GitHub Actions

Buat file `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive

on:
  schedule:
    - cron: '*/10 * * * *' # Every 10 minutes

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping backend
        run: curl https://bags-signal-backend.onrender.com/health
```

---

## 🔧 Troubleshooting

### Backend tidak bisa connect ke Redis

**Error:** `Redis connection failed`

**Solusi:**
1. Cek environment variables di Render
2. Pastikan `UPSTASH_REDIS_REST_URL` dan `UPSTASH_REDIS_REST_TOKEN` benar
3. Test Redis di Upstash console

### Frontend tidak bisa connect ke Backend

**Error:** `Failed to fetch` atau `CORS error`

**Solusi:**
1. Cek `NEXT_PUBLIC_API_URL` di Vercel environment variables
2. Pastikan backend URL benar (https, bukan http)
3. Cek CORS settings di backend

### WebSocket tidak connect

**Error:** `WebSocket connection failed`

**Solusi:**
1. Pastikan menggunakan `wss://` (bukan `ws://`)
2. Cek `NEXT_PUBLIC_WS_URL` di Vercel
3. Backend mungkin sedang cold start, tunggu 30 detik

### Volume data tidak muncul

**Error:** `Volume: —` atau `undefined`

**Solusi:**
1. Birdeye API rate limit - tunggu beberapa menit
2. Cek Birdeye API key di environment variables
3. Monitor logs di Render dashboard

---

## 📊 Monitoring

### Render Dashboard
- **Logs:** https://dashboard.render.com → Service → Logs
- **Metrics:** CPU, Memory, Request count
- **Events:** Deploy history, errors

### Vercel Dashboard
- **Analytics:** https://vercel.com/dashboard/analytics
- **Logs:** Function logs, build logs
- **Performance:** Core Web Vitals

### Upstash Dashboard
- **Usage:** Commands/day, storage
- **Latency:** Response time
- **Logs:** Recent commands

---

## 🚀 Next Steps

### Upgrade untuk Production:

1. **Render Paid** ($7/month)
   - No cold start
   - Better performance
   - More hours

2. **Upstash Pro** ($10/month)
   - Unlimited commands
   - Better latency
   - More storage

3. **Custom Domain**
   - Vercel: Add custom domain (gratis)
   - Render: Add custom domain (gratis)

**Total Production Cost:** $17/month

---

## 📞 Support

Jika ada masalah:
1. Cek logs di Render/Vercel dashboard
2. Test API endpoints dengan curl
3. Verify environment variables
4. Check Upstash Redis connection

---

**Deployment Status:**
- ✅ Backend: Render (Free)
- ✅ Frontend: Vercel (Free)
- ✅ Redis: Upstash (Free)
- ✅ Total Cost: $0/month

**Selamat! Bags Signal sudah live! 🎉**
