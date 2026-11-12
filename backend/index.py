"""Entrypoint Vercel (preset FastAPI).

Vercel memuat variabel `app` sebagai aplikasi ASGI dan mengarahkan semua
request ke sini, jadi path `/api/...` tetap utuh seperti saat lokal.
"""
from app.main import app  # noqa: F401
