"""Content Engine API — trigger the pipeline via HTTP."""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import logging
import json
from pathlib import Path
from src.engine import run_pipeline, generate_script, PROFILES

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ContentAPI")

app = FastAPI(title="Content Engine API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ContentRequest(BaseModel):
    topic:    str          = Field(..., min_length=5)
    avatar:   str          = Field(default="the_fixer")
    duration: int          = Field(default=30, ge=10, le=300)

@app.get("/health")
def health():
    return {"status": "operational", "engine": "content-pipeline-v1"}

@app.get("/avatars")
def get_avatars():
    return {"avatars": list(PROFILES["avatars"].keys()), "profiles": PROFILES["avatars"]}

@app.post("/generate/script")
def script_only(req: ContentRequest):
    try:
        return generate_script(req.topic, req.avatar, req.duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/full")
def full_pipeline(req: ContentRequest):
    try:
        return run_pipeline(req.topic, req.avatar, req.duration)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
