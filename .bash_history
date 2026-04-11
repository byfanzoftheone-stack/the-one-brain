      ;;

    *)
      echo "cmds: scan | map | audit <repo> | fix <repo> | sync | quit"
      ;;

  esac
done
EOF

chmod +x ~/termux-agent.sh
bash \~/termux-agent.sh
pkill -f termux-agent.sh
cat > ~/project-map.sh << 'EOF'
#!/bin/bash

echo "🧠 BUILDING REAL PROJECT MAP..."

BASE=~
OUT=~/agent-projects.txt

rm -f "$OUT"

find "$BASE" -maxdepth 3 -type d -name ".git" 2>/dev/null | while read gitdir; do
  repo=$(dirname "$gitdir")
  echo "$repo" >> "$OUT"
done

echo "✅ DONE"
echo "Found projects:"
cat "$OUT"
EOF

chmod +x ~/project-map.sh
bash ~/project-map.sh
mkdir -p ~/projects/_archive
while read repo; do   name=$(basename "$repo");   mv "$repo" ~/projects/"$name" 2>/dev/null; done < ~/agent-projects.txt
bash ~/project-map.sh
cat > ~/repo-registry.sh << 'EOF'
#!/bin/bash

BASE=~/projects
OUT=~/repo-registry.txt

rm -f "$OUT"

echo "🧠 BUILDING REPO REGISTRY..."

for d in "$BASE"/*; do
  if [ -d "$d/.git" ]; then
    name=$(basename "$d")
    url=$(cd "$d" && git remote get-url origin 2>/dev/null)
    echo "$name|$d|$url" >> "$OUT"
  fi
done

echo "✅ REGISTRY CREATED"
cat "$OUT"
EOF

chmod +x ~/repo-registry.sh
bash ~/repo-registry.sh
git config --global --unset-all credential.helper
rm -f ~/.git-credentials
cd ~/projects/THE-ONE-MARKET
git remote set-url origin https://github.com/byfanzoftheone-stack/the-one-market.git
cat > ~/repo-registry-clean.sh << 'EOF'
#!/bin/bash

BASE=~/projects
OUT=~/repo-registry-clean.txt

rm -f "$OUT"

echo "🧠 CLEAN REGISTRY BUILD"

for d in "$BASE"/*; do
  if [ -d "$d/.git" ]; then
    name=$(basename "$d")
    url=$(cd "$d" && git remote get-url origin 2>/dev/null)
    echo "$name|$d|$url" >> "$OUT"
  fi
done

echo "✅ CLEAN REGISTRY COMPLETE"
cat "$OUT"
EOF

chmod +x ~/repo-registry-clean.sh
bash ~/repo-registry-clean.sh
cat ~/repo-registry-clean.txt
cd ~/projects/Play-Better-
git remote set-url origin https://byfanzoftheone-stack:TOKEN@github.com/byfanzoftheone-stack/Play-Better-.git
cd ~/projects/Play-Better-
git remote set-url origin https://byfanzoftheone-stack:TOKEN@github.com/byfanzoftheone-stack/Play-Better-.git
cd ~/projects/The-one-by-fanzoftheone-clean
git remote set-url origin https://byfanzoftheone-stack:TOKEN@github.com/byfanzoftheone-stack/The-one-by-fanzoftheone-clean.git
cd ~/projects/THE-ONE-BRAIN
cat backend/requirements.txt
cd ~/projects/THE-ONE-BRAIN
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && pip install -r requirements.txt && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["cd backend && pip install -r requirements.txt"]

[start]
cmd = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
EOF

git add -A
git commit -m "fix: update Railway config for backend path"
git push
cd ~/projects/THE-ONE-BRAIN
cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

cat > nixpacks.toml << 'EOF'
[phases.install]
cmds = ["pip install -r backend/requirements.txt"]

[start]
cmd = "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
EOF

git add -A
git commit -m "fix: correct Railway start command path"
git push
set +H
cd ~/projects/THE-ONE-BRAIN
# Pull everything from sdcard into brain
cp -r /sdcard/'0 the one plus market'/the_one_plus_market_ready agents/marketplace 2>/dev/null && echo "✅ marketplace"
cp -r /sdcard/'0 theone plat'/the_one_platform_template agents/platform 2>/dev/null && echo "✅ platform"
cp -r /sdcard/'fanzoftheone backdoor' agents/backdoor 2>/dev/null && echo "✅ backdoor"
cp -r /sdcard/buildhub/. agents/buildhub 2>/dev/null && echo "✅ buildhub"
cp -r /sdcard/subilife/. saas/subilife 2>/dev/null && echo "✅ subilife"
cp -r /sdcard/'trash valet'/. saas/trash-valet 2>/dev/null && echo "✅ trash-valet"
cp -r /sdcard/'roof quote pro'/. saas/roof-quote-pro 2>/dev/null && echo "✅ roof-quote-pro"
cp -r /sdcard/'driving app'/. saas/driving-app 2>/dev/null && echo "✅ driving-app"
cp -r /sdcard/'0 fanz agent v1'/. agents/fanz-agent-v1 2>/dev/null && echo "✅ fanz-agent-v1"
cp /sdcard/FanzoftheOne_Core.zip/. brain/ 2>/dev/null && echo "✅ core"
# Copy all Termux projects into saas folder
for d in ~/projects/Raven ~/projects/SubiLife ~/projects/Play-Better- ~/projects/Studio-; do   name=$(basename "$d");   cp -r "$d" saas/"$name" 2>/dev/null && echo "✅ $name"; done
# Remove any node_modules that got copied
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
# Write the brain index
cat > BRAIN_INDEX.md << 'EOF'
# THE ONE Brain — Master Index

## Agents
- comedy-forge
- leads-generator  
- airbnb-arbitrage
- tiktok-shorts
- receptionist
- seo
- joker-empire
- contracts
- quotes-invoices
- warehouse-manager
- ai-brain
- nervous-system
- orchestrator
- marketplace
- platform
- backdoor
- fanz-agent-v1

## SaaS Products
- Raven (roofing)
- SubiLife (WRX)
- Play-Better (pool)
- Studio
- trash-valet
- roof-quote-pro
- driving-app

## Brain Core
- memory_core.py
- voice_engine.py
- avatar_engine.py
- safety_manager.py
- growth_engine.py
- curiosity_engine.py
- orchestration
EOF

# Commit and push everything
git add -A
git commit -m "feat: THE ONE Brain absorbs all agents, saas, and core systems"
git push
echo ""
echo "✅ THE ONE BRAIN IS COMPLETE"
echo "🔗 https://github.com/byfanzoftheone-stack/the-one-brain"
echo "🚀 https://the-one-brain-tau.vercel.app"
echo "🧠 Railway: https://web-production-07044.up.railway.app"
cd ~/projects/THE-ONE-BRAIN
cat > nixpacks.toml << 'EOF'
[phases.install]
cmds = ["pip install -r backend/requirements.txt"]

[start]
cmd = "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
EOF

cat > railway.json << 'EOF'
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE"
  }
}
EOF

git add -A && git commit -m "fix: Railway runs uvicorn from root with backend module path" && git push
After Railway redeploys — check it loads at:
https://web-production-07044.up.railway.app/docs
cd ~/projects/THE-ONE-BRAIN
cat > Procfile << 'EOF'
web: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
EOF

cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install fastapi==0.103.2 uvicorn==0.23.2 pydantic==1.10.15 python-multipart==0.0.6"]

[start]
cmd = "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
EOF

git add -A && git commit -m "fix: hardcode pip installs, remove cd backend from Railway" && git push
cd ~/projects/THE-ONE-BRAIN
cat > backend/requirements.txt << 'EOF'
fastapi==0.103.2
uvicorn==0.23.2
pydantic==1.10.15
python-multipart==0.0.6
EOF

cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[start]
cmd = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
EOF

git add -A && git commit -m "fix: force Python 3.11 for pydantic v1 compatibility" && git push
3cd ~/projects/THE-ONE-BRAIN
cat > backend/requirements.txt << 'EOF'
fastapi==0.103.2
uvicorn==0.23.2
pydantic==1.10.15
python-multipart==0.0.6
EOF

cat > nixpacks.toml << 'EOF'
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[start]
cmd = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
EOF

git add -A && git commit -m "fix: force Python 3.11 for pydantic v1 compatibility" && git push
cd ~/projects/THE-ONE-BRAIN/backend
cat > railpack.json << 'EOF'
{
  "start": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
}
EOF

git add -A && git commit -m "fix: add railpack.json start command" && git push
cd
rclone ls gdrive1: --max-depth 2
rclone ls gdrive2: --max-depth 2
rclone lsd gdrive1:Share --max-depth 1 2>/dev/null || rclone lsd remote:Share --max-depth 1
rclone listremotes
curl -s https://api.github.com/users/byfanzoftheone-stack/repos?per_page=100 | grep '"name"'
GITHUB_USERNAME="byfanzoftheone-stack"
cd jokeforge-saas
-f
#!/bin/bash
set -e
# ================== CONFIG ==================
REPO_NAME="jokeforge-saas"
GITHUB_USERNAME="byfanzoftheone-stack"
PROJECT_DIR="$(pwd)/$REPO_NAME"
echo "🚀 Creating JokeForge AI SaaS..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"
# ================== STRUCTURE ==================
mkdir -p backend/app/agents frontend/app
# ================== ROOT ==================
cat > .gitignore << 'EOF'
backend/.env
backend/__pycache__/
frontend/node_modules/
frontend/.next/
EOF

cat > README.md << 'EOF'
# JokeForge AI SaaS
Full AI comedy generation system (FastAPI + Next.js)
EOF

# ================== BACKEND ==================
cat > backend/requirements.txt << 'EOF'
fastapi
uvicorn
sqlmodel
openai
python-dotenv
stripe
EOF

cat > backend/.env.example << 'EOF'
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
DATABASE_URL=sqlite:///jokeforge.db
EOF

cat > backend/app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Session, create_engine, select
from typing import Optional
from datetime import datetime
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
app = FastAPI()

# DB SETUP
engine = create_engine(os.getenv("DATABASE_URL"))
SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session

# MODELS
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    credits: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)

# REQUESTS
class GenerateRequest(BaseModel):
    theme: str
    email: str

# ROUTES
@app.get("/api/health")
def health():
    return {"status": "alive"}

@app.post("/api/create-user")
def create_user(email: str, db: Session = Depends(get_db)):
    user = User(email=email)
    db.add(user)
    db.commit()
    return {"status": "created"}

@app.post("/api/generate")
def generate(req: GenerateRequest, db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.email == req.email)).first()
    if not user:
        raise HTTPException(404, "User not found")

    if user.credits <= 0:
        raise HTTPException(402, "No credits")

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a world-class stand-up comedian."},
            {"role": "user", "content": f"Create a comedy set about: {req.theme}"}
        ]
    )

    result = response.choices[0].message.content

    user.credits -= 1
    db.add(user)
    db.commit()

    return {"result": result, "credits": user.credits}
EOF

cat > backend/Procfile << 'EOF'
web: sh -lc "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
EOF

# ================== FRONTEND ==================
cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18"
  }
}
EOF

cat > frontend/next.config.js << 'EOF'
module.exports = { reactStrictMode: true }
EOF

cat > frontend/app/layout.js << 'EOF'
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>
}
EOF

cat > frontend/app/page.js << 'EOF'
"use client";
import { useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");

  const generate = async () => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/generate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ theme, email })
    });
    const data = await res.json();
    setResult(data.result);
  };

  return (
    <div style={{padding:40}}>
      <h1>JokeForge AI</h1>
      <input placeholder="email" onChange={e=>setEmail(e.target.value)} />
      <input placeholder="theme" onChange={e=>setTheme(e.target.value)} />
      <button onClick={generate}>Generate</button>
      <pre>{result}</pre>
    </div>
  );
}
EOF

# ================== GIT ==================
git init
git add .
git commit -m "JokeForge SaaS"
git branch -M main
git remote add origin https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git
echo "✅ DONE. Now run:"
echo "git push -u origin main"
3git push -u origin main
