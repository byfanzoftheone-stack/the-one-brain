import os
from typing import Dict


def run_openai(prompt: str, model: str = 'gpt-4o-mini') -> Dict[str, str]:
    key = os.getenv('OPENAI_API_KEY')
    if not key:
        return {
            'provider': 'openai',
            'status': 'unconfigured',
            'model': model,
            'output': 'OPENAI_API_KEY not set; configure to enable hosted OpenAI lane.'
        }
    # Stub-by-design: keeps repo low-cost and safe until live credentials are provided.
    return {
        'provider': 'openai',
        'status': 'configured',
        'model': model,
        'output': 'OpenAI bridge ready. Replace stub with live API call when credentials are available.'
    }
