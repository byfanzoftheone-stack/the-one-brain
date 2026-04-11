import requests

LLAMA_URL = "http://127.0.0.1:8080/v1/chat/completions"

def ask_llama(system_prompt, user_prompt, temperature=0.2):
    payload = {
        "model": "local-model",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature
    }
    r = requests.post(LLAMA_URL, json=payload, timeout=25)
    r.raise_for_status()
    data = r.json()
    return data["choices"][0]["message"]["content"]
