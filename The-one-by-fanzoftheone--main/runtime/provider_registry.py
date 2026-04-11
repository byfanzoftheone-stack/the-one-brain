"""
Provider Registry — maps provider names to their callable run functions.
"""
import os

def get_provider(name: str):
    """Return the run() callable for the named provider."""
    name = (name or "").lower()

    if name == "deepseek":
        from providers.deepseek_provider import run
        return run
    if name == "claude":
        from providers.claude_provider import run
        return run
    if name == "openai":
        from providers.openai_provider import run
        return run
    if name in ("ollama", "skip", "local"):
        from providers.ollama_provider import run
        return run

    # Auto-select best available
    if os.getenv("DEEPSEEK_API_KEY"):
        from providers.deepseek_provider import run
        return run
    if os.getenv("ANTHROPIC_API_KEY"):
        from providers.claude_provider import run
        return run
    if os.getenv("OPENAI_API_KEY"):
        from providers.openai_provider import run
        return run
    from providers.ollama_provider import run
    return run
