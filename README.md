# Bhinneka Tunggal Ika — AR Educational Adventure

Web-based educational game teaching Indonesian cultural diversity to elementary students.

## Stack

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS v4
- Backend: FastAPI (Python) + Motor (MongoDB async)
- Database: MongoDB (Emergent-managed Atlas in production)

## Structure

```
frontend/   React app
backend/    FastAPI app
```

## Run locally

Frontend:
```
cd frontend
npm install
npm run dev
```

Backend:
```
cd backend
python -m pip install -r requirements.txt
copy .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

## Deployment (frontend di Vercel, backend di Render)

### 1. Backend di Render (blueprint `render.yaml`)

Klik tombol deploy berikut, lalu setujui akses GitHub:

```
https://render.com/deploy?repo=https://github.com/zidan-herlangga/ar-bhinneka
```

Blueprint akan membuat web service gratis:

- Root: `backend` · Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `/api/health`
- Env: `PYTHON_VERSION=3.12.7`, `DB_NAME`, `CORS_ORIGINS=*`

Setelah selesai, catat URL backend, mis. `https://bhinneka-tunggal-ika-api.onrender.com`.
Cek `https://<url-backend>/api/health` → harus mengembalikan `{"status":"ok",...}`.

Catatan:

- Instance gratis "tidur" setelah ~15 menit tanpa trafik; request pertama bisa
  lambat 30–60 detik. Frontend sudah punya fallback lokal saat itu terjadi.
- Tanpa `MONGO_URL`, API tetap jalan dan progres disimpan di browser.
  Untuk menyimpan progres di server, isi `MONGO_URL` (MongoDB Atlas) di
  dashboard Render, lalu restart service.

### 2. Frontend di Vercel

```bash
cd frontend
npx vercel            # login sekali lewat browser
npx vercel --prod
```

Saat pertama kali, pilih: framework **Vite**, build `npm run build`, output `dist`.

Atau lewat dashboard Vercel: import repo, **Root Directory = `frontend`**,
framework Vite, lalu set env `VITE_API_BASE_URL=https://url-backend-anda`
dan **redeploy** (env Vite dibekukan saat build).

### 3. Kalau backend belum siap

Aplikasi tetap jalan memakai paket data lokal (`frontend/src/data/cultures.json`)
dan menampilkan banner "Mode offline".

### 4. Alamat backend bisa diubah saat runtime

Lewat menu **Pengaturan → Koneksi Server** (tersimpan di localStorage), tanpa
perlu build ulang. Berguna untuk mengarahkan build Vercel ke backend baru.

### Troubleshooting "Gagal memuat data budaya"

| Penyebab | Solusi |
|---|---|
| `VITE_API_BASE_URL` belum diisi | Set di Vercel → redeploy, atau isi lewat Pengaturan |
| Domain frontend tidak diizinkan | Tambahkan domain Vercel ke `CORS_ORIGINS` backend lalu restart |
| Backend mati / salah URL | Cek "Cek Koneksi" di Pengaturan |
| Backend gratis sedang bangun | Tunggu 30–60 detik, lalu muat ulang |
| Balasan bukan JSON | Backend tidak mengembalikan JSON — cek URL dan proxy |


## Phases

1. Foundation & UI/UX (current)
2. Interactive map & 38 provinces
3. Cultural database
4. Cultural exploration
5. Marker-based & markerless AR
6. Quiz & gamification
7. Player profiles & progress
8. Testing, optimization, publishing
