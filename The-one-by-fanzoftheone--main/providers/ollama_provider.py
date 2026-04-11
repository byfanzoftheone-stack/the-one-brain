"""
Ollama (local) provider for THE ONE runtime.
Connects to OLLAMA_HOST (default localhost:11434). Model via OLLAMA_MODEL.
"""
import os
import json
import urllib.request
from datetime import datetime, timezone

OLLAMA_HOST  = os.getenv("OLLAMA_HOST",  "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

def _log(event: str, data: dict):
    from pathlib import Path
    path = Path("warehouse/runtime/ollama_provider.json")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"timestamp": datetime.now(timezone.utc).isoformat(), "event": event, "data": data}, indent=2))

def run(task: dict, payload: dict) -> dict:
    prompt = task.get("prompt") or task.get("goal") or str(task)
    try:
        body = json.dumps({"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}).encode()
        req  = urllib.request.Request(
            f"{OLLAMA_HOST}/api/generate", data=body,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            text   = result.get("response", "")
            _log("run", {"task": task, "status": "ok"})
            return {"status": "ok", "provider": "ollama", "response": text, "task": task}
    except Exception as e:
        _log("run", {"task": task, "status": "error", "error": str(e)})
        return {"status": "error", "provider": "ollama", "error": str(e), "task": task}
