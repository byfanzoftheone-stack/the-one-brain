"""
Ecosystem Map Generator — scans all top-level dirs and writes source-of-truth/ecosystem_map.json.
Run directly or via run_crew_heartbeat.py.
"""
import os
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

def list_dirs(rel: str) -> list:
    path = ROOT / rel
    if not path.exists():
        return []
    return sorted([d.name for d in path.iterdir() if d.is_dir() and not d.name.startswith(".")])

def list_py(rel: str) -> list:
    path = ROOT / rel
    if not path.exists():
        return []
    return sorted([f.name for f in path.iterdir() if f.suffix == ".py" and not f.name.startswith("_")])

def list_json(rel: str) -> list:
    path = ROOT / rel
    if not path.exists():
        return []
    return sorted([f.stem for f in path.iterdir() if f.suffix == ".json"])

def generate() -> dict:
    ecosystem = {
        "generated_at":       _now(),
        "apps":               list_dirs("apps"),
        "modules":            list_dirs("modules"),
        "agents":             list_dirs("agents"),
        "workers":            list_py("workers"),
        "scanners":           list_py("scanners"),
        "signals":            list_dirs("signals"),
        "tools":              list_py("tools"),
        "providers":          list_py("providers"),
        "runtime_services":   list_py("runtime"),
        "marketplace_engines":list_py("marketplace"),
        "warehouse_receipts": list_json("warehouse/receipts"),
        "campaigns":          list_json("campaigns/drafts"),
        "labs":               list_py("labs"),
        "counts": {
            "apps":     len(list_dirs("apps")),
            "modules":  len(list_dirs("modules")),
            "agents":   len(list_dirs("agents")),
            "workers":  len(list_py("workers")),
        }
    }

    out = ROOT / "source-of-truth"
    out.mkdir(parents=True, exist_ok=True)
    (out / "ecosystem_map.json").write_text(json.dumps(ecosystem, indent=2))
    print(f"ecosystem map updated — {ecosystem['counts']['apps']} apps, {ecosystem['counts']['modules']} modules")
    return ecosystem

# Module-level so it runs on import (backward compat)
ecosystem = generate()

if __name__ == "__main__":
    print(json.dumps(ecosystem["counts"], indent=2))
