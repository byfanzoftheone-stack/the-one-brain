import os
import importlib

AGENT_FOLDER = "agents"

def load_agents():
    agents = []

    for file in os.listdir(AGENT_FOLDER):
        if file.endswith(".py") and not file.startswith("__"):
            name = file[:-3]
            module = importlib.import_module(f"{AGENT_FOLDER}.{name}")
            agents.append(module)

    return agents
