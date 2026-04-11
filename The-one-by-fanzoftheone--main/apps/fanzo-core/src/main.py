"""
Fanzo Core Template — Iron Core Standard
Hardened FastAPI microservice. Strict typing, health checks, defensive coding.
Duplicate this for every service you build.
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Any
import logging
from datetime import datetime, timezone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FanzoCore")

app = FastAPI(title="Fanzo Core", version="1.0.0", description="Iron Core Standard Microservice")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

# ── Strict Data Contract ──────────────────────────────────────────────────
class TaskPayload(BaseModel):
    task_id:    str            = Field(..., min_length=5, description="Unique task ID")
    priority:   int            = Field(..., ge=1, le=5,   description="1=Low, 5=Critical")
    command:    str            = Field(..., min_length=1)
    parameters: Optional[dict] = None
    source:     Optional[str]  = "api"

class TaskResult(BaseModel):
    task_id:    str
    outcome:    str
    processed:  bool
    timestamp:  str
    details:    Optional[Any] = None

# ── Health Check ──────────────────────────────────────────────────────────
@app.get("/health", status_code=200)
def health_check() -> dict:
    """Heartbeat. Container restarts automatically if this fails."""
    return {"status": "operational", "integrity": "100%", "timestamp": _now()}

# ── Core Processor ────────────────────────────────────────────────────────
@app.post("/execute", response_model=TaskResult, status_code=200)
def execute_task(payload: TaskPayload) -> TaskResult:
    """
    Receives a task. Enforces strict typing. Handles all failures gracefully.
    Plug your business logic into the try block.
    """
    logger.info(f"Task received: {payload.task_id} priority={payload.priority}")

    try:
        # ── PLUG YOUR LOGIC HERE ────────────────────────────────────────
        if payload.command == "CRASH_TEST":
            raise ValueError("Intentional simulation error")

        # Your business logic goes here
        result_details = {
            "command_executed": payload.command,
            "parameters":       payload.parameters,
            "rigid_check":      "passed",
        }

        return TaskResult(
            task_id=payload.task_id,
            outcome="success",
            processed=True,
            timestamp=_now(),
            details=result_details,
        )

    except ValueError as e:
        logger.error(f"Logic error on {payload.task_id}: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Logic failure: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.critical(f"Crash prevented on {payload.task_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal integrity protocol triggered")

# ── Batch Processor ───────────────────────────────────────────────────────
@app.post("/execute/batch", status_code=200)
def execute_batch(tasks: list[TaskPayload]) -> dict:
    """Process multiple tasks. Returns success + failure counts."""
    results, errors = [], []
    for task in tasks:
        try:
            result = execute_task(task)
            results.append(result)
        except HTTPException as e:
            errors.append({"task_id": task.task_id, "error": e.detail})
    return {"processed": len(results), "failed": len(errors), "results": results, "errors": errors}
