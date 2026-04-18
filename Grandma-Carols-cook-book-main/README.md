# 🌻 Grandma Carol's Legacy Cookbook

> A living digital cookbook and family memory hub in loving memory of **Carol Williams (1937–2025)**.

Mobile-first · Family-only · Built to last a lifetime.

---

## What This Is

A private web app where Carol's grandchildren can:
- Browse and add her recipes — with personal memories and photos attached
- Upload photos and videos directly from their phones
- Watch her **4-minute interview** on the Memory Wall
- Leave notes and memories on every recipe

---

## Project Structure

```
grandma-carol-cookbook/
├── frontend/        → Next.js 14 + Tailwind (deploy to Vercel)
├── backend/         → Node.js + Express (deploy to Railway)
└── system-md/       → SYSTEM.md — the living master doc
```

---

## Deploy Guide

### 1. Set up Railway Backend

1. Push the `backend/` folder to GitHub
2. Create a new Railway project → Deploy from GitHub
3. In Railway, click **+ New** → **Database** → **PostgreSQL**
   - Railway auto-injects `DATABASE_URL` into your backend — nothing to copy or paste
4. Add these environment variables in Railway:

```
FAMILY_CODE=carol2025           ← change this! share with family
SESSION_SECRET=something-long-and-random
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_REGION=us-east-1
STORAGE_BUCKET=your-bucket-name
STORAGE_ACCESS_KEY=your-key
STORAGE_SECRET_KEY=your-secret
STORAGE_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
NODE_ENV=production
```

5. After first deploy, run the migration once via Railway shell:
```bash
node db/migrate.js
```

### 2. Deploy Frontend to Vercel

1. Push `frontend/` to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add one environment variable:
```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### 3. Upload Carol's Interview

After deploying, go to the Memory Wall and tap **✚ Memory**.
Upload the 4-minute video — it will be pinned to the top of the Memory Wall for everyone automatically.

### 4. Share With Family

Send them the Vercel URL + the family code you set as `FAMILY_CODE`.

---

## Family Code
Set in Railway env as `FAMILY_CODE`. Default is `carol2025` — **change it before sharing**. Keep it simple enough for grandma's grandkids to type on their phones.

---

## Future Features (planned post-birthday)
See `system-md/SYSTEM.md` → Future Features section.

---

*Built with love for Carol Williams — 89 years of pure heart, pure love, pure legacy. 💛*
