import os
import sys
import subprocess

sys.path.insert(0, os.path.expanduser("~/ai-node"))

from tools.registry import run_tool


MODEL_PATH = os.path.expanduser("~/models/tinyllama.gguf")
LLAMA_BIN = os.path.expanduser("~/llama.cpp/build/bin/llama-cli")


def ask_llm(prompt):
    cmd = [
        LLAMA_BIN,
        "-m",
        MODEL_PATH,
        "-p",
        prompt,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip()


def choose_tool(user_input):
    text = user_input.lower()

    if "battery" in text or "clipboard" in text:
        return "phone"

    if "list files" in text or "folder" in text:
        return "filesystem"

    return "shell"


def main():
    if len(sys.argv) < 2:
        print("Usage: python runner.py \"request\"")
        return

    user_input = " ".join(sys.argv[1:])

    if "list files" in user_input.lower():
        print(run_tool("filesystem", "list"))
        return

    if "battery" in user_input.lower():
        print(run_tool("phone", "battery"))
        return

    if "clipboard" in user_input.lower():
        print(run_tool("phone", "clipboard"))
        return

    if "what folder" in user_input.lower():
        print(run_tool("shell", "pwd"))
        return

    print(ask_llm(user_input))


if __name__ == "__main__":
    main()
