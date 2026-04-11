import json
from pathlib import Path
from datetime import datetime, timezone

STATE_PATH = Path("state/crew_status.json")
STATE_PATH.parent.mkdir(parents=True, exist_ok=True)

def generate_status():
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "human": {
            "title": "The One",
            "focus": "growth and building",
            "mode": "active"
        },
        "control_room": {
            "status": "online",
            "message": "crew standing by"
        },
        "crew": [
            {"name": "planner", "status": "ready", "task": "shape next move"},
            {"name": "builder", "status": "ready", "task": "assemble working systems"},
            {"name": "auditor", "status": "ready", "task": "verify truth"},
            {"name": "strategist", "status": "ready", "task": "protect direction"},
            {"name": "marketplace", "status": "idle", "task": "prepare future monetization"}
        ],
        "backpack": {
            "status": "available",
            "saved_patterns": 3,
            "last_saved": "validated module shell"
        },
        "system": {
            "apps": "registered",
            "modules": "registered",
            "runtime": "alive",
            "providers": "local-first",
            "philosophy": "crew protects the human"
        }
    }

def main():
    data = generate_status()
    STATE_PATH.write_text(json.dumps(data, indent=2))
    print("crew heartbeat updated")
    print(STATE_PATH)

if __name__ == "__main__":
    main()
