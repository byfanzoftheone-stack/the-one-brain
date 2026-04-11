"""
Publish Engine — moves apps from draft → published and notifies the registry.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT         = Path(__file__).resolve().parents[1]
LISTINGS_DIR = ROOT / "marketplace/listings"
RECEIPTS_DIR = ROOT / "warehouse/receipts/publish"
RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)

def _now(): return datetime.now(timezone.utc).isoformat()

def publish(app_name: str, version: str = "1.0.0") -> dict:
    listing_path = LISTINGS_DIR / f"{app_name}.json"
    if not listing_path.exists():
        return {"status": "error", "error": f"Listing for '{app_name}' not found. Create it first."}

    listing = json.loads(listing_path.read_text())
    listing["status"]       = "active"
    listing["version"]      = version
    listing["published_at"] = _now()
    listing_path.write_text(json.dumps(listing, indent=2))

    receipt = {"app": app_name, "version": version, "published_at": _now(), "status": "published"}
    (RECEIPTS_DIR / f"{app_name}.json").write_text(json.dumps(receipt, indent=2))

    return {"status": "published", "app": app_name, "version": version}

def unpublish(app_name: str, reason: str = "") -> dict:
    listing_path = LISTINGS_DIR / f"{app_name}.json"
    if not listing_path.exists():
        return {"status": "error", "error": "not found"}
    listing = json.loads(listing_path.read_text())
    listing["status"]        = "paused"
    listing["unpublished_at"]= _now()
    listing["reason"]        = reason
    listing_path.write_text(json.dumps(listing, indent=2))
    return {"status": "unpublished", "app": app_name}
