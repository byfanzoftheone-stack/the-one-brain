TOOLS = {}

def register(name, func):
    TOOLS[name] = func

def run(name, arg):
    if name not in TOOLS:
        return f"tool {name} not found"
    return TOOLS[name](arg)
