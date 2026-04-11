import os
import json
from datetime import datetime, UTC

APPS_DIR = "apps"
LISTINGS_DIR = "marketplace/listings"

def build_listing(app_name, modules):
    return {
        "app": app_name,
        "title": app_name.replace("-", " ").title(),
        "status": "draft",
        "modules": modules,
        "created_at": datetime.now(UTC).isoformat(),
        "pricing": {
            "monthly": None,
            "setup_fee": None
        }
    }

def sync_marketplace():
    os.makedirs(LISTINGS_DIR, exist_ok=True)
    created = []
    for app in sorted(os.listdir(APPS_DIR)):
        app_path = os.path.join(APPS_DIR, app)
        manifest_path = os.path.join(app_path, "modules.json")
        if os.path.isdir(app_path) and os.path.exists(manifest_path):
            with open(manifest_path) as f:
                data = json.load(f)
            listing = build_listing(data["name"], data.get("modules", []))
            with open(os.path.join(LISTINGS_DIR, f"{app}.json"), "w") as f:
                json.dump(listing, f, indent=2)
            created.append(app)
    print(json.dumps({"marketplace_synced": created}, indent=2))

if __name__ == "__main__":
    sync_marketplace()
