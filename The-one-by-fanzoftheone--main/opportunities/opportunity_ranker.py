"""
Opportunity Ranker — scores opportunities based on market fit, urgency, and revenue potential.
Score >= 70 = recommended for build queue.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

HIGH_VALUE_KEYWORDS = {
    "saas": 15, "subscription": 15, "recurring": 15, "automation": 12,
    "service": 10, "construction": 10, "roofing": 10, "plumbing": 10,
    "fitness": 8, "coaching": 8, "community": 8,
    "content": 6, "marketing": 6, "seo": 6, "email": 6,
    "local": 10, "field": 8, "dispatch": 8,
}

def score_opportunity(opp: dict) -> int:
    score = 50  # Base score
    text  = (str(opp.get("idea", "")) + " " + str(opp.get("description", "")) + " " + str(opp.get("notes", ""))).lower()

    for keyword, points in HIGH_VALUE_KEYWORDS.items():
        if keyword in text:
            score += points

    # Bonus for existing data
    if opp.get("market_size"):   score += 5
    if opp.get("competitors"):   score += 3
    if opp.get("customer_need"): score += 7

    return min(score, 100)

def rank(opportunities: list) -> list:
    scored = []
    for opp in opportunities:
        opp["score"]       = score_opportunity(opp)
        opp["recommended"] = opp["score"] >= 70
        opp["ranked_at"]   = _now()
        scored.append(opp)
    return sorted(scored, key=lambda x: x["score"], reverse=True)

def get_top(limit: int = 5) -> list:
    from opportunities.opportunity_engine import collect
    ranked = rank(collect())
    return ranked[:limit]

if __name__ == "__main__":
    from opportunities.opportunity_engine import collect
    ranked = rank(collect())
    print(json.dumps([{"idea": r.get("idea"), "score": r["score"]} for r in ranked[:5]], indent=2))
