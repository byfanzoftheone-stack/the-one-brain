from warehouse.memory import read_memory
import os

def run(input_text):
    text = input_text.strip()

    if text == "status":
        return {
            "node": "THE ONE",
            "agents": ["planner", "worker", "auditor", "coordinator", "warehouse"],
            "tools": ["shell", "filesystem", "phone", "api", "ecosystem"],
            "memory": "connected",
            "llama_reasoning": "fallback-ready",
            "ecosystem_bridge": "connected"
        }

    if text == "memory":
        return {"items": read_memory()}

    if text.startswith("run:"):
        goal = text.replace("run:", "", 1).strip()

        low = goal.lower()

        if "list" in low or "files" in low or "folder" in low:
            return os.listdir(".")

        if goal == "pwd" or "current folder" in low or "current directory" in low:
            return os.getcwd()

        return {"bridge_run_goal": goal, "status": "accepted"}

    return {
        "error": "unknown ecosystem action",
        "allowed": ["status", "memory", "run:<goal>"]
    }
