from runtime.task_classifier import classify_task
from runtime.provider_registry import get_provider

def route_task(task):
    task_type = classify_task(task)

    # allow provider_registry to auto-select best provider
    return get_provider(None)
