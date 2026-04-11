from tools.shell_tool import run as shell
from tools.fs_tool import run as filesystem
from tools.phone_tool import run as phone
from tools.api_tool import run as api
from tools.ecosystem import run as ecosystem

TOOLS = {
    "shell": shell,
    "filesystem": filesystem,
    "phone": phone,
    "api": api,
    "ecosystem": ecosystem,
}

def run(tool_name, task):
    tool = TOOLS.get(tool_name)
    if not tool:
        return {"error": f"unknown tool: {tool_name}"}
    return tool(task)
