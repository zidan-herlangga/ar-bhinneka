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

## Deployment (frontend di Vercel, backend di Render/Railway/Fly)

1. **Backend** — deploy folder `backend`:
   - Install: `python -m pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Env: `MONGO_URL` (Atlas), `DB_NAME`, `CORS_ORIGINS`
     (pisahkan beberapa origin dengan koma, contoh:
     `http://localhost:5173,https://nama-app.vercel.app`)

2. **Frontend** — deploy folder `frontend` di Vercel:
   - Framework: Vite · Build: `npm run build` · Output: `dist`
   - Env: `VITE_API_BASE_URL=https://url-backend-anda`
   - Redeploy setelah env diubah (env Vite dibekukan saat build).

3. **Kalau backend belum siap** — aplikasi tetap jalan memakai paket data lokal
   (`frontend/src/data/cultures.json`) dan menampilkan banner "Mode offline".

4. **Alamat backend bisa diubah saat runtime** lewat menu Pengaturan →
   "Koneksi Server" (tersimpan di localStorage), tanpa perlu build ulang.

### Troubleshooting "Gagal memuat data budaya"

| Penyebab | Solusi |
|---|---|
| `VITE_API_BASE_URL` belum diisi | Set di Vercel → redeploy, atau isi lewat Pengaturan |
| Domain frontend tidak diizinkan | Tambahkan domain Vercel ke `CORS_ORIGINS` backend lalu restart |
| Backend mati / salah URL | Cek "Cek Koneksi" di Pengaturan |
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
