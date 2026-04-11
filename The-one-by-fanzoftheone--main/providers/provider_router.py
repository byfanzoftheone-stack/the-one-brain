"""
Routes to the best available provider based on env config.
Priority: DEEPSEEK_API_KEY → ANTHROPIC_API_KEY → OPENAI_API_KEY → Ollama (local).
"""
import os
from providers.deepseek_provider import run as deepseek_run
from providers.claude_provider  import run as claude_run
from providers.openai_provider  import run as openai_run
from providers.ollama_provider  import run as ollama_run

def get_best_provider():
    if os.getenv("DEEPSEEK_API_KEY"):
        return deepseek_run
    if os.getenv("ANTHROPIC_API_KEY"):
        return claude_run
    if os.getenv("OPENAI_API_KEY"):
        return openai_run
    return ollama_run

def route(task: dict, payload: dict = {}) -> dict:
    provider = get_best_provider()
    return provider(task, payload)
