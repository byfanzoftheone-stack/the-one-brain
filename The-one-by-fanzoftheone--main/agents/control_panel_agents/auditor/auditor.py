def audit(goal, steps, results):

    issues = []

    if not steps:
        issues.append("no_steps_generated")

    if any(r is None for r in results):
        issues.append("null_result")

    if any("error" in str(r).lower() for r in results):
        issues.append("error_detected")

    return {
        "goal": goal,
        "issues": issues,
        "status": "ok" if not issues else "review"
    }
