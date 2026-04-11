path = "frontend/app/market/page.tsx"
with open(path, "r") as f:
    content = f.read()

new_products = '  { id: "code-audit-agent",     name: "Code Audit Agent",       tagline: "Security + Performance crew",          price: 29, icon: "🔍",  color: "#ff4444",       tag: "Dev"  },\n  { id: "nervous-system-agent", name: "Nervous System Agent",   tagline: "4-agent critical event processor",     price: 49, icon: "🧬",  color: "#aa44ff",       tag: "Ops"  },'

old = '  { id: "labs-builder",'
content = content.replace(old, new_products + "\n  " + '{ id: "labs-builder",')

with open(path, "w") as f:
    f.write(content)

print("Done")
