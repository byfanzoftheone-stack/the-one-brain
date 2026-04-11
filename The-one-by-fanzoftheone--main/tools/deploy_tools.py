"""
Deploy Tools — helpers for Vercel + Railway deployments.
"""
import os
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

def deployment_targets() -> dict:
    return {
        "frontend": {"platform": "vercel",  "dir": "frontend",        "command": "vercel --prod"},
        "backend":  {"platform": "railway", "dir": "backend",         "command": "railway up"},
        "container":{"platform": "docker",  "dir": "backend",         "command": "docker build ."},
    }

def check_vercel_cli() -> bool:
    try:
        result = subprocess.run(["vercel", "--version"], capture_output=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False

def check_railway_cli() -> bool:
    try:
        result = subprocess.run(["railway", "--version"], capture_output=True, timeout=5)
        return result.returncode == 0
    except Exception:
        return False

def get_deploy_status() -> dict:
    return {
        "vercel_cli":  check_vercel_cli(),
        "railway_cli": check_railway_cli(),
        "env_vars": {
            "NEXT_PUBLIC_API_URL": "set" if os.getenv("NEXT_PUBLIC_API_URL") else "missing",
            "DATABASE_URL":        "set" if os.getenv("DATABASE_URL") else "missing",
            "ANTHROPIC_API_KEY":   "set" if os.getenv("ANTHROPIC_API_KEY") else "missing",
        },
        "timestamp": _now(),
    }

def write_deploy_receipt(target: str, status: str, notes: str = "") -> dict:
    receipt = {"target": target, "status": status, "notes": notes, "timestamp": _now()}
    out_dir = ROOT / "warehouse/receipts/deploys"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{target}.json").write_text(json.dumps(receipt, indent=2))
    return receipt
