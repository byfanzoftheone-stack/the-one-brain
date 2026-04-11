import os, requests

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

def run(task: dict, payload: dict):
    prompt = (
        task.get("prompt")
        or task.get("goal")
        or payload.get("prompt")
        or payload.get("goal")
        or str(task)
    )

    try:
        res = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": "You are THE ONE agent system."},
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=30
        )

        data = res.json()

        return {
            "status": "ok",
            "provider": "deepseek",
            "response": data.get("choices", [{}])[0].get("message", {}).get("content", ""),
        }

    except Exception as e:
        return {
            "status": "error",
            "provider": "deepseek",
            "error": str(e),
        }
