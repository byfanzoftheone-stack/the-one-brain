import os
import json

LISTINGS_DIR = "marketplace/listings"
OUTPUT = "warehouse/revenue/revenue_rankings.json"

PRICING_HINTS = {
    "roofing": {"monthly": 149, "target_customers": 200},
    "construction": {"monthly": 129, "target_customers": 100},
    "dispatch": {"monthly": 129, "target_customers": 100},
    "pool": {"monthly": 99, "target_customers": 200},
    "marketing": {"monthly": 79, "target_customers": 150},
    "content": {"monthly": 59, "target_customers": 150},
    "productivity": {"monthly": 29, "target_customers": 200},
    "default": {"monthly": 49, "target_customers": 100}
}

def infer_industry(app_name: str) -> str:
    n = app_name.lower()
    if "roof" in n:
        return "roofing"
    if "construction" in n:
        return "construction"
    if "dispatch" in n:
        return "dispatch"
    if "pool" in n or "play-better" in n:
        return "pool"
    if "marketing" in n or "seo" in n or "email" in n:
        return "marketing"
    if "content" in n:
        return "content"
    if "productivity" in n:
        return "productivity"
    return "default"

def rank():
    os.makedirs("warehouse/revenue", exist_ok=True)
    results = []
    if os.path.exists(LISTINGS_DIR):
        for file in sorted(os.listdir(LISTINGS_DIR)):
            if not file.endswith(".json"):
                continue
            with open(os.path.join(LISTINGS_DIR, file)) as f:
                data = json.load(f)
            app = data["app"]
            industry = infer_industry(app)
            hint = PRICING_HINTS.get(industry, PRICING_HINTS["default"])
            mrr = hint["monthly"] * hint["target_customers"]
            result = {
                "app": app,
                "industry": industry,
                "price_monthly": hint["monthly"],
                "target_customers": hint["target_customers"],
                "estimated_mrr": mrr,
                "priority_rank": 0
            }
            results.append(result)

    results.sort(key=lambda x: x["estimated_mrr"], reverse=True)
    for i, item in enumerate(results, start=1):
        item["priority_rank"] = i

    with open(OUTPUT, "w") as f:
        json.dump({"rankings": results}, f, indent=2)

    print(json.dumps({"rankings": results}, indent=2))

if __name__ == "__main__":
    rank()
