"""
Agent Runtime — THE ONE teacher/student/skip execution layer.
Coordinates across Claude (teacher), Ollama (student/skip), and logs results.
"""
import json, os, sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

LOG_DIR = Path("warehouse/runtime")
LOG_DIR.mkdir(parents=True, exist_ok=True)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _log(event: str, data: dict):
    path = LOG_DIR / f"agent_runtime_{event}.json"
    path.write_text(json.dumps({"timestamp": _now(), "event": event, "data": data}, indent=2))

def run_task(task: dict) -> dict:
    """Route a task through the best available provider."""
    try:
        from providers.provider_router import route
        result = route(task)
        _log("task_complete", {"task": task, "status": result.get("status")})
        return result
    except Exception as e:
        _log("task_error", {"task": task, "error": str(e)})
        return {"status": "error", "error": str(e), "task": task}

def run_agent(agent_name: str, payload: dict = {}) -> dict:
    """Run a named agent with a payload."""
    agents = {
        "strategist": _run_strategist,
        "builder":    _run_builder,
        "auditor":    _run_auditor,
    }
    fn = agents.get(agent_name)
    if not fn:
        return {"status": "not_found", "agent": agent_name}
    try:
        result = fn(payload)
        _log(f"agent_{agent_name}", {"payload": payload, "result": result})
        return {"status": "ok", "agent": agent_name, "result": result, "timestamp": _now()}
    except Exception as e:
        return {"status": "error", "agent": agent_name, "error": str(e)}

def _run_strategist(payload: dict) -> dict:
    from agents.strategist.strategy_agent import run
    return run(payload)

def _run_builder(payload: dict) -> dict:
    from agents.builder.builder_agent import run
    return run(payload)

def _run_auditor(payload: dict) -> dict:
    from agents.auditor.quality_auditor import audit_all
    return audit_all()

class AgentRuntime:
    """OOP wrapper for the runtime — used by agent_runtime routes."""
    def inbound_opportunities(self):
        inbound = Path("opportunities/inbound")
        return sorted(inbound.glob("*.json")) if inbound.exists() else []

    def analyze(self) -> list:
        results = []
        for file in self.inbound_opportunities():
            data   = json.loads(file.read_text())
            task   = {"kind": "analysis", "prompt": f"Analyze this opportunity and recommend a product path: {data}"}
            result = run_task(task)
            results.append({"file": str(file), "result": result})
        return results

    def get_status(self) -> dict:
        return {
            "status":      "ready",
            "timestamp":   _now(),
            "agents":      ["strategist", "builder", "auditor"],
            "provider":    "auto",
            "inbound":     len(self.inbound_opportunities()),
        }

if __name__ == "__main__":
    runtime = AgentRuntime()
    print(json.dumps(runtime.get_status(), indent=2))
