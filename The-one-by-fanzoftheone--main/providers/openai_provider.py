"""
OpenAI (ChatGPT) provider for THE ONE runtime.
Uses OPENAI_API_KEY env var.
"""
import os
import json
from datetime import datetime, timezone

def _log(event: str, data: dict):
    from pathlib import Path
    path = Path("warehouse/runtime/openai_provider.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"timestamp": datetime.now(timezone.utc).isoformat(), "event": event, "data": data}, indent=2))

def run(task: dict, payload: dict) -> dict:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return {"status": "error", "provider": "openai", "error": "OPENAI_API_KEY not set", "task": task}

    try:
        import urllib.request
        prompt = task.get("prompt") or task.get("goal") or str(task)
        body = json.dumps({
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 1024
        }).encode()
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            text = result["choices"][0]["message"]["content"] if result.get("choices") else ""
            _log("run", {"task": task, "status": "ok"})
            return {"status": "ok", "provider": "openai", "response": text, "task": task}
    except Exception as e:
        _log("run", {"task": task, "status": "error", "error": str(e)})
        return {"status": "error", "provider": "openai", "error": str(e), "task": task}
