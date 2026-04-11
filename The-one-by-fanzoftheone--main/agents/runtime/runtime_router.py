from runtime.provider_router import route_task


def route(task: dict):
    return route_task(task)
