# THE ONE (TM – FanzoftheOne)

**Project Codename:** THE ONE  
**Inventor/Brand:** Travis Jacobs — TM – FanzoftheOne

This repository is an **authoritative MVP build** implementing the modules referenced in `THE_ONE_Project_Package.pdf`:

- MemoryCore
- CuriosityEngine
- GrowthEngine
- AvatarEngine
- VoiceEngine
- SafetyManager (Ethics enforcement layer)

> This is **NOT** “a chatbot.” It is a **Co‑Evolving Cognitive Companion** with staged development:
Baby → Child → Teen → Adult → Mentor.

---

## 0) What runs where

- **Frontend:** `frontend/` (Vite + React + TypeScript).  
  Runs on Android in Chrome/Firefox; supports “Install app” (PWA).

- **Backend:** `backend/` (Python + FastAPI + SQLite).  
  Runs on Windows 10, Mac, Linux, or Android (Termux) with Python.

No paid services are required for MVP. Optional keys enable better voice/LLM.

---

## 1) Quickstart (Windows 10)

### Backend
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Backend starts on: `http://127.0.0.1:8787`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open: `http://127.0.0.1:5173`

Set the frontend env var (optional) in `frontend/.env`:
```
VITE_API_BASE=http://127.0.0.1:8787
```

---

## 2) Quickstart (Android via Termux)

Install Termux, then:
```bash
pkg update && pkg upgrade -y
pkg install python nodejs git -y

# Backend
cd THE_ONE_full_package/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

In another Termux session:
```bash
cd THE_ONE_full_package/frontend
npm install
npm run dev -- --host 0.0.0.0
```

Then on your phone browser open:
`http://127.0.0.1:5173` (same device)  
or `http://<your-phone-ip>:5173` (if opening from another device).

---

## 3) Non‑negotiable pillars enforced here

1) Never manipulate, deceive, coerce, or override the human  
2) Human is always in control (every “action” is request/confirm)  
3) No hacking/attacking/spying/interference  
4) Emotional & psychological protection (tone, boundaries, escalation)  
5) Bond is private (local-first storage, export/import only by user)

These are enforced by `SafetyManager`:
- content filters
- refusal/redirect logic
- “no‑coercion” and “no‑authority” rules
- age-mode protections (Kid/Teen/Adult/Senior profiles)

---

## 4) Environment variables (optional)

Backend: create `backend/.env`
```
OPENAI_API_KEY=           # optional (enhanced curiosity generation)
ELEVENLABS_API_KEY=       # optional (voice)
```

Frontend: create `frontend/.env`
```
VITE_API_BASE=http://127.0.0.1:8787
```

---

## 5) Folder layout

```
THE_ONE_full_package/
  backend/
    app/
      core/                 # Engines: memory/growth/curiosity/avatar/voice/safety
      api/                  # FastAPI routes
      db/                   # SQLite + models
      main.py
    requirements.txt
  frontend/
    src/
      engines/              # client wrappers, voice (Web Speech), avatar composer
      pages/
      components/
      store/
    package.json
```

---

## 6) MVP features you can test now

- Create a profile + select lifecycle stage (Baby/Child/Teen/Adult/Mentor)
- Upload 3 images to birth the companion avatar (local, private)
- Chat session that returns:
  - a safe response
  - one “Curiosity Question” tailored to stage
  - a Growth update (XP, stage progress)
- Memory capture + search (local SQLite with simple semantic scoring)
- Voice output (Web Speech API) with age‑stage voice parameters

---

## 7) Legal / IP note (non‑legal advice)

This repo contains an **original implementation**.  
If you intend to file trademark/patent, keep dated copies and consider counsel.

