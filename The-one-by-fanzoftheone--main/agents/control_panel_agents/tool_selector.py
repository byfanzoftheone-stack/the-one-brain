import subprocess

TOOLS = [
    "shell",
    "filesystem",
    "phone"
]

PROMPT_TEMPLATE = """
You are an AI deciding which tool to use.

Available tools:
shell - run system commands
filesystem - read files or list directories
phone - access device information

User request:
{request}

Respond with only the tool name.
"""

def choose_tool(request):
    prompt = PROMPT_TEMPLATE.format(request=request)

    result = subprocess.run(
        ["python", "agents/runner.py", prompt],
        capture_output=True,
        text=True
    )

    response = result.stdout.strip().lower()

    for tool in TOOLS:
        if tool in response:
            return tool

    return "shell"
