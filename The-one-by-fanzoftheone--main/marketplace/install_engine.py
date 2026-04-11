"""
Install Engine — handles customer installs of marketplace apps/bundles.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT           = Path(__file__).resolve().parents[1]
INSTALLS_DIR   = ROOT / "warehouse/installs"
INSTALLS_DIR.mkdir(parents=True, exist_ok=True)

def _now(): return datetime.now(timezone.utc).isoformat()

def install(app_name: str, customer_id: str) -> dict:
    receipt = {
        "app":         app_name,
        "customer_id": customer_id,
        "installed_at":_now(),
        "status":      "installed",
        "license_key": f"LIC-{customer_id[:6].upper()}-{app_name[:4].upper()}-{len(customer_id)}",
    }
    out = INSTALLS_DIR / f"{customer_id}--{app_name}.json"
    out.write_text(json.dumps(receipt, indent=2))
    return receipt

def list_installs(customer_id: str = None) -> list:
    pattern = f"{customer_id}--*.json" if customer_id else "*.json"
    return [json.loads(f.read_text()) for f in INSTALLS_DIR.glob(pattern)]
