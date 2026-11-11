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

## Phases

1. Foundation & UI/UX (current)
2. Interactive map & 38 provinces
3. Cultural database
4. Cultural exploration
5. Marker-based & markerless AR
6. Quiz & gamification
7. Player profiles & progress
8. Testing, optimization, publishing