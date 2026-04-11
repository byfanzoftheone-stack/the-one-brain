import os
import json
import time

MEMORY_FILE = "warehouse/history.jsonl"

def save_memory(goal, steps, results):
    os.makedirs("warehouse", exist_ok=True)
    row = {
        "time": time.time(),
        "goal": goal,
        "steps": steps,
        "results": results
    }
    with open(MEMORY_FILE, "a") as f:
        f.write(json.dumps(row) + "\n")

def read_memory(limit=20):
    if not os.path.exists(MEMORY_FILE):
        return []
    rows = []
    with open(MEMORY_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows[-limit:]
