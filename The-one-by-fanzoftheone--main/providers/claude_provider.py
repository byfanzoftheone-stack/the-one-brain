"""
Claude (Anthropic) provider for THE ONE runtime.
Uses ANTHROPIC_API_KEY env var. Falls back gracefully if not set.
"""
import os
import json
from datetime import datetime, timezone

def _log(event: str, data: dict):
    from pathlib import Path
    path = Path("warehouse/runtime/claude_provider.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"timestamp": datetime.now(timezone.utc).isoformat(), "event": event, "data": data}, indent=2))

def run(task: dict, payload: dict) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if not api_key:
        return {"status": "error", "provider": "claude", "error": "ANTHROPIC_API_KEY not set", "task": task}

    try:
        import urllib.request
        prompt = task.get("prompt") or task.get("goal") or str(task)
        body = json.dumps({
            "model": "claude-sonnet-4-20250514",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}]
        }).encode()
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=body,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            text = result["content"][0]["text"] if result.get("content") else ""
            _log("run", {"task": task, "status": "ok"})
            return {"status": "ok", "provider": "claude", "response": text, "task": task}
    except Exception as e:
        _log("run", {"task": task, "status": "error", "error": str(e)})
        return {"status": "error", "provider": "claude", "error": str(e), "task": task}
