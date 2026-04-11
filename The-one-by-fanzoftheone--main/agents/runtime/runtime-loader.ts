import { listTools, executeTool } from "./tool-bridge";

export async function agentRuntime(task: any) {
  console.log("Agent runtime started");

  const tools = listTools();
  console.log("Available tools:", tools.map(t => t.id));

  if (task.tool) {
    return await executeTool(task.tool, task.payload || {});
  }

  return { status: "idle" };
}
