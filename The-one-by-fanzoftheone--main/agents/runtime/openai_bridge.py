"""OpenAI bridge for the agent runtime — wraps the root provider."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from providers.openai_provider import run

def call(task: dict, payload: dict = {}) -> dict:
    return run(task, payload)
