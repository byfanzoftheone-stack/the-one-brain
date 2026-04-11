import os
import sys
import json

sys.path.insert(0, os.path.expanduser("~/ai-node"))
sys.path.insert(0, os.path.expanduser("~/ai-node/agents"))

from orchestrator import execute
from config.warehouse import WAREHOUSE

MEMORY_FILE = WAREHOUSE["memory_file"]

def load_history():
    if not os.path.exists(MEMORY_FILE):
        return []
    with open(MEMORY_FILE, "r") as f:
        return json.load(f)

def save_history(history):
    with open(MEMORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def run(goal):
    history = load_history()
    history.append({"goal": goal})
    save_history(history)
    execute(goal)

if __name__ == "__main__":
    goal = " ".join(sys.argv[1:])
    run(goal)
