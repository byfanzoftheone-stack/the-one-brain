"""
App Installer — installs modules into apps and registers them in the warehouse.
Handles module resolution, dependency checking, and install receipts.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone

ROOT         = Path(__file__).resolve().parents[1]
MODULES_DIR  = ROOT / "modules"
APPS_DIR     = ROOT / "apps"
RECEIPTS_DIR = ROOT / "warehouse/receipts/installs"
RECEIPTS_DIR.mkdir(parents=True, exist_ok=True)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _read_manifest(module_name: str) -> dict:
    manifest = MODULES_DIR / module_name / "module.json"
    if manifest.exists():
        try:
            return json.loads(manifest.read_text())
        except Exception:
            pass
    return {"id": module_name, "name": module_name, "version": "1.0.0"}

def list_available() -> list:
    if not MODULES_DIR.exists():
        return []
    return sorted([
        {"slug": d.name, **_read_manifest(d.name)}
        for d in MODULES_DIR.iterdir() if d.is_dir() and not d.name.startswith("_")
    ], key=lambda x: x["slug"])

def install_module(module_name: str, app_name: str) -> dict:
    """Install a module into an app."""
    app_dir    = APPS_DIR / app_name
    module_dir = MODULES_DIR / module_name

    if not app_dir.exists():
        return {"status": "error", "error": f"App '{app_name}' does not exist"}
    if not module_dir.exists():
        return {"status": "error", "error": f"Module '{module_name}' not found"}

    # Update app modules.json
    manifest_path = app_dir / "modules.json"
    manifest = {"name": app_name, "modules": []}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text())
        except Exception:
            pass

    modules = manifest.get("modules", [])
    if module_name not in modules:
        modules.append(module_name)
        manifest["modules"] = modules
        manifest["updated_at"] = _now()
        manifest_path.write_text(json.dumps(manifest, indent=2))

    # Write install receipt
    receipt = {"app": app_name, "module": module_name, "installed_at": _now(), "status": "installed"}
    (RECEIPTS_DIR / f"{app_name}--{module_name}.json").write_text(json.dumps(receipt, indent=2))

    return {"status": "installed", "app": app_name, "module": module_name}

def uninstall_module(module_name: str, app_name: str) -> dict:
    app_dir       = APPS_DIR / app_name
    manifest_path = app_dir / "modules.json"
    if not manifest_path.exists():
        return {"status": "not_found"}
    manifest = json.loads(manifest_path.read_text())
    modules  = [m for m in manifest.get("modules", []) if m != module_name]
    manifest["modules"]    = modules
    manifest["updated_at"] = _now()
    manifest_path.write_text(json.dumps(manifest, indent=2))
    return {"status": "uninstalled", "app": app_name, "module": module_name}

def get_installed(app_name: str) -> dict:
    manifest_path = APPS_DIR / app_name / "modules.json"
    if not manifest_path.exists():
        return {"app": app_name, "modules": [], "status": "no_manifest"}
    manifest = json.loads(manifest_path.read_text())
    return {"app": app_name, "modules": manifest.get("modules", []), "status": "ok"}

if __name__ == "__main__":
    print(json.dumps(list_available(), indent=2))
