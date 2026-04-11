import json
from runtime.llama_client import ask_llama

SYSTEM_PROMPT = """
You are the planner for THE ONE agent node.

Available tools:
- fs:list -> list files in current working directory
- shell:pwd -> show current working directory
- phone:clipboard -> read clipboard
- api:https://api.ipify.org -> get public IP
- ecosystem:status -> get THE ONE node status
- ecosystem:memory -> get THE ONE node memory
- ecosystem:run:<goal> -> send a goal into THE ONE ecosystem
- shell:<command> -> run a shell command

Return ONLY valid JSON in this exact format:
{
  "steps": [
    {"agent":"worker","task":"..."}
  ]
}
"""

def fallback_plan(goal):
    goal = goal.strip()
    low = goal.lower()

    if goal.startswith("ecosystem:"):
        return [{"agent":"worker","task":goal}]

    if "ecosystem status" in low or "bridge status" in low:
        return [{"agent":"worker","task":"ecosystem:status"}]

    if "ecosystem memory" in low or "bridge memory" in low:
        return [{"agent":"worker","task":"ecosystem:memory"}]

    if goal.startswith("api:"):
        return [{"agent":"worker","task":goal}]

    if goal.startswith("shell:"):
        return [{"agent":"worker","task":goal}]

    if goal.startswith("fs:"):
        return [{"agent":"worker","task":goal}]

    if "clipboard" in low:
        return [{"agent":"worker","task":"phone:clipboard"}]

    if "list" in low or "files" in low or "folder" in low:
        return [{"agent":"worker","task":"fs:list"}]

    if "pwd" in low or "current folder" in low or "current directory" in low:
        return [{"agent":"worker","task":"shell:pwd"}]

    if "public ip" in low:
        return [{"agent":"worker","task":"api:https://api.ipify.org"}]

    return [{"agent":"worker","task":"shell:" + goal}]

def plan(goal):
    try:
        text = ask_llama(SYSTEM_PROMPT, goal, temperature=0.1)
        data = json.loads(text)
        steps = data.get("steps", [])
        if isinstance(steps, list) and steps:
            return steps
    except Exception:
        pass

    return fallback_plan(goal)
