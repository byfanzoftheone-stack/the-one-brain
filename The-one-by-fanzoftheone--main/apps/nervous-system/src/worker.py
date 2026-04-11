"""
Nervous System Worker — The Synapse
Watches Redis queues. Wakes up agents on signals.
Plug in your LLM calls where marked.
"""
import redis
import json
import time
import logging
import os
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO, format="%(asctime)s [BRAIN] %(message)s")
logger = logging.getLogger("NervousWorker")

r = redis.Redis(host=os.getenv("REDIS_HOST", "redis"), port=6379, db=0, decode_responses=True)

def _now():
    return datetime.now(timezone.utc).isoformat()

def _log_action(agent: str, unit: str, action: str, outcome: str):
    entry = {"ts": _now(), "agent": agent, "unit": unit, "action": action, "outcome": outcome}
    r.rpush("action_log", json.dumps(entry))
    r.ltrim("action_log", -500, -1)  # keep last 500
    logger.info(f"[{agent}] {unit} → {action}: {outcome}")

def agent_strategist(data: dict):
    """Teacher agent — plans the response."""
    unit   = data.get("unit_id", "unknown")
    error  = data.get("error_code")
    status = data.get("status", "unknown")

    logger.info(f"STRATEGIST: unit={unit} status={status} error={error}")

    if error:
        # ── PLUG IN LLM CALL HERE ────────────────────────────────────────
        # response = call_claude(f"Unit {unit} has error {error}. Plan a fix.")
        # ────────────────────────────────────────────────────────────────
        action = f"REROUTE_{unit}_TO_NEAREST_DEPOT"
        r.rpush("override_queue", json.dumps({"unit_id": unit, "command": action, "auth_token": "AUTO"}))
        _log_action("STRATEGIST", unit, action, "override_queued")
    else:
        _log_action("STRATEGIST", unit, "MONITOR", "status_ok")

def agent_debugger(data: dict):
    """Debugger agent — analyzes software errors."""
    service = data.get("service_name", "unknown")
    error   = data.get("error_log")
    latency = data.get("response_time_ms", 0)

    logger.info(f"DEBUGGER: service={service} latency={latency}ms error={bool(error)}")

    if error or latency > 2000:
        # ── PLUG IN LLM CALL HERE ────────────────────────────────────────
        # patch = call_claude(f"Service {service} error: {error}. Write a hotfix.")
        # ────────────────────────────────────────────────────────────────
        action = f"ALERT_AND_RESTART_{service}"
        _log_action("DEBUGGER", service, action, "restart_queued")
    else:
        _log_action("DEBUGGER", service, "MONITOR", "latency_ok")

logger.info("NERVOUS SYSTEM ONLINE — Waiting for signals...")

while True:
    try:
        # Logistics queue
        task = r.lpop("logistics_queue")
        if task:
            agent_strategist(json.loads(task))

        # Software queue
        task = r.lpop("software_queue")
        if task:
            agent_debugger(json.loads(task))

    except redis.RedisError as e:
        logger.error(f"Redis error: {e}")
    except Exception as e:
        logger.critical(f"Worker error prevented crash: {e}")

    time.sleep(0.1)
