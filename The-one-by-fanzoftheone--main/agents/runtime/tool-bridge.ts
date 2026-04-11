import fs from "fs";
import path from "path";

type Tool = {
  id: string;
  zone: string;
  purpose: string;
};

let registry: Tool[] = [];

function loadRegistry() {
  const registryPath = path.join(process.cwd(), "agents/tools/tool-registry.json");
  const raw = fs.readFileSync(registryPath, "utf-8");
  const parsed = JSON.parse(raw);
  registry = parsed.tools || [];
}

export function listTools() {
  if (registry.length === 0) loadRegistry();
  return registry;
}

export function getTool(id: string) {
  if (registry.length === 0) loadRegistry();
  return registry.find((t) => t.id === id);
}

export async function executeTool(id: string, payload: any) {
  if (registry.length === 0) loadRegistry();

  const tool = registry.find((t) => t.id === id);
  if (!tool) {
    throw new Error("Tool not found: " + id);
  }

  console.log("Agent requested tool:", tool.id);

  switch (tool.id) {
    case "read-file":
      return fs.readFileSync(payload.path, "utf-8");

    case "write-file":
      fs.writeFileSync(payload.path, payload.content);
      return { success: true };

    case "scan-modules":
      const modulesDir = path.join(process.cwd(), "modules");
      return fs.readdirSync(modulesDir);

    case "create-app":
      const appPath = path.join(process.cwd(), "apps", payload.name);
      fs.mkdirSync(appPath, { recursive: true });
      return { created: payload.name };

    default:
      return {
        tool: tool.id,
        status: "registered",
        message: "tool stub executed"
      };
  }
}
