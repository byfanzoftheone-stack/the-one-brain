import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.settings import settings
from .db.init_db import init_db
from .api.routes import router as api_router

app = FastAPI(
    title="THE ONE API (TM – FanzoftheOne)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _startup():
    init_db()

@app.get("/health")
def health():
    return {"ok": True, "name": "THE ONE API", "version": app.version}

app.include_router(api_router, prefix="/api")
