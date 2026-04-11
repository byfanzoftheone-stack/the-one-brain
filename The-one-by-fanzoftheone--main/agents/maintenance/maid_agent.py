"""
Maid Agent — cleans up the ecosystem on a schedule.
Delegates to the backend maid_service for the actual scan and clean.
"""
import json, sys, os
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

def run(dry_run: bool = True) -> dict:
    try:
        sys.path.insert(0, os.path.join(str(Path(__file__).resolve().parents[2]), "backend"))
        from backend.services.maid_service import run_maid_scan, clean_empty_dirs
        scan   = run_maid_scan()
        clean  = clean_empty_dirs(dry_run=dry_run)
        return {"status": "ok", "scan": scan["summary"], "clean": clean}
    except ImportError:
        # Standalone mode — do the scan ourselves
        from workers.cleanup_worker import run as cleanup_run
        return cleanup_run()

if __name__ == "__main__":
    print(json.dumps(run(dry_run=True), indent=2))
