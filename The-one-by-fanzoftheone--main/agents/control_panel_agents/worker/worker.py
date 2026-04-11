from tools.load_tools import run as tool_run

def run(task):
    if task.startswith("shell:"):
        return tool_run("shell", task.replace("shell:", "", 1))

    if task.startswith("fs:"):
        return tool_run("filesystem", task.replace("fs:", "", 1))

    if task.startswith("phone:"):
        return tool_run("phone", task.replace("phone:", "", 1))

    if task.startswith("api:"):
        return tool_run("api", task.replace("api:", "", 1))

    if task.startswith("ecosystem:"):
        return tool_run("ecosystem", task.replace("ecosystem:", "", 1))

    return {"error": f"unhandled task: {task}"}
