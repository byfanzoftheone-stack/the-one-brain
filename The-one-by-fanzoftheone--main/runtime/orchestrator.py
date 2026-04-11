from runtime.model_gateway import ModelGateway
from runtime.runtime_logger import log

gateway = ModelGateway()

def run(task):
    result = gateway.run(task, {})
    log("orchestrator_run", {"task": task, "result": result})
    return result

if __name__ == "__main__":
    sample = {"task": "plan ecosystem growth"}
    print(run(sample))
