"""
THE ONE Companion Engine — Growth partner layer.
Handles reflection sessions, memory storage, pattern detection,
and daily direction guidance.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

MEMORY_DIR = Path("warehouse/companion")
MEMORY_DIR.mkdir(parents=True, exist_ok=True)

MEMORY_FILE   = MEMORY_DIR / "memory.json"
PATTERNS_FILE = MEMORY_DIR / "patterns.json"
SESSIONS_FILE = MEMORY_DIR / "sessions.json"

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _read(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default if default is not None else {}

def _write(path: Path, data):
    path.write_text(json.dumps(data, indent=2))

# ── Memory ──────────────────────────────────────────────────────────────
def save_memory(key: str, value: str) -> dict:
    mem = _read(MEMORY_FILE, {})
    mem[key] = {"value": value, "saved_at": _now()}
    _write(MEMORY_FILE, mem)
    return {"status": "saved", "key": key}

def get_memory(key: str = None) -> dict:
    mem = _read(MEMORY_FILE, {})
    return mem.get(key) if key else mem

# ── Reflection ───────────────────────────────────────────────────────────
def record_reflection(text: str) -> dict:
    sessions = _read(SESSIONS_FILE, [])
    entry = {"id": len(sessions) + 1, "text": text, "timestamp": _now(), "type": "reflection"}
    sessions.append(entry)
    _write(SESSIONS_FILE, sessions)
    return {"status": "recorded", "session_id": entry["id"]}

def get_reflections(limit: int = 10) -> list:
    sessions = _read(SESSIONS_FILE, [])
    reflections = [s for s in sessions if s.get("type") == "reflection"]
    return reflections[-limit:]

# ── Pattern Detection ────────────────────────────────────────────────────
def detect_patterns() -> dict:
    sessions = _read(SESSIONS_FILE, [])
    if not sessions:
        return {"patterns": [], "count": 0}

    word_freq: dict[str, int] = {}
    for s in sessions:
        for word in s.get("text", "").lower().split():
            if len(word) > 4:
                word_freq[word] = word_freq.get(word, 0) + 1

    top = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    patterns = [{"word": w, "frequency": f} for w, f in top]
    _write(PATTERNS_FILE, {"patterns": patterns, "updated_at": _now()})
    return {"patterns": patterns, "count": len(sessions)}

# ── Daily Direction ───────────────────────────────────────────────────────
def get_daily_direction() -> dict:
    mem      = _read(MEMORY_FILE, {})
    sessions = _read(SESSIONS_FILE, [])
    recent   = sessions[-3:] if sessions else []

    focus_areas = list(mem.keys())[:3] if mem else ["building", "growth", "systems"]

    return {
        "date": _now()[:10],
        "focus": focus_areas,
        "recent_sessions": len(sessions),
        "mode": "active" if sessions else "starting",
        "guidance": [
            "Stay close to the revenue engine today.",
            "One module shipped beats three planned.",
            "Check the warehouse — your patterns tell the story.",
        ],
        "recent_reflections": [s.get("text", "")[:80] for s in recent],
    }

# ── Full State ────────────────────────────────────────────────────────────
def get_state() -> dict:
    return {
        "id": "companion",
        "name": "The One Companion",
        "purpose": "growth partner",
        "status": "active",
        "modes": ["reflection", "guidance", "planning", "memory", "pattern-detection"],
        "memory_keys": list(_read(MEMORY_FILE, {}).keys()),
        "session_count": len(_read(SESSIONS_FILE, [])),
        "patterns": _read(PATTERNS_FILE, {}).get("patterns", []),
        "daily_direction": get_daily_direction(),
        "notes": [
            "revenue engine funds growth engine",
            "companion is first-class, not buried",
            "no drift",
        ],
    }

if __name__ == "__main__":
    record_reflection("Built the companion engine today. Feeling clear.")
    save_memory("focus", "ship THE ONE ecosystem")
    print(json.dumps(get_state(), indent=2))
