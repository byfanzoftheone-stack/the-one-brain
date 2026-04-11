import subprocess
import sys

TASKS = [
    "what folder am i in",
    "list files in this folder",
    "what is my battery status"
]

def run_task(task):
    result = subprocess.run(
        ["python", "agents/runner.py", task],
        capture_output=True,
        text=True
    )
    print("\nTASK:", task)
    print(result.stdout.strip())

def main():
    for task in TASKS:
        run_task(task)

if __name__ == "__main__":
    main()
