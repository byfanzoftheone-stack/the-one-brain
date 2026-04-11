def plan(goal):
    steps = []

    if "clipboard" in goal:
        steps.append({"agent": "worker", "task": "phone:clipboard"})
    elif "list" in goal or "files" in goal or "folder" in goal:
        steps.append({"agent": "worker", "task": "fs:list"})
    elif "pwd" in goal or "shell" in goal:
        steps.append({"agent": "worker", "task": "shell:pwd"})
    elif goal.startswith("api:"):
        steps.append({"agent": "worker", "task": goal})
    else:
        steps.append({"agent": "worker", "task": "shell:" + goal})

    return steps
