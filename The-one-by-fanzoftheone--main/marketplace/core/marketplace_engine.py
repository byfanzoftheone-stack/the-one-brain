import json
import os

MARKET = {
 "modules": [],
 "apps": []
}

def register_module(name):
    MARKET["modules"].append(name)

def register_app(name):
    MARKET["apps"].append(name)

def list_market():
    return MARKET

if __name__ == "__main__":
    print(json.dumps(MARKET, indent=2))
