"""
Approval Engine — manages the human-in-the-loop approval pipeline.
Anything that requires Travis's sign-off before executing goes here.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

ROOT           = Path(__file__).resolve().parents[1]
APPROVALS_DIR  = ROOT / "approvals"
QUEUE_FILE     = APPROVALS_DIR / "queue.json"
HISTORY_FILE   = APPROVALS_DIR / "history.json"
APPROVALS_DIR.mkdir(parents=True, exist_ok=True)

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()

def _read(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default if default is not None else []

def _write(path: Path, data):
    path.write_text(json.dumps(data, indent=2))


def request_approval(action: str, payload: dict, requester: str = "system") -> dict:
    """Queue an action for human approval."""
    queue = _read(QUEUE_FILE, [])
    item  = {
        "id": len(queue) + 1,
        "action": action,
        "payload": payload,
        "requester": requester,
        "status": "pending",
        "requested_at": _now(),
    }
    queue.append(item)
    _write(QUEUE_FILE, queue)
    return {"status": "queued", "approval_id": item["id"], "action": action}


def approve(approval_id: int, approver: str = "human") -> dict:
    """Approve a queued action."""
    queue = _read(QUEUE_FILE, [])
    for item in queue:
        if item["id"] == approval_id and item["status"] == "pending":
            item["status"]      = "approved"
            item["approved_by"] = approver
            item["approved_at"] = _now()
            _write(QUEUE_FILE, queue)
            _archive(item)
            return {"status": "approved", "item": item}
    return {"status": "not_found", "approval_id": approval_id}


def reject(approval_id: int, reason: str = "", approver: str = "human") -> dict:
    """Reject a queued action."""
    queue = _read(QUEUE_FILE, [])
    for item in queue:
        if item["id"] == approval_id and item["status"] == "pending":
            item["status"]      = "rejected"
            item["rejected_by"] = approver
            item["reason"]      = reason
            item["rejected_at"] = _now()
            _write(QUEUE_FILE, queue)
            _archive(item)
            return {"status": "rejected", "item": item}
    return {"status": "not_found", "approval_id": approval_id}


def _archive(item: dict):
    history = _read(HISTORY_FILE, [])
    history.append(item)
    _write(HISTORY_FILE, history)


def get_pending() -> list:
    queue = _read(QUEUE_FILE, [])
    return [i for i in queue if i["status"] == "pending"]


def get_queue() -> dict:
    queue   = _read(QUEUE_FILE, [])
    pending = [i for i in queue if i["status"] == "pending"]
    return {"total": len(queue), "pending": len(pending), "items": queue[-20:]}


if __name__ == "__main__":
    r = request_approval("deploy_app", {"app": "construction-ops", "env": "production"})
    print(json.dumps(r, indent=2))
    print(json.dumps(get_pending(), indent=2))
