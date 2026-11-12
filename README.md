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

## Deployment

Dua project Vercel dari satu repo:

| Project | Root Directory | Framework | URL |
|---|---|---|---|
| `ar-bhinneka` (frontend) | `frontend` | Vite | https://ar-bhinneka.vercel.app |
| `ar-bhinneka-api` (backend) | `backend` | FastAPI | https://ar-bhinneka-api.vercel.app |

Keduanya sudah terhubung ke repo GitHub, jadi **setiap push ke `main` otomatis
deploy**. Env yang sudah diatur:

- `ar-bhinneka`: `VITE_API_BASE_URL=https://ar-bhinneka-api.vercel.app`
- `ar-bhinneka-api`: `CORS_ORIGINS=*`

Perintah manual kalau perlu:

```bash
# API
cd backend && npx vercel --prod

# Frontend
cd frontend && npx vercel --prod
```

Catatan: karena Root Directory di-set, deploy manual dari subfolder akan gagal
("Root Directory does not exist"). Pakai push ke GitHub, atau kosongkan
sementara Root Directory lewat `vercel project update`.

### Alternatif backend: Render

`render.yaml` disediakan kalau ingin backend yang selalu hidup (tidak
serverless). Klik:

```
https://render.com/deploy?repo=https://github.com/zidan-herlangga/ar-bhinneka
```

Lalu ganti `VITE_API_BASE_URL` di Vercel ke URL Render dan redeploy.
Instance gratis Render tidur setelah ~15 menit tanpa trafik (cold start
30–60 detik); frontend punya fallback lokal saat itu terjadi.

### Database (opsional)

Tanpa `MONGO_URL`, API tetap jalan dan progres disimpan di browser
(localStorage). Untuk menyimpan progres di server, isi `MONGO_URL`
(MongoDB Atlas) di Environment Variables project `ar-bhinneka-api`, lalu
redeploy. `/api/health` akan melaporkan `"database": "configured"`.

### Kalau backend belum siap

Aplikasi tetap jalan memakai paket data lokal (`frontend/src/data/cultures.json`)
dan menampilkan banner "Mode offline".

### Alamat backend bisa diubah saat runtime

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
