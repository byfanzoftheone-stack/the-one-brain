import requests

ECOSYSTEM_BASE = "http://127.0.0.1:8090"

def ecosystem_status():
    r = requests.get(f"{ECOSYSTEM_BASE}/status", timeout=10)
    r.raise_for_status()
    return r.json()

def ecosystem_memory():
    r = requests.get(f"{ECOSYSTEM_BASE}/memory", timeout=10)
    r.raise_for_status()
    return r.json()

def ecosystem_run(goal):
    r = requests.post(
        f"{ECOSYSTEM_BASE}/run",
        json={"goal": goal},
        timeout=20
    )
    r.raise_for_status()
    return r.json()
