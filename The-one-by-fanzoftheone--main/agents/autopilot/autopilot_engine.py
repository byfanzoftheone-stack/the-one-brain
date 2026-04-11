"""
Autopilot Engine — runs the full ecosystem cycle autonomously.
Collects opportunities → ranks → builds → audits → publishes.
"""
import json
import time
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
LOG  = ROOT / "warehouse/autopilot_log.json"

def _now(): return datetime.now(timezone.utc).isoformat()

def _append_log(entry: dict):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    log = []
    if LOG.exists():
        try:
            log = json.loads(LOG.read_text())
        except Exception:
            log = []
    if not isinstance(log, list):
        log = []
    log.append(entry)
    LOG.write_text(json.dumps(log[-100:], indent=2))  # keep last 100

def run_cycle() -> dict:
    """Run one full autopilot cycle."""
    cycle = {"started_at": _now(), "steps": [], "errors": []}

    # Step 1: Collect + rank opportunities
    try:
        from opportunities.opportunity_engine import collect
        from opportunities.opportunity_ranker  import rank
        opps        = rank(collect())
        top         = [o for o in opps if o.get("score", 0) >= 70]
        cycle["steps"].append({"step": "opportunities", "found": len(opps), "approved": len(top)})
    except Exception as e:
        cycle["errors"].append(f"opportunities: {e}")
        top = []

    # Step 2: Build approved opportunities
    try:
        from agents.builder.builder_agent import run as builder_run
        built = []
        for opp in top[:2]:  # limit to 2 per cycle
            recipe = {"name": opp.get("idea", "").replace(" ", "-").lower()[:30], "modules": ["crm", "analytics", "payments"]}
            result = builder_run(recipe)
            built.append(result)
        cycle["steps"].append({"step": "build", "built": len(built)})
    except Exception as e:
        cycle["errors"].append(f"build: {e}")

    # Step 3: Audit
    try:
        from agents.auditor.quality_auditor import audit_all
        audit = audit_all()
        cycle["steps"].append({"step": "audit", "reports": len(audit.get("reports", []))})
    except Exception as e:
        cycle["errors"].append(f"audit: {e}")

    # Step 4: Sync marketplace
    try:
        from marketplace.sync_engine import sync_marketplace
        sync = sync_marketplace()
        cycle["steps"].append({"step": "marketplace_sync", "listings": sync.get("listings", 0)})
    except Exception as e:
        cycle["errors"].append(f"sync: {e}")

    cycle["completed_at"] = _now()
    cycle["status"]       = "ok" if not cycle["errors"] else "partial"
    _append_log(cycle)
    return cycle

def run_loop(interval: int = 3600, max_cycles: int = None) -> None:
    """Run continuously. interval = seconds between cycles."""
    count = 0
    while True:
        print(f"[autopilot] cycle {count + 1} starting...")
        try:
            result = run_cycle()
            print(f"[autopilot] cycle complete — {result['status']}")
        except Exception as e:
            print(f"[autopilot] cycle error: {e}")
        count += 1
        if max_cycles and count >= max_cycles:
            break
        time.sleep(interval)

if __name__ == "__main__":
    print(json.dumps(run_cycle(), indent=2))
