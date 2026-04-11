import os

def run(action, path=None):
    try:
        if action == "list":
            return os.listdir(path or os.getcwd())

        if action == "read":
            with open(path, "r") as f:
                return f.read()

        if action == "exists":
            return os.path.exists(path)

        return "unknown filesystem action"

    except Exception as e:
        return str(e)
