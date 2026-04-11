import json
import subprocess
import requests
import sys

MODEL_URL = "http://127.0.0.1:8080/v1/chat/completions"
MODEL_NAME = "tinyllama.gguf"

SYSTEM_PROMPT = """
You are a Termux system agent.

You HAVE access to tools through this system.

When the user asks for:
- system information
- files
- directory listings
- commands

you MUST call a tool.

Never say you cannot access the system.

Respond ONLY in JSON when using a tool.

Example:

{"tool":"shell","input":"pwd"}
{"tool":"shell","input":"ls"}
{"tool":"shell","input":"date"}
"""

def call_model(messages):
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": 0.2
    }
    r = requests.post(MODEL_URL, json=payload, timeout=120)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

def run_shell(cmd):
    allowed = ("pwd", "ls", "cat", "echo", "find", "date", "whoami")
    cmd = cmd.strip()
    if not cmd.startswith(allowed):
        return f"Blocked shell command: {cmd}"
    try:
        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT, text=True, timeout=20)
        return out[:4000]
    except subprocess.CalledProcessError as e:
        return e.output[:4000]
    except Exception as e:
        return str(e)

def read_file(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()[:4000]
    except Exception as e:
        return str(e)

def maybe_tool(text):
    text = text.strip()
    if not text.startswith("{"):
        return None
    try:
        obj = json.loads(text)
        if "tool" in obj and "input" in obj:
            return obj
    except Exception:
        return None
    return None

def main():
    if len(sys.argv) < 2:
        print('Usage: python ~/ai-node/agents/agent.py "your request"')
        return

    user_text = sys.argv[1]
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_text},
    ]

    first = call_model(messages)
    tool_call = maybe_tool(first)

    if not tool_call:
        print(first)
        return

    if tool_call["tool"] == "shell":
        tool_result = run_shell(tool_call["input"])
    elif tool_call["tool"] == "read_file":
        tool_result = read_file(tool_call["input"])
    else:
        print(f"Unknown tool: {tool_call['tool']}")
        return

    messages.extend([
        {"role": "assistant", "content": first},
        {"role": "user", "content": f"Tool result:\n{tool_result}\nNow answer clearly for the user."}
    ])

    final = call_model(messages)
    print(final)

if __name__ == "__main__":
    main()
