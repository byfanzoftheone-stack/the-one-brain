"""
Opportunity Engine — collects and structures raw opportunity signals.
Pulls from signals/, customer-requests, trends, and competitor data.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]

def _now(): return datetime.now(timezone.utc).isoformat()

def collect() -> list:
    """Collect all opportunities from inbound signals and known apps."""
    opportunities = []

    # From inbound folder
    inbound = ROOT / "opportunities/inbound"
    if inbound.exists():
        for f in sorted(inbound.glob("*.json")):
            try:
                data = json.loads(f.read_text())
                data.setdefault("source", "inbound")
                data.setdefault("slug",   f.stem)
                opportunities.append(data)
            except Exception:
                pass

    # From signals
    signals_dir = ROOT / "signals"
    if signals_dir.exists():
        for sub in signals_dir.iterdir():
            if sub.is_dir():
                for f in sub.glob("*.json"):
                    try:
                        data = json.loads(f.read_text())
                        data.setdefault("source",   sub.name)
                        data.setdefault("slug",     f.stem)
                        # Convert to opportunity format
                        if "idea" not in data:
                            data["idea"] = data.get("title") or data.get("name") or f.stem
                        opportunities.append(data)
                    except Exception:
                        pass

    return opportunities

def save_opportunity(name: str, idea: str, source: str = "manual", notes: str = "") -> dict:
    """Save a new opportunity to inbound."""
    opp = {
        "name":       name,
        "idea":       idea,
        "source":     source,
        "notes":      notes,
        "created_at": _now(),
    }
    out = ROOT / "opportunities/inbound"
    out.mkdir(parents=True, exist_ok=True)
    (out / f"{name}.json").write_text(json.dumps(opp, indent=2))
    return {"status": "saved", "opportunity": opp}

if __name__ == "__main__":
    opps = collect()
    print(f"Collected {len(opps)} opportunities")
    print(json.dumps([o.get("idea") or o.get("name") for o in opps], indent=2))
