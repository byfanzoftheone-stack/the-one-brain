"""Marketplace Status Engine — tracks listing status transitions."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT         = Path(__file__).resolve().parents[1]
LISTINGS_DIR = ROOT / "marketplace/listings"

def _now(): return datetime.now(timezone.utc).isoformat()

VALID_STATUSES = ("draft", "review", "active", "paused", "archived")

def set_status(app_name: str, status: str) -> dict:
    if status not in VALID_STATUSES:
        return {"error": f"Invalid status. Must be one of: {VALID_STATUSES}"}
    path = LISTINGS_DIR / f"{app_name}.json"
    if not path.exists():
        return {"error": f"Listing '{app_name}' not found"}
    data = json.loads(path.read_text())
    data["status"]     = status
    data["updated_at"] = _now()
    path.write_text(json.dumps(data, indent=2))
    return {"status": "updated", "app": app_name, "new_status": status}

def get_active() -> list:
    if not LISTINGS_DIR.exists():
        return []
    return [
        json.loads(f.read_text()) for f in LISTINGS_DIR.glob("*.json")
        if json.loads(f.read_text()).get("status") == "active"
    ]

def get_all() -> list:
    if not LISTINGS_DIR.exists():
        return []
    out = []
    for f in sorted(LISTINGS_DIR.glob("*.json")):
        try:
            out.append(json.loads(f.read_text()))
        except Exception:
            pass
    return out
