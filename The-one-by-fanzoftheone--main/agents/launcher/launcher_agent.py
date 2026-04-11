"""
Launcher Agent — triggers production deploys via CLI or API.
Wraps Vercel and Railway deploy commands.
"""
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]

def _now(): return datetime.now(timezone.utc).isoformat()

def _run_cmd(cmd: list, cwd: Path = None) -> dict:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd=cwd or ROOT)
        return {"status": "ok" if result.returncode == 0 else "error", "stdout": result.stdout[:500], "stderr": result.stderr[:200], "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        return {"status": "timeout", "error": "Command timed out after 120s"}
    except FileNotFoundError:
        return {"status": "not_found", "error": f"Command '{cmd[0]}' not found on PATH"}

def deploy_frontend(prod: bool = True) -> dict:
    cmd = ["vercel", "--prod"] if prod else ["vercel"]
    result = _run_cmd(cmd, cwd=ROOT / "frontend")
    _log("deploy_frontend", result)
    return result

def deploy_backend() -> dict:
    result = _run_cmd(["railway", "up"], cwd=ROOT / "backend")
    _log("deploy_backend", result)
    return result

def _log(event: str, data: dict):
    out = ROOT / "warehouse/receipts/launches"
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{event}.json").write_text(json.dumps({"event": event, "data": data, "timestamp": _now()}, indent=2))

def run(config: dict = {}) -> dict:
    target  = config.get("target", "frontend")
    results = {}
    if target in ("frontend", "all"):
        results["frontend"] = deploy_frontend(config.get("prod", True))
    if target in ("backend", "all"):
        results["backend"] = deploy_backend()
    return {"status": "launched", "targets": results, "timestamp": _now()}

if __name__ == "__main__":
    print(json.dumps(run({"target": "frontend"}), indent=2))
