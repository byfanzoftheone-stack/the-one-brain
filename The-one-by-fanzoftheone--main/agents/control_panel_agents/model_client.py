import requests

MODEL_URL = "http://127.0.0.1:8080/v1/chat/completions"
MODEL_NAME = "tinyllama.gguf"

def ask_model(prompt):
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }
    r = requests.post(MODEL_URL, json=payload, timeout=120)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]
