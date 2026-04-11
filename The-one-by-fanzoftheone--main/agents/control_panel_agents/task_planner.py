import subprocess

def plan(goal):
    goal = goal.lower()

    tasks = []

    if "folder" in goal or "directory" in goal:
        tasks.append("what folder am i in")

    if "files" in goal:
        tasks.append("list files in this folder")

    if "battery" in goal:
        tasks.append("what is my battery status")

    if not tasks:
        tasks.append(goal)

    return tasks


def run_task(task):
    result = subprocess.run(
        ["python", "agents/runner.py", task],
        capture_output=True,
        text=True
    )
    return result.stdout.strip()


def execute(goal):
    tasks = plan(goal)

    print("\nGOAL:", goal)

    for task in tasks:
        print("\nTASK:", task)
        print(run_task(task))


if __name__ == "__main__":
    import sys
    goal = " ".join(sys.argv[1:])
    execute(goal)
