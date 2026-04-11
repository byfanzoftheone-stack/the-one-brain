from typing import Any, Callable, Dict
from runtime.runtime_logger import log

_REGISTRY: Dict[str, Callable[..., Any]] = {}


def register(name: str, fn: Callable[..., Any]) -> None:
    _REGISTRY[name] = fn


def run(name: str, *args, **kwargs) -> Any:
    if name not in _REGISTRY:
        raise KeyError(f'Tool not registered: {name}')
    result = _REGISTRY[name](*args, **kwargs)
    log('tool_call', {'tool': name, 'args': args, 'kwargs': kwargs, 'result': str(result)})
    return result


def list_tools():
    return sorted(_REGISTRY.keys())
