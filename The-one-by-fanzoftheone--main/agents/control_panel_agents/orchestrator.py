import os
import sys

sys.path.insert(0, os.path.expanduser("~/ai-node"))

from tools.registry import run
import tools.load_tools

def execute(task):
    t = task.strip()

    if t.startswith("shell:"):
        return run("shell", t.replace("shell:", "", 1).strip())

    if t.startswith("fs:"):
        return run("filesystem", t.replace("fs:", "", 1).strip())

    if t.startswith("api:"):
        return run("api", t.replace("api:", "", 1).strip())

    low = t.lower()
    if "battery" in low:
        return run("phone", "battery")
    if "clipboard" in low:
        return run("phone", "clipboard")
    if "folder" in low or "file" in low or "directory" in low:
        return run("filesystem", "list")

    return run("shell", t)

def run_plan(goal):
    return [{"task": goal, "result": execute(goal)[:4000]}]
