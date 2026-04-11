import json
from pathlib import Path
from datetime import datetime, UTC


def create_listing(app_name: str, description: str, price_monthly: int = 99) -> str:
    listings = Path('marketplace/listings')
    pricing = Path('marketplace/pricing')
    listings.mkdir(parents=True, exist_ok=True)
    pricing.mkdir(parents=True, exist_ok=True)

    (pricing / f'{app_name}.json').write_text(json.dumps({
        'name': app_name,
        'monthly_price': price_monthly,
        'setup_fee': 299,
        'currency': 'USD',
        'created_at': datetime.now(UTC).isoformat()
    }, indent=2))

    (listings / f'{app_name}.json').write_text(json.dumps({
        'name': app_name,
        'title': app_name.replace('-', ' ').title(),
        'description': description,
        'category': 'saas',
        'status': 'draft',
        'pricing_file': f'marketplace/pricing/{app_name}.json',
        'created_at': datetime.now(UTC).isoformat(),
    }, indent=2))
    return app_name

def list_listings() -> list:
    listings_dir = Path('marketplace/listings')
    if not listings_dir.exists():
        return []
    out = []
    for f in sorted(listings_dir.glob("*.json")):
        try:
            out.append(json.loads(f.read_text()))
        except Exception:
            pass
    return out

def get_listing(app_name: str) -> dict:
    path = Path('marketplace/listings') / f"{app_name}.json"
    if path.exists():
        return json.loads(path.read_text())
    return {}
