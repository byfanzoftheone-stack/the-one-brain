import os
from typing import Dict


def run_claude(prompt: str, model: str = 'claude-3-5-haiku-latest') -> Dict[str, str]:
    key = os.getenv('ANTHROPIC_API_KEY')
    if not key:
        return {
            'provider': 'claude',
            'status': 'unconfigured',
            'model': model,
            'output': 'ANTHROPIC_API_KEY not set; configure to enable hosted Claude lane.'
        }
    return {
        'provider': 'claude',
        'status': 'configured',
        'model': model,
        'output': 'Claude bridge ready. Replace stub with live API call when credentials are available.'
    }
