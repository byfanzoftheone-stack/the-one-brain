# THE ONE

Investor-ready monorepo baseline for **THE ONE by FanzofTheOne**.

## Locked structure
- modules/
- backend/
- core/
- frontend/
- agents/
- data/
- deploy/
- docs/
- prompts/

## What was fixed
- Removed drifted nested app uploads from the root pipeline
- Restored the root frontend to **Next.js App Router**
- Kept the backend as the platform API home
- Added a real module catalog and investor demo dashboard shell
- Added deploy configs for Vercel + Railway

## Run locally
### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Primary routes
- Frontend: `/`
- Backend health: `/api/health`
- Backend docs: `/docs`
- Module catalog: `/api/modules/catalog`
