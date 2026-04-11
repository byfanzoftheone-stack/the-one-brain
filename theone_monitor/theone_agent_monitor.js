// theone_agent_monitor.js
// Usage: node theone_agent_monitor.js
// Pure Node.js agent monitor for THE ONE backend

const fetch = require("node-fetch"); // make sure to install: npm install node-fetch@2
const fs = require("fs");

// Your Railway backend base URL
const BASE_URL = "https://the-one-by-fanzoftheone-production.up.railway.app";

// Endpoints to monitor
const endpoints = [
  "/health",
  "/api/health",
  "/api/orchestrator/status",
  "/api/agents/status",
  "/api/modules",
  "/api/apps",
  "/api/warehouse/stats",
  "/api/warehouse/code-bank",
  "/api/payments/subscription/test@example.com",
  "/api/seo/keywords",
  "/api/system/overview"
];

async function monitor() {
  const results = [];

  console.log("📡 THE ONE Node.js Agent Monitor Starting...\n");

  for (const ep of endpoints) {
    const url = BASE_URL + ep;
    try {
      const res = await fetch(url, { method: "GET", timeout: 5000 });
      results.push(`${ep} → ${res.status}`);
    } catch (err) {
      results.push(`${ep} → ERROR: ${err.message}`);
    }
  }

  // Save results
  fs.writeFileSync("theone_monitor_results.txt", results.join("\n"));

  // Print results
  results.forEach(line => console.log(line));

  console.log("\n✅ Monitor complete. Results saved in 'theone_monitor_results.txt'");
}

monitor();
