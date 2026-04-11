"""Agent Registry Sync — records all agent statuses to warehouse."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]

def _now(): return datetime.now(timezone.utc).isoformat()

AGENTS = [
    {"name": "strategist", "module": "agents.strategist.strategy_agent", "status": "ready"},
    {"name": "builder",    "module": "agents.builder.builder_agent",     "status": "ready"},
    {"name": "auditor",    "module": "agents.auditor.quality_auditor",   "status": "ready"},
    {"name": "launcher",   "module": "agents.launcher.launcher_agent",   "status": "idle"},
    {"name": "maid",       "module": "agents.maintenance.maid_agent",    "status": "idle"},
    {"name": "autopilot",  "module": "agents.autopilot.autopilot_engine","status": "idle"},
]

def sync() -> dict:
    registry = {"agents": AGENTS, "count": len(AGENTS), "synced_at": _now()}
    out = ROOT / "warehouse/agents"
    out.mkdir(parents=True, exist_ok=True)
    (out / "registry.json").write_text(json.dumps(registry, indent=2))
    return registry

if __name__ == "__main__":
    print(json.dumps(sync(), indent=2))
