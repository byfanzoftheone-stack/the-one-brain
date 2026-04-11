from providers.google.gmail_client import load_gmail_service

def list_messages(max_results: int = 10):
    service = load_gmail_service()
    if not service:
        return {"status": "not_connected", "messages": []}
    res = service.users().messages().list(userId="me", maxResults=max_results).execute()
    return {"status": "ok", "messages": res.get("messages", [])}
