"""
Marketplace Sync Engine — syncs local listings to the marketplace registry.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT          = Path(__file__).resolve().parents[1]
LISTINGS_DIR  = ROOT / "marketplace/listings"
REGISTRY_FILE = ROOT / "backend/marketplace/marketplace_registry.json"

def _now(): return datetime.now(timezone.utc).isoformat()

def sync_marketplace() -> dict:
    LISTINGS_DIR.mkdir(parents=True, exist_ok=True)
    listings = []
    for f in sorted(LISTINGS_DIR.glob("*.json")):
        try:
            data = json.loads(f.read_text())
            data.setdefault("slug", f.stem)
            data.setdefault("status", "draft")
            listings.append(data)
        except Exception:
            pass

    registry = {"listings": listings, "count": len(listings), "synced_at": _now()}
    REGISTRY_FILE.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY_FILE.write_text(json.dumps(registry, indent=2))
    return {"status": "synced", "listings": len(listings)}

if __name__ == "__main__":
    print(json.dumps(sync_marketplace(), indent=2))
