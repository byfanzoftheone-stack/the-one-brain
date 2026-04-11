"""
Cleanup Worker — removes temp files, empty dirs, old logs, and zip artifacts.
Safe to run at any time. Logs everything it removes.
"""
import json
import shutil
from pathlib import Path
from datetime import datetime, timezone

ROOT    = Path(__file__).resolve().parents[1]
LOG_DIR = ROOT / "warehouse/cleanup"
LOG_DIR.mkdir(parents=True, exist_ok=True)

CLEAN_PATTERNS = ["*.tmp", "*.bak", "*.pyc", "__pycache__"]
SCAN_DIRS      = ["apps", "modules", "agents", "warehouse", "recipes"]

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _safe_remove(path: Path, report: dict):
    try:
        if path.is_dir():
            shutil.rmtree(path)
            report["removed_dirs"].append(str(path))
        else:
            path.unlink()
            report["removed_files"].append(str(path))
    except Exception as e:
        report["errors"].append({"path": str(path), "error": str(e)})

def clean_temp_files() -> dict:
    report = {"removed_files": [], "removed_dirs": [], "errors": [], "timestamp": _now()}
    for scan in SCAN_DIRS:
        scan_path = ROOT / scan
        if not scan_path.exists():
            continue
        for pattern in CLEAN_PATTERNS:
            for match in scan_path.rglob(pattern):
                _safe_remove(match, report)
    return report

def clean_empty_dirs() -> dict:
    report = {"removed_dirs": [], "errors": [], "timestamp": _now()}
    for scan in SCAN_DIRS:
        scan_path = ROOT / scan
        if not scan_path.exists():
            continue
        for d in sorted(scan_path.rglob("*"), reverse=True):
            if d.is_dir() and not any(d.iterdir()):
                try:
                    d.rmdir()
                    report["removed_dirs"].append(str(d))
                except Exception as e:
                    report["errors"].append(str(e))
    return report

def clean_old_logs(keep_days: int = 30) -> dict:
    """Remove log files older than keep_days from warehouse/runtime."""
    import time
    report     = {"removed": [], "errors": [], "timestamp": _now()}
    log_dir    = ROOT / "warehouse/runtime"
    cutoff     = time.time() - (keep_days * 86400)
    if log_dir.exists():
        for f in log_dir.glob("*.json"):
            if f.stat().st_mtime < cutoff:
                try:
                    f.unlink()
                    report["removed"].append(f.name)
                except Exception as e:
                    report["errors"].append(str(e))
    return report

def run() -> dict:
    temp_report  = clean_temp_files()
    dirs_report  = clean_empty_dirs()
    logs_report  = clean_old_logs()
    result = {
        "timestamp": _now(),
        "temp_files":  temp_report,
        "empty_dirs":  dirs_report,
        "old_logs":    logs_report,
        "summary": {
            "files_removed": len(temp_report["removed_files"]) + len(logs_report["removed"]),
            "dirs_removed":  len(temp_report["removed_dirs"]) + len(dirs_report["removed_dirs"]),
            "errors":        len(temp_report["errors"]) + len(dirs_report["errors"]),
        }
    }
    (LOG_DIR / "latest.json").write_text(json.dumps(result, indent=2))
    return result

if __name__ == "__main__":
    print(json.dumps(run()["summary"], indent=2))
