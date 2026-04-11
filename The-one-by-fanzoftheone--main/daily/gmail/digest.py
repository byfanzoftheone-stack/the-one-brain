from tools.gmail.list_messages import list_messages

def build_digest(max_results: int = 10):
    data = list_messages(max_results=max_results)
    return {
        "status": data.get("status", "unknown"),
        "count": len(data.get("messages", [])),
        "messages": data.get("messages", []),
    }
