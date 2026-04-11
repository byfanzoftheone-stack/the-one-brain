"""
Nervous System API — The Ears
Receives signals from trucks, sensors, and software.
Zero latency: dumps straight to Redis queue, no waiting.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import redis
import json
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("NervousSystem")

app = FastAPI(title="Nervous System API", version="1.0.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Connect to Redis spine
try:
    r = redis.Redis(host="redis", port=6379, db=0, decode_responses=True)
    r.ping()
    logger.info("Redis spine connected")
except Exception:
    r = None
    logger.warning("Redis not available — running in log-only mode")

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _queue(queue_name: str, payload: dict):
    payload["received_at"] = _now()
    if r:
        r.rpush(queue_name, json.dumps(payload))
    logger.info(f"[{queue_name}] Signal: {payload}")

class LogisticsSignal(BaseModel):
    unit_id:    str   = Field(..., min_length=2)
    gps_lat:    float
    gps_long:   float
    status:     str
    error_code: Optional[str] = None
    telemetry:  Optional[dict] = None

class SoftwareSignal(BaseModel):
    service_name:     str
    endpoint:         str
    response_time_ms: int = Field(..., ge=0)
    error_log:        Optional[str] = None
    status_code:      Optional[int] = None

class OverrideCommand(BaseModel):
    unit_id:      str
    command:      str
    route_update: Optional[str] = None
    auth_token:   str

@app.get("/health")
def health():
    return {"status": "operational", "spine": "connected" if r else "offline", "timestamp": _now()}

@app.post("/input/logistics", status_code=202)
def receive_logistics(signal: LogisticsSignal):
    _queue("logistics_queue", signal.model_dump())
    return {"status": "Signal received", "queue": "logistics", "unit": signal.unit_id}

@app.post("/input/software", status_code=202)
def receive_software(signal: SoftwareSignal):
    _queue("software_queue", signal.model_dump())
    return {"status": "Signal received", "queue": "software", "service": signal.service_name}

@app.post("/override", status_code=200)
def send_override(cmd: OverrideCommand):
    _queue("override_queue", cmd.model_dump())
    logger.info(f"OVERRIDE sent to {cmd.unit_id}: {cmd.command}")
    return {"status": "Override dispatched", "unit": cmd.unit_id, "command": cmd.command}

@app.get("/queue/status")
def queue_status():
    if not r:
        return {"error": "Redis offline"}
    return {
        "logistics_queue": r.llen("logistics_queue"),
        "software_queue":  r.llen("software_queue"),
        "override_queue":  r.llen("override_queue"),
    }
