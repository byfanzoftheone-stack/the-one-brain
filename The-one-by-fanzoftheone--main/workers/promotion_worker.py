import json
from pathlib import Path


def promote(app_name: str) -> dict:
    campaigns = Path('campaigns/drafts')
    campaigns.mkdir(parents=True, exist_ok=True)
    path = campaigns / f'{app_name}-launch.json'
    data = {
        'name': f'{app_name}-launch',
        'status': 'draft',
        'channel': ['facebook', 'tiktok', 'local outreach'],
        'goal': f'Acquire first customers for {app_name}.',
    }
    path.write_text(json.dumps(data, indent=2))
    return {'status': 'drafted', 'campaign': str(path)}


if __name__ == '__main__':
    print(promote('example-app'))
