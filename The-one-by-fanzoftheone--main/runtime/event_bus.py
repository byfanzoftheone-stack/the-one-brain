from collections import defaultdict
from typing import Any, Callable, DefaultDict, List

_listeners: DefaultDict[str, List[Callable[[Any], None]]] = defaultdict(list)


def subscribe(event: str, callback: Callable[[Any], None]) -> None:
    _listeners[event].append(callback)


def emit(event: str, data: Any) -> None:
    for callback in _listeners.get(event, []):
        callback(data)
