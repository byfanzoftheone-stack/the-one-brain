import json
from pathlib import Path
from agents.builder.builder_agent import run as builder_run


def build_from_recipe(recipe_path: str) -> dict:
    recipe = json.loads(Path(recipe_path).read_text())
    return builder_run(recipe)


def build_approved(limit: int = 3) -> list[dict]:
    approved = Path('opportunities/approved')
    recipes = Path('recipes')
    results = []
    if not approved.exists():
        return results
    for item in sorted(approved.glob('*.json'))[:limit]:
        data = json.loads(item.read_text())
        base_name = data['idea'].replace(' ', '-').lower()
        recipe = {
            'name': base_name,
            'modules': ['crm', 'scheduling', 'payments', 'analytics'] if any(k in base_name for k in ['roof', 'dispatch', 'pool']) else ['content-agent', 'email-agent'],
        }
        recipe_path = recipes / f'{base_name}.json'
        recipe_path.write_text(json.dumps(recipe, indent=2))
        results.append(build_from_recipe(str(recipe_path)))
    return results


if __name__ == '__main__':
    print(build_approved())
