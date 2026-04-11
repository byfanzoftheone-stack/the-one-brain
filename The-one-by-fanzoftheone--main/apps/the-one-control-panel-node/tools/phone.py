import subprocess

SAFE_PHONE_COMMANDS = {
    "battery": "termux-battery-status",
    "clipboard": "termux-clipboard-get"
}

def run(cmd: str) -> str:
    cmd = cmd.strip()

    if cmd not in SAFE_PHONE_COMMANDS:
        return f"Unknown phone command: {cmd}"

    try:
        output = subprocess.check_output(
            SAFE_PHONE_COMMANDS[cmd],
            shell=True,
            text=True
        )
        return output
    except Exception as e:
        return str(e)
