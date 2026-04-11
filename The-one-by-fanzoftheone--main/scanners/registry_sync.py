"""Syncs the module registry with the current filesystem state."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT         = Path(__file__).resolve().parents[1]
MODULES_DIR  = ROOT / "modules"
REGISTRY_OUT = ROOT / "warehouse/registry.json"

def _now(): return datetime.now(timezone.utc).isoformat()

def sync() -> dict:
    modules = []
    if MODULES_DIR.exists():
        for d in sorted(MODULES_DIR.iterdir()):
            if not d.is_dir() or d.name.startswith("_"):
                continue
            manifest_path = d / "module.json"
            entry = {"slug": d.name, "path": str(d.relative_to(ROOT)), "has_manifest": manifest_path.exists()}
            if manifest_path.exists():
                try:
                    entry.update(json.loads(manifest_path.read_text()))
                except Exception:
                    pass
            modules.append(entry)

    registry = {"modules": modules, "count": len(modules), "synced_at": _now()}
    REGISTRY_OUT.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY_OUT.write_text(json.dumps(registry, indent=2))
    print(f"registry synced — {len(modules)} modules")
    return registry

if __name__ == "__main__":
    print(json.dumps(sync(), indent=2))
