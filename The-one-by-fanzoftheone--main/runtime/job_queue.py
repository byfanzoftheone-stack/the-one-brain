from collections import deque
from typing import Any, Deque, Optional

_queue: Deque[Any] = deque()


def push(job: Any) -> None:
    _queue.append(job)


def pop() -> Optional[Any]:
    return _queue.popleft() if _queue else None


def size() -> int:
    return len(_queue)
