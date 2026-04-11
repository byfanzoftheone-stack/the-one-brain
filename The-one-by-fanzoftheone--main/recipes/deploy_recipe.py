"""
Deploy Recipe — executes a full deploy sequence from recipe to production.
Recipe → Forge → Validate → Publish → Receipt.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

def load_recipe(recipe_name: str) -> dict:
    """Load a recipe by name from the recipes directory."""
    path = ROOT / "recipes" / f"{recipe_name}.json"
    if not path.exists():
        raise FileNotFoundError(f"Recipe '{recipe_name}' not found at {path}")
    return json.loads(path.read_text())

def deploy_from_recipe(recipe: dict) -> dict:
    """Full deploy pipeline: forge → validate → publish."""
    name    = recipe.get("name", "unnamed")
    modules = recipe.get("modules", [])
    steps   = []
    errors  = []

    # Step 1: Forge the app
    try:
        from forge.forge_engine import forge_app
        result = forge_app(recipe)
        steps.append({"step": "forge", "status": result["status"], "app": name})
    except Exception as e:
        steps.append({"step": "forge", "status": "error", "error": str(e)})
        errors.append(str(e))

    # Step 2: Validate
    try:
        from tools.build_tools import validate_app
        validation = validate_app(name)
        steps.append({"step": "validate", "status": "ok" if validation["valid"] else "warn", "result": validation})
    except Exception as e:
        steps.append({"step": "validate", "status": "error", "error": str(e)})

    # Step 3: Create marketplace listing
    try:
        from tools.marketplace_tools import create_listing
        create_listing(name, recipe.get("description", f"{name} app"), recipe.get("price", 99))
        steps.append({"step": "list", "status": "ok"})
    except Exception as e:
        steps.append({"step": "list", "status": "error", "error": str(e)})

    # Write receipt
    receipt = {
        "recipe": name, "modules": modules, "steps": steps,
        "errors": errors, "status": "deployed" if not errors else "partial",
        "deployed_at": _now(),
    }
    out = ROOT / "warehouse/receipts/deploys"
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{name}.json").write_text(json.dumps(receipt, indent=2))

    return receipt

def deploy_by_name(recipe_name: str) -> dict:
    recipe = load_recipe(recipe_name)
    return deploy_from_recipe(recipe)

if __name__ == "__main__":
    import sys
    name = sys.argv[1] if len(sys.argv) > 1 else None
    if name:
        print(json.dumps(deploy_by_name(name), indent=2))
    else:
        print("Usage: python deploy_recipe.py <recipe_name>")
