from pathlib import Path


def read_text(path: str) -> str:
    return Path(path).read_text()


def write_text(path: str, content: str) -> str:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    return str(target)
