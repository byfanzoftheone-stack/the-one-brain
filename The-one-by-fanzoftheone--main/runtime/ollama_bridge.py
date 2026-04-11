import subprocess

def run_ollama(task, payload=None):
    model = "llama3"

    if isinstance(task, dict):
        prompt = task.get("task", "")
    else:
        prompt = task

    if not isinstance(prompt, str):
        prompt = str(prompt)

    try:
        result = subprocess.run(
            ["ollama", "run", model, prompt],
            capture_output=True,
            text=True,
            check=False,
        )

        return {
            "provider": "ollama",
            "status": "ok" if result.returncode == 0 else "error",
            "model": model,
            "output": result.stdout.strip() if result.stdout else result.stderr.strip(),
        }

    except FileNotFoundError:
        return {
            "provider": "ollama",
            "status": "unconfigured",
            "model": model,
            "output": "ollama binary not installed in this environment"
        }
