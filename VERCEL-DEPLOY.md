# 🎨 Deploy Frontend ke Vercel

## ✅ Backend Status: LIVE!
**URL:** https://bags-signal.onrender.com

---

## 🚀 Deploy Frontend (2 Cara)

### Cara 1: Via Vercel CLI (Tercepat)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login
```bash
vercel login
```

#### 3. Deploy
```bash
cd bags-signal/frontend
vercel --prod
```

Follow prompts:
- Set up and deploy? **Y**
- Which scope? (pilih account Anda)
- Link to existing project? **N**
- What's your project's name? **bags-signal**
- In which directory is your code located? **./** (atau tekan Enter)
- Want to override settings? **N**

#### 4. Done!
Vercel akan memberikan URL production Anda.

---

### Cara 2: Via Vercel Dashboard

#### 1. Buka Vercel
Login ke: https://vercel.com/new

#### 2. Import Repository
- Klik **"Add New"** → **"Project"**
- Pilih **"Import Git Repository"**
- Cari: **helps-dev/Bags-signal**
- Klik **"Import"**

#### 3. Configure Project
```
Framework Preset: Next.js (auto-detected)
Root Directory: frontend
Build Command: npm run build (auto-detected)
Output Directory: .next (auto-detected)
Install Command: npm install (auto-detected)
```

#### 4. Environment Variables
Klik **"Environment Variables"** dan tambahkan 3 variables ini:

**Variable 1:**
```
Name: NEXT_PUBLIC_API_URL
Value: https://bags-signal.onrender.com
```

**Variable 2:**
```
Name: NEXT_PUBLIC_WS_URL
Value: wss://bags-signal.onrender.com/ws
```

**Variable 3:**
```
Name: BACKEND_URL
Value: https://bags-signal.onrender.com
```

#### 5. Deploy!
- Klik **"Deploy"**
- Tunggu ~3-5 menit
- Setelah selesai, Vercel akan memberikan URL production

---

## ✅ Test Deployment

### 1. Test Backend API
```bash
curl https://bags-signal.onrender.com/health
# Expected: {"status":"ok",...}

curl https://bags-signal.onrender.com/api/signals/feed
# Expected: Array of 100 tokens
```

### 2. Test Frontend
1. Buka URL Vercel Anda di browser
2. Cek apakah:
   - ✅ Token feed muncul (100 tokens)
   - ✅ AI scores muncul
   - ✅ Volume 24h muncul
   - ✅ Launch time format (e.g., "2h ago")
   - ✅ Real-time updates (WebSocket)

### 3. Test WebSocket
1. Buka browser console (F12)
2. Tab "Network" → filter "WS"
3. Harus ada koneksi WebSocket aktif
4. Setiap 30 detik harus ada update data

---

## 🎉 DONE!

**Your App is Live:**
- Backend: https://bags-signal.onrender.com
- Frontend: https://YOUR-APP.vercel.app
- GitHub: https://github.com/helps-dev/Bags-signal

**Total Cost: $0/month** 🎁

---

## 📊 Monitoring

### Backend (Render)
- Dashboard: https://dashboard.render.com
- Logs: Real-time logs
- Metrics: CPU, Memory, Requests

### Frontend (Vercel)
- Dashboard: https://vercel.com/dashboard
- Analytics: Page views, performance
- Logs: Function logs, build logs

### Redis (Upstash)
- Dashboard: https://console.upstash.com
- Usage: Commands/day, storage
- Latency: Response time

---

## 🔄 Auto-Deploy

Setiap kali push ke GitHub:
- ✅ Render auto-deploy backend
- ✅ Vercel auto-deploy frontend

```bash
git add .
git commit -m "Update feature"
git push
```

---

## ⚠️ Important Notes

### Cold Start (Render Free Tier)
- Backend sleep setelah 15 menit idle
- First request: ~30 detik
- **Solusi:** Setup keep-alive cron (optional)

### Keep-Alive (Optional)
1. Daftar: https://cron-job.org
2. Create job:
   - URL: https://bags-signal.onrender.com/health
   - Interval: Every 10 minutes

---

## 🆘 Troubleshooting

### Frontend tidak bisa connect ke backend
- Cek environment variables di Vercel
- Pastikan backend URL benar
- Test backend API dengan curl

### WebSocket tidak connect
- Pastikan menggunakan `wss://` (bukan `ws://`)
- Backend mungkin cold start, tunggu 30 detik

### Data tidak muncul
- Cek browser console untuk errors
- Test backend API endpoint
- Verify Upstash Redis connection

---

**Status:** ✅ BACKEND LIVE, READY TO DEPLOY FRONTEND

**Good luck! 🚀**
