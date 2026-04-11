import requests

BASE_URL = "http://localhost:8000"

def call_api(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"

    if method == "GET":
        r = requests.get(url)
    elif method == "POST":
        r = requests.post(url, json=data)
    else:
        return {"error": "unsupported method"}

    try:
        return r.json()
    except:
        return r.text
