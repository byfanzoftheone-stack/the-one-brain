"""
Task Classifier — classifies tasks to route to the right provider.
"""

CODER_KEYWORDS   = {"code", "function", "class", "debug", "refactor", "build", "implement", "write code", "script"}
ANALYSIS_KEYWORDS= {"analyze", "analysis", "evaluate", "assess", "review", "audit", "score"}
PLAN_KEYWORDS    = {"plan", "strategy", "roadmap", "outline", "structure", "design"}
REASON_KEYWORDS  = {"why", "explain", "how does", "reason", "think", "understand"}

def classify_task(task: dict) -> str:
    if isinstance(task, str):
        text = task.lower()
    else:
        text = (str(task.get("prompt", "")) + " " + str(task.get("goal", "")) + " " + str(task.get("kind", ""))).lower()

    if any(k in text for k in CODER_KEYWORDS):
        return "coder"
    if any(k in text for k in ANALYSIS_KEYWORDS):
        return "analysis"
    if any(k in text for k in PLAN_KEYWORDS):
        return "reasoning"
    if any(k in text for k in REASON_KEYWORDS):
        return "reasoning"
    return "general"
