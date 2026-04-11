"""
Marketplace Recipe — builds and immediately lists an app on the marketplace.
"""
import json
from pathlib import Path
from recipes.build_saas_recipe import build_recipe
from recipes.deploy_recipe import deploy_from_recipe

ROOT = Path(__file__).resolve().parents[1]

def build_and_list(name: str, niche: str, price: int = 99, description: str = "") -> dict:
    recipe  = build_recipe(name, niche, price, description)
    receipt = deploy_from_recipe(recipe)
    return {"recipe": recipe, "deploy": receipt, "status": receipt.get("status")}

if __name__ == "__main__":
    result = build_and_list("demo-service", "construction", 99, "Demo construction SaaS")
    print(json.dumps(result, indent=2))
