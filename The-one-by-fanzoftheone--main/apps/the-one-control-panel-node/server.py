from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import traceback
import os

from agents.coordinator.coordinator import execute
from warehouse.memory import read_memory
from runtime.llama_client import ask_llama

PORT = 8090
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UI_FILE = os.path.join(BASE_DIR, "ui", "index.html")

class Handler(BaseHTTPRequestHandler):

    def _send_json(self, code, obj):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(obj).encode())

    def _send_html(self, code, html):
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode())

    def do_GET(self):
        if self.path == "/":
            with open(UI_FILE, "r", encoding="utf-8") as f:
                self._send_html(200, f.read())
            return

        if self.path == "/status":
            self._send_json(200,{
                "node":"THE ONE",
                "agents":["planner","worker","auditor","coordinator","warehouse"],
                "tools":["shell","filesystem","phone","api","ecosystem"],
                "memory":"connected",
                "llama_reasoning":"fallback-ready",
                "ecosystem_bridge":"connected"
            })
            return

        if self.path == "/memory":
            self._send_json(200,{"items":read_memory()})
            return

        self._send_json(404,{"error":"not found"})

    def do_POST(self):
        try:
            if self.path == "/run":
                length = int(self.headers.get("Content-Length","0"))
                body = self.rfile.read(length).decode()
                data = json.loads(body)
                goal = data.get("goal","")
                result = execute(goal)
                self._send_json(200,result)
                return

            if self.path == "/reason":
                length = int(self.headers.get("Content-Length","0"))
                body = self.rfile.read(length).decode()
                data = json.loads(body)
                prompt = data.get("prompt","")
                text = ask_llama("You are the reasoning core for THE ONE.", prompt, temperature=0.2)
                self._send_json(200,{"prompt":prompt,"response":text})
                return

            self._send_json(404,{"error":"not found"})
        except Exception as e:
            self._send_json(500,{
                "error":str(e),
                "trace":traceback.format_exc()
            })

def start():
    server = HTTPServer(("0.0.0.0",PORT),Handler)
    print("THE ONE node running on 8090")
    server.serve_forever()

if __name__ == "__main__":
    start()
