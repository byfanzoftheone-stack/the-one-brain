# THE ONE — SYSTEM STATE (SOURCE OF TRUTH)

## 🔥 CURRENT STATUS
Frontend: DEPLOYED (Vercel)
Backend: EXPECTED (Railway)
System State: PARTIALLY LIVE

---

## ✅ CONFIRMED WORKING

### API STRUCTURE
- /api/system/overview ✅
- /api/apps/list ✅
- /api/modules ✅
- /api/marketplace ✅
- /api/execute ✅
- /api/agents/logs ✅
- /teacher ✅
- /student ✅

### FRONTEND CALLS (LOCKED)
- fetchSystem → /api/system/overview
- fetchApps → /api/apps/list
- fetchModules → /api/modules
- fetchMarketplace → /api/marketplace
- fetchTeacher → /teacher
- fetchStudent → /student
- fetchAgentLogs → /api/agents/logs

### ROUTER MOUNTS
- marketplace_router ✅
- cycle_router ✅
- modules_router ✅
- apps_router ✅
- builder_router ✅
- companion_router ✅

---

## ❌ CURRENT FAILURE POINT

502 Application failed to respond

CAUSE:
Backend is not responding or misconfigured

---

## 🔧 REQUIRED BACKEND STATE

Railway must:
- be running
- use correct start command:
  sh -lc "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
- have DATABASE_URL set
- expose:
  /api/health
  /docs

---

## 🔗 FRONTEND REQUIREMENT

Vercel ENV:
NEXT_PUBLIC_API_URL=https://YOUR-RAILWAY-URL

NO /api suffix

---

## 🧠 SYSTEM ARCHITECTURE (LOCKED)

Frontend (Vercel)
↓
API Layer (/api/*)
↓
Backend (Railway FastAPI)
↓
Services (modules, marketplace, agents)
↓
Warehouse (logs + memory)

---

## 🚀 NEXT PHASE

When backend is alive:
- seed modules
- seed logs
- activate marketplace installs
- verify execute pipeline
- enable agent runtime visibility

---

## 🧾 RULES (DO NOT BREAK)

1. ALL endpoints must start with /api
2. Frontend always calls via request() wrapper
3. No duplicate module routes
4. Backend must return exact shapes:
   { "modules": [...] }
   { "apps": [...] }
5. One DATABASE_URL only

---

## 📍 HOW TO VERIFY SYSTEM (ANYTIME)

1. Open:
   /api/health

2. If fails → backend down

3. If works → system should render

---

## 🧠 TRUTH

If frontend shows:
- null
- empty
- 502

It is NEVER frontend issue

It is ALWAYS backend or deployment

---

## 🏁 CURRENT GOAL

Get backend responding → unlock full system

