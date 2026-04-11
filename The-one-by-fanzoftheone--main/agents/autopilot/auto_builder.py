"""Auto Builder — builds apps from high-score opportunities automatically."""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]

def _now(): return datetime.now(timezone.utc).isoformat()

def build_next(limit: int = 3) -> list:
    """Build the top N approved opportunities."""
    from opportunities.opportunity_engine import collect
    from opportunities.opportunity_ranker  import rank
    from agents.builder.builder_agent      import run as builder_run

    approved = [o for o in rank(collect()) if o.get("score", 0) >= 70][:limit]
    results  = []

    for opp in approved:
        slug   = (opp.get("idea") or opp.get("name") or "app").replace(" ", "-").lower()[:30]
        recipe = {"name": slug, "modules": ["crm", "analytics", "payments", "scheduling"], "description": opp.get("idea", "")}
        try:
            result = builder_run(recipe)
            results.append({"opp": slug, "result": result, "status": "built"})
        except Exception as e:
            results.append({"opp": slug, "error": str(e), "status": "error"})

    return results

if __name__ == "__main__":
    print(json.dumps(build_next(2), indent=2))
