"""
Bundle Engine — packages multiple modules together for marketplace distribution.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone

ROOT          = Path(__file__).resolve().parents[1]
BUNDLES_DIR   = ROOT / "marketplace/bundles"
MODULES_DIR   = ROOT / "modules"

def _now(): return datetime.now(timezone.utc).isoformat()

def create_bundle(name: str, module_slugs: list, price: int = 199) -> dict:
    BUNDLES_DIR.mkdir(parents=True, exist_ok=True)
    bundle_dir = BUNDLES_DIR / name
    bundle_dir.mkdir(parents=True, exist_ok=True)

    resolved = []
    for slug in module_slugs:
        mod = MODULES_DIR / slug
        if mod.exists():
            resolved.append(slug)

    manifest = {
        "name":       name,
        "slug":       name,
        "modules":    resolved,
        "price":      price,
        "currency":   "USD",
        "type":       "bundle",
        "status":     "draft",
        "created_at": _now(),
    }
    (bundle_dir / "bundle.json").write_text(json.dumps(manifest, indent=2))
    return {"status": "created", "bundle": name, "modules": resolved, "price": price}

def list_bundles() -> list:
    if not BUNDLES_DIR.exists():
        return []
    return [
        json.loads((d / "bundle.json").read_text())
        for d in BUNDLES_DIR.iterdir()
        if d.is_dir() and (d / "bundle.json").exists()
    ]
