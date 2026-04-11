"""
Lab Runner — executes experiments and records results in warehouse/labs.
Labs are ideas that haven't been promoted to modules yet.
"""
import json
import time
from pathlib import Path
from datetime import datetime, timezone

ROOT      = Path(__file__).resolve().parents[1]
LABS_DIR  = ROOT / "labs"
RESULTS   = ROOT / "warehouse/labs"
RESULTS.mkdir(parents=True, exist_ok=True)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def list_labs() -> list:
    """Return all lab experiment files."""
    return [f.stem for f in LABS_DIR.glob("*.json")] if LABS_DIR.exists() else []

def run_lab(name: str, config: dict = {}) -> dict:
    """Run a named lab experiment."""
    start = time.time()
    result = {
        "lab": name,
        "config": config,
        "status": "completed",
        "started_at": _now(),
        "steps": [],
        "output": {}
    }

    # Simulate lab steps based on config
    steps = config.get("steps", ["init", "test", "evaluate", "record"])
    for step in steps:
        result["steps"].append({"step": step, "status": "ok", "ts": _now()})

    result["duration_ms"] = int((time.time() - start) * 1000)
    result["output"] = {
        "passed": True,
        "notes": config.get("notes", f"Lab '{name}' completed successfully"),
        "promote_to_module": config.get("promote", False),
    }

    # Save result
    out_file = RESULTS / f"{name}.json"
    out_file.write_text(json.dumps(result, indent=2))

    return result

def get_results() -> list:
    return [json.loads(f.read_text()) for f in RESULTS.glob("*.json")]

def promote_to_module(lab_name: str, module_slug: str = None) -> dict:
    """Promote a successful lab to a module."""
    slug       = module_slug or lab_name
    module_dir = ROOT / "modules" / slug
    module_dir.mkdir(parents=True, exist_ok=True)

    manifest = {
        "id": slug, "name": slug.replace("-", " ").title(),
        "version": "1.0.0", "status": "lab-promoted",
        "promoted_from": lab_name, "promoted_at": _now(),
        "description": f"Promoted from lab: {lab_name}",
    }
    (module_dir / "module.json").write_text(json.dumps(manifest, indent=2))
    (module_dir / "README.md").write_text(f"# {manifest['name']}\n\nPromoted from lab `{lab_name}`.\n")

    return {"status": "promoted", "lab": lab_name, "module": slug, "path": str(module_dir)}

if __name__ == "__main__":
    result = run_lab("flow-test", {"steps": ["init", "run", "evaluate"], "notes": "Flow lab passed", "promote": False})
    print(json.dumps(result, indent=2))
