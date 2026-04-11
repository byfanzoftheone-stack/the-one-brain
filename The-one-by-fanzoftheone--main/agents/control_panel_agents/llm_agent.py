import subprocess

def choose_tool(goal: str) -> str:
    text = goal.lower()

    if "battery" in text or "clipboard" in text or "device" in text:
        return "phone"

    if "file" in text or "folder" in text or "directory" in text:
        return "filesystem"

    if "api" in text or "endpoint" in text or "service" in text:
        return "api"

    return "shell"

def run_request(goal: str) -> str:
    result = subprocess.run(
        ["python", "agents/runner.py", goal],
        capture_output=True,
        text=True
    )
    return result.stdout.strip()

def execute(goal: str):
    tool = choose_tool(goal)

    print(f"GOAL: {goal}")
    print(f"SELECTED TOOL: {tool}")
    print()
    print("RESULT:")
    print(run_request(goal))

if __name__ == "__main__":
    import sys
    goal = " ".join(sys.argv[1:])
    execute(goal)
