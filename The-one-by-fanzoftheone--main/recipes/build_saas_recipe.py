"""
Build SaaS Recipe — generates a full SaaS app recipe from a niche description.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

NICHE_MODULE_MAP = {
    "service":     ["crm", "scheduling", "invoices", "payments", "analytics"],
    "construction":["crm", "scheduling", "invoices", "payments", "materials", "permits"],
    "community":   ["messaging", "notifications", "content", "analytics", "companion"],
    "coaching":    ["scheduling", "messaging", "analytics", "companion", "payments"],
    "fitness":     ["scheduling", "analytics", "messaging", "payments"],
    "content":     ["content-agent", "email-agent", "analytics", "seo-agent"],
    "ecommerce":   ["crm", "payments", "analytics", "email-agent", "inventory"],
    "default":     ["crm", "analytics", "messaging", "payments"],
}

def build_recipe(name: str, niche: str = "default", price: int = 99, description: str = "") -> dict:
    niche_key = next((k for k in NICHE_MODULE_MAP if k in niche.lower()), "default")
    modules   = NICHE_MODULE_MAP[niche_key]

    recipe = {
        "name":        name,
        "niche":       niche,
        "stack":       "next-fastapi",
        "modules":     modules,
        "price":       price,
        "description": description or f"{name.replace('-', ' ').title()} — {niche} SaaS",
        "created_at":  _now(),
    }

    out = ROOT / "recipes" / f"{name}.json"
    out.write_text(json.dumps(recipe, indent=2))
    return recipe

def get_all_recipes() -> list:
    recipes_dir = ROOT / "recipes"
    out = []
    for f in sorted(recipes_dir.glob("*.json")):
        try:
            out.append(json.loads(f.read_text()))
        except Exception:
            pass
    return out

if __name__ == "__main__":
    r = build_recipe("test-saas", "service", 99, "Test service SaaS")
    print(json.dumps(r, indent=2))
