from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOW_ALL_ORIGINS, CORS_ORIGINS
from .db import connect, disconnect
from .routers import health, provinces, cultures, quiz, players

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    yield
    await disconnect()

app = FastAPI(title="Bhinneka Tunggal Ika API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=not ALLOW_ALL_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(provinces.router, prefix="/api")
app.include_router(cultures.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(players.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Bhinneka Tunggal Ika API"}