import os
import json
from datetime import datetime, UTC

ERRORS_DIR = "warehouse/errors"

def write_error_receipt(name, failed_step, why, fixed_by):
    os.makedirs(ERRORS_DIR, exist_ok=True)
    payload = {
        "name": name,
        "failed_step": failed_step,
        "why": why,
        "fixed_by": fixed_by,
        "timestamp": datetime.now(UTC).isoformat()
    }
    with open(os.path.join(ERRORS_DIR, f"{name}.json"), "w") as f:
        json.dump(payload, f, indent=2)
    print(json.dumps(payload, indent=2))

if __name__ == "__main__":
    write_error_receipt(
        "example-error-receipt",
        "placeholder",
        "replace with real failure when one occurs",
        "manual update or future auto-hook"
    )
