"""Cleanup utilities — removes temp files and empties outdated data."""
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def clean_pycache(base: Path = ROOT) -> list:
    removed = []
    for d in base.rglob("__pycache__"):
        try:
            shutil.rmtree(d)
            removed.append(str(d))
        except Exception:
            pass
    return removed

def clean_pyc(base: Path = ROOT) -> list:
    removed = []
    for f in base.rglob("*.pyc"):
        try:
            f.unlink()
            removed.append(str(f))
        except Exception:
            pass
    return removed

def clean_all(base: Path = ROOT) -> dict:
    return {"pycache": clean_pycache(base), "pyc": clean_pyc(base)}
