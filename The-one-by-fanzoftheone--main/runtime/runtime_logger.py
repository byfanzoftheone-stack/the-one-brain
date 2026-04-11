from pathlib import Path
from datetime import datetime, timezone
import json

LOG_DIR = Path("warehouse/runtime")
LOG_DIR.mkdir(parents=True, exist_ok=True)

def _safe(value):
    try:
        json.dumps(value)
        return value
    except TypeError:
        if callable(value):
            return getattr(value, "__name__", str(value))
        if isinstance(value, dict):
            return {str(k): _safe(v) for k, v in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [_safe(v) for v in value]
        return str(value)

def log(event, data):
    payload = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        "data": _safe(data),
    }
    path = LOG_DIR / f"{event}.json"
    path.write_text(json.dumps(payload, indent=2))
