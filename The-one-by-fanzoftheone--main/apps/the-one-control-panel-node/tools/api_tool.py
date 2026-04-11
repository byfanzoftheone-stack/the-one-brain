import requests

def run(url):
    url = url.strip()
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return r.text.strip()
