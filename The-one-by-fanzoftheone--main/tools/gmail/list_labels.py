from providers.google.gmail_client import load_gmail_service

def list_labels():
    service = load_gmail_service()
    if not service:
        return {"status": "not_connected", "labels": []}
    res = service.users().labels().list(userId="me").execute()
    return {"status": "ok", "labels": res.get("labels", [])}
