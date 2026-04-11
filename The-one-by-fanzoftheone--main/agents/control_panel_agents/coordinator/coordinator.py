from agents.llm_planner import plan
from agents.worker.worker import run
from agents.auditor.auditor import audit
from warehouse.memory import save_memory

def execute(goal):

    steps = plan(goal)

    results = []

    for step in steps:
        task = step["task"]
        results.append(run(task))

    report = audit(goal, steps, results)

    save_memory(goal, steps, results)

    return {
        "goal": goal,
        "steps": steps,
        "results": results,
        "audit": report
    }
