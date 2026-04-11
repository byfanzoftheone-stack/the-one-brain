"""
Run Crew Heartbeat — updates crew status and ecosystem state.
Run this on a schedule (cron) or manually to keep state fresh.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from runtime.crew_heartbeat import main as heartbeat_main

def main():
    heartbeat_main()

    # Also update ecosystem map
    try:
        from scanners.generate_ecosystem_map import ecosystem
        out = ROOT / "source-of-truth/ecosystem_map.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(ecosystem, indent=2))
        print("ecosystem map updated")
    except Exception as e:
        print(f"ecosystem map skipped: {e}")

    # Also run diagnostics
    try:
        from diagnostics.system_validator import validate
        report = validate()
        print(f"diagnostics: {report['summary']['health']} ({report['summary']['passed']}/{report['summary']['total_checks']} checks)")
    except Exception as e:
        print(f"diagnostics skipped: {e}")

    print("heartbeat complete")

if __name__ == "__main__":
    main()
