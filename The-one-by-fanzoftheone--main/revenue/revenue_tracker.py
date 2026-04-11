"""
Revenue Tracker — tracks all monetization activity across THE ONE ecosystem.
Records app launches, marketplace listings, and revenue milestones.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT          = Path(__file__).resolve().parents[1]
REVENUE_DIR   = ROOT / "warehouse/revenue"
REVENUE_FILE  = REVENUE_DIR / "revenue_log.json"
RANKINGS_FILE = REVENUE_DIR / "revenue_rankings.json"
REVENUE_DIR.mkdir(parents=True, exist_ok=True)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _read(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default if default is not None else []

def _write(path: Path, data):
    path.write_text(json.dumps(data, indent=2))


def record_event(app: str, event_type: str, amount: float = 0.0, notes: str = "") -> dict:
    """Record a revenue event: sale, subscription, trial, etc."""
    log = _read(REVENUE_FILE, [])
    entry = {
        "id": len(log) + 1,
        "app": app,
        "type": event_type,       # sale | subscription | trial | refund | milestone
        "amount": amount,
        "notes": notes,
        "timestamp": _now(),
    }
    log.append(entry)
    _write(REVENUE_FILE, log)
    _update_rankings()
    return {"status": "recorded", "entry": entry}


def _update_rankings():
    log = _read(REVENUE_FILE, [])
    totals: dict[str, float] = {}
    counts: dict[str, int]   = {}
    for entry in log:
        app = entry.get("app", "unknown")
        totals[app] = totals.get(app, 0.0) + entry.get("amount", 0.0)
        counts[app] = counts.get(app, 0)   + 1

    rankings = sorted(
        [{"app": a, "total_revenue": totals[a], "transactions": counts[a]} for a in totals],
        key=lambda x: x["total_revenue"], reverse=True
    )
    _write(RANKINGS_FILE, {"rankings": rankings, "updated_at": _now()})


def get_summary() -> dict:
    log      = _read(REVENUE_FILE, [])
    rankings = _read(RANKINGS_FILE, {}).get("rankings", [])
    total    = sum(e.get("amount", 0) for e in log)

    return {
        "total_revenue":   total,
        "total_events":    len(log),
        "apps_tracked":    len(rankings),
        "top_app":         rankings[0]["app"] if rankings else None,
        "rankings":        rankings[:5],
        "updated_at":      _now(),
    }


def get_app_revenue(app: str) -> dict:
    log     = _read(REVENUE_FILE, [])
    entries = [e for e in log if e.get("app") == app]
    total   = sum(e.get("amount", 0) for e in entries)
    return {"app": app, "total": total, "transactions": len(entries), "events": entries[-10:]}


if __name__ == "__main__":
    record_event("construction-ops",  "subscription", 99.0,  "First paying customer")
    record_event("play-better",       "trial",         0.0,   "Trial signup")
    record_event("little-pro",        "sale",         299.0,  "Setup fee")
    print(json.dumps(get_summary(), indent=2))
