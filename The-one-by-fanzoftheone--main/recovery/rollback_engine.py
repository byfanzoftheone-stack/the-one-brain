"""
Rollback Engine — snapshots and restores warehouse state.
Takes JSON snapshots of key state files before risky operations.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone

ROOT          = Path(__file__).resolve().parents[1]
SNAPSHOTS_DIR = ROOT / "warehouse/snapshots"
SNAPSHOTS_DIR.mkdir(parents=True, exist_ok=True)

SNAPSHOT_TARGETS = [
    ROOT / "state/crew_status.json",
    ROOT / "state/current_state.json",
    ROOT / "warehouse/registry.json",
    ROOT / "source-of-truth/ecosystem_map.json",
]

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _ts() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")

def create_snapshot(label: str = "manual") -> dict:
    ts       = _ts()
    snap_dir = SNAPSHOTS_DIR / f"{ts}-{label}"
    snap_dir.mkdir(parents=True, exist_ok=True)

    saved = []
    for target in SNAPSHOT_TARGETS:
        if target.exists():
            dest = snap_dir / target.name
            shutil.copy2(target, dest)
            saved.append({"file": target.name, "size": target.stat().st_size})

    manifest = {"label": label, "timestamp": _now(), "files": saved}
    (snap_dir / "_manifest.json").write_text(json.dumps(manifest, indent=2))

    return {"status": "snapshot_created", "snapshot": str(snap_dir), "files_saved": len(saved)}


def list_snapshots() -> list:
    return sorted(
        [{"path": str(d), "name": d.name, "files": len(list(d.glob("*.json"))) - 1}
         for d in SNAPSHOTS_DIR.iterdir() if d.is_dir()],
        key=lambda x: x["name"], reverse=True
    )


def rollback(snapshot_name: str) -> dict:
    snap_dir = SNAPSHOTS_DIR / snapshot_name
    if not snap_dir.exists():
        return {"status": "not_found", "snapshot": snapshot_name}

    restored = []
    for src in snap_dir.glob("*.json"):
        if src.name.startswith("_"):
            continue
        for target in SNAPSHOT_TARGETS:
            if target.name == src.name:
                shutil.copy2(src, target)
                restored.append(target.name)

    return {"status": "rolled_back", "snapshot": snapshot_name, "restored": restored}


if __name__ == "__main__":
    snap = create_snapshot("test")
    print(json.dumps(snap, indent=2))
    print(json.dumps(list_snapshots(), indent=2))
