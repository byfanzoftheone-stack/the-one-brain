"""
System Validator — checks the health of every key component in THE ONE.
Run directly: python -m diagnostics.system_validator
"""
import json
import os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

CHECKS = {
    "backend_exists":     ROOT / "backend",
    "frontend_exists":    ROOT / "frontend",
    "modules_exists":     ROOT / "modules",
    "agents_exists":      ROOT / "agents",
    "warehouse_exists":   ROOT / "warehouse",
    "runtime_exists":     ROOT / "runtime",
    "providers_exists":   ROOT / "providers",
}

KEY_FILES = {
    "backend_main":       ROOT / "backend/app/main.py",
    "frontend_package":   ROOT / "frontend/package.json",
    "modules_catalog":    ROOT / "modules/catalog.json",
    "vercel_json":        ROOT / "frontend/vercel.json",
    "requirements_txt":   ROOT / "backend/requirements.txt",
    "crew_heartbeat":     ROOT / "runtime/crew_heartbeat.py",
    "companion_engine":   ROOT / "companion/companion_engine.py",
}

KEY_ENV = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "DATABASE_URL", "NEXT_PUBLIC_API_URL"]

def _now(): return datetime.now(timezone.utc).isoformat()

def validate() -> dict:
    results: dict = {"timestamp": _now(), "checks": {}, "env": {}, "summary": {}}

    # Directory checks
    for name, path in CHECKS.items():
        results["checks"][name] = {"path": str(path), "exists": path.exists()}

    # File checks
    for name, path in KEY_FILES.items():
        size = path.stat().st_size if path.exists() else 0
        results["checks"][name] = {"path": str(path), "exists": path.exists(), "size": size, "empty": size == 0}

    # Env checks
    for var in KEY_ENV:
        val = os.getenv(var, "")
        results["env"][var] = "set" if val else "missing"

    # Summary
    total  = len(results["checks"])
    passed = sum(1 for v in results["checks"].values() if v.get("exists") and not v.get("empty"))
    missing_env = [k for k, v in results["env"].items() if v == "missing"]

    results["summary"] = {
        "total_checks": total,
        "passed": passed,
        "failed": total - passed,
        "health": "healthy" if passed >= total * 0.8 else "degraded",
        "missing_env": missing_env,
        "ready_to_deploy": passed >= total * 0.8 and "DATABASE_URL" not in missing_env,
    }

    # Write report
    out = ROOT / "warehouse/diagnostics"
    out.mkdir(parents=True, exist_ok=True)
    (out / "latest.json").write_text(json.dumps(results, indent=2))

    return results


if __name__ == "__main__":
    report = validate()
    print(json.dumps(report["summary"], indent=2))
    print(f"\nFull report: warehouse/diagnostics/latest.json")
