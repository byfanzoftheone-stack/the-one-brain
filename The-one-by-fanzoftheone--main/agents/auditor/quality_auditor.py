import os
import json
from pathlib import Path


def audit_app(app_name):
    app_path = Path('apps') / app_name
    manifest_path = app_path / 'modules.json'
    readme_path = app_path / 'README.md'

    result = {
        'app': app_name,
        'exists': app_path.is_dir(),
        'has_manifest': manifest_path.exists(),
        'has_readme': readme_path.exists(),
        'modules_valid': False,
        'status': 'fail',
        'notes': [],
    }

    if manifest_path.exists():
        data = json.loads(manifest_path.read_text())
        modules = data.get('modules', [])
        result['modules_valid'] = isinstance(modules, list) and len(modules) > 0
        if not result['modules_valid']:
            result['notes'].append('modules list empty or invalid')

    if not readme_path.exists():
        result['notes'].append('README.md missing')

    if result['exists'] and result['has_manifest'] and result['modules_valid']:
        result['status'] = 'pass'
        if not result['has_readme']:
            result['status'] = 'warn'

    return result


def audit_all():
    apps_dir = Path('apps')
    reports = []
    for app in sorted([p.name for p in apps_dir.iterdir() if p.is_dir()]) if apps_dir.exists() else []:
        reports.append(audit_app(app))

    out_dir = Path('warehouse/analytics')
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / 'quality_audit.json').write_text(json.dumps({'reports': reports}, indent=2))
    return {'reports': reports}


if __name__ == '__main__':
    print(json.dumps(audit_all(), indent=2))
