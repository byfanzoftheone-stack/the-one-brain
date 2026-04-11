import subprocess

def run(action):
    action = action.strip()

    if action == "clipboard":
        result = subprocess.run(
            "termux-clipboard-get",
            shell=True,
            capture_output=True,
            text=True
        )
        return result.stdout.strip() or result.stderr.strip()

    return {"error": f"unknown phone action: {action}"}
