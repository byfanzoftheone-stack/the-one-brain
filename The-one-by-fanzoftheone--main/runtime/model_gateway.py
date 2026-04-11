import os
from runtime.provider_router import route_task
from runtime.runtime_logger import log

class ModelGateway:

    def __init__(self):
        self.default_provider = os.getenv("DEFAULT_PROVIDER", "ollama")

    def run(self, task, payload):

        try:

            provider = route_task(task)

            if not provider:
                provider = self.default_provider

            result = provider(task, payload)

            log("model_gateway", {
                "task": task,
                "provider": provider.__name__,
                "status": "ok"
            })

            return result

        except Exception as e:

            log("model_gateway", {
                "task": task,
                "status": "error",
                "error": str(e)
            })

            raise
