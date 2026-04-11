import subprocess

def run(command):
    command = command.strip()
    if not command:
        return ""

    result = subprocess.run(
        command,
        shell=True,
        capture_output=True,
        text=True
    )

    output = result.stdout.strip()
    error = result.stderr.strip()

    if output and error:
        return output + "\n" + error
    if output:
        return output
    if error:
        return error
    return ""
