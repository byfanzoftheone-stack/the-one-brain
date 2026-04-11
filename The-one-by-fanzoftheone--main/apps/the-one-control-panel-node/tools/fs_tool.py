import os

def run(action):
    action = action.strip()

    if action == "list":
        return os.listdir(".")

    return {"error": f"unknown fs action: {action}"}
