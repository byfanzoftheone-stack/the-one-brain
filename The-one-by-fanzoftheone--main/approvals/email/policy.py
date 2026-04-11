APPROVAL_REQUIRED_ACTIONS = {"send", "reply", "archive", "delete", "label"}

def check_email_action(action: str):
    return {
        "action": action,
        "approval_required": action in APPROVAL_REQUIRED_ACTIONS,
        "status": "approved" if action not in APPROVAL_REQUIRED_ACTIONS else "needs_approval",
    }
