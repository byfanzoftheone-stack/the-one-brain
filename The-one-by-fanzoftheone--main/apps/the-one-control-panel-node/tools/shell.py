import subprocess

SAFE_COMMANDS = (
    "pwd",
    "ls",
    "date",
    "whoami",
    "find",
    "cat",
    "echo",
)

def run(cmd: str) -> str:
    cmd = cmd.strip()

    if not cmd.startswith(SAFE_COMMANDS):
        return f"Blocked command: {cmd}"

    try:
        output = subprocess.check_output(
            cmd,
            shell=True,
            text=True,
            stderr=subprocess.STDOUT,
            timeout=20
        )
        return output[:4000]

    except subprocess.CalledProcessError as e:
        return e.output[:4000]

    except Exception as e:
        return str(e)
