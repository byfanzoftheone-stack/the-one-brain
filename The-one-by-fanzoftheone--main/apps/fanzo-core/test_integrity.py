"""
Iron Core Integrity Test
Run: python test_integrity.py
Verifies the service is alive and rejecting bad data.
"""
import urllib.request
import json

BASE = "http://localhost:8000"

def test(name, url, method="GET", body=None, expect_status=200):
    data = json.dumps(body).encode() if body else None
    req  = urllib.request.Request(url, data=data, method=method,
                                   headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            actual = r.status
    except urllib.error.HTTPError as e:
        actual = e.code

    ok = actual == expect_status
    print(f"{'✓' if ok else '✗'} [{actual}] {name}")
    return ok

print("=== IRON CORE INTEGRITY TESTS ===")
test("Health check",          f"{BASE}/health")
test("Good data accepted",    f"{BASE}/execute", "POST",
     {"task_id": "TASK-001", "priority": 3, "command": "PROCESS"}, 200)
test("Bad priority rejected", f"{BASE}/execute", "POST",
     {"task_id": "TASK-002", "priority": 10, "command": "PROCESS"}, 422)
test("Short task_id rejected",f"{BASE}/execute", "POST",
     {"task_id": "X", "priority": 1, "command": "PROCESS"}, 422)
test("Crash handled cleanly", f"{BASE}/execute", "POST",
     {"task_id": "TASK-003", "priority": 5, "command": "CRASH_TEST"}, 400)
print("=================================")
