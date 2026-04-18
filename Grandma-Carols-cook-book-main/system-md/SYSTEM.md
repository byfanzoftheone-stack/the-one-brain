# SYSTEM.md — Grandma Carol's Legacy Cookbook
> Single Source of Truth. Nothing drifts. New ideas go to Future Features only.

---

## Project Vision
A mobile-first interactive cookbook and family memory hub celebrating the life of **Carol Williams (1937–2025)**.  
Each grandchild can contribute recipes, photos, videos, and memories — creating a living legacy that grows across generations.

**Core Principle:** Build once, built right, built to last a lifetime.

---

## Stack (LOCKED — DO NOT DRIFT)
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express (Railway) |
| Database | Neon (Postgres) |
| Media Storage | Neon / S3-compatible (photos, videos, interview) |
| Auth | Family invite codes + simple session |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Frontend Pages
1. `/` — Home / Dashboard (welcome, featured recipe, family activity)
2. `/recipes` — Recipe Feed (scrollable, filterable cards)
3. `/recipes/[id]` — Recipe Detail (story, ingredients, steps, photo, video, comments)
4. `/upload` — Upload Recipe / Media (mobile form, device uploads)
5. `/memory-wall` — Memory Wall (photos, videos, Grandma Carol interview)
6. `/profile` — Family Member Profile (recipes contributed, memories shared)

---

## Backend API Endpoints (Railway)
```
GET  /recipes              → All recipes (with filters)
POST /recipes              → Create new recipe + media
GET  /recipes/:id          → Single recipe + media + comments
POST /recipes/:id/comments → Add memory/comment to recipe
GET  /memory-wall          → All legacy photos/videos
POST /memory-wall          → Upload memory media/text
POST /upload               → Media file upload (multipart)
GET  /users/:id            → Family member profile
POST /users                → Register family member
```

---

## Database Schema (Neon/Postgres)
```sql
-- users
id SERIAL PRIMARY KEY
name VARCHAR NOT NULL
profile_photo TEXT
family_code VARCHAR
created_at TIMESTAMP DEFAULT NOW()

-- recipes
id SERIAL PRIMARY KEY
title VARCHAR NOT NULL
ingredients TEXT[] NOT NULL
steps TEXT[] NOT NULL
category VARCHAR NOT NULL   -- 'breakfast' | 'holiday' | 'comfort' | 'baking' | 'snacks' | 'special'
author_id INT REFERENCES users(id)
story_text TEXT
media_urls TEXT[]           -- photos + videos from device
created_at TIMESTAMP DEFAULT NOW()

-- comments
id SERIAL PRIMARY KEY
recipe_id INT REFERENCES recipes(id)
user_id INT REFERENCES users(id)
comment_text TEXT NOT NULL
created_at TIMESTAMP DEFAULT NOW()

-- memory_wall
id SERIAL PRIMARY KEY
title VARCHAR NOT NULL
media_urls TEXT[]
memory_text TEXT
uploaded_by INT REFERENCES users(id)
is_interview BOOLEAN DEFAULT FALSE   -- flag for Carol's 4-min interview
created_at TIMESTAMP DEFAULT NOW()
```

---

## Media Storage
- All photos and videos uploaded directly from device (mobile-first)
- Files stored in Neon / S3-compatible bucket
- URLs stored in Postgres `media_urls[]` fields
- Grandma Carol's 4-minute interview stored as `is_interview = true` in memory_wall

---

## Legacy Rules
1. All new features → Future Features section below, NOT into active build
2. No experimental dependencies without review
3. Every deploy must be tested on mobile first
4. DB and code backups maintained (GitHub = source of truth)
5. No stack drift — this doc is the lock

---

## Future Features / Notes (Post-Birthday Build)
- [ ] Holiday recipe notifications / reminders
- [ ] "Cook Together" shared live video sessions
- [ ] Weekly/monthly cooking challenge leaderboard
- [ ] Classic country playlist integration (Carol's favorites)
- [ ] Printable PDF cookbook export with stories
- [ ] QR codes linking to recipe video clips
- [ ] Family tree integration (recipe → family branch)
- [ ] Legacy timeline (visual timeline of Carol's life)
- [ ] Transcription of interview video (text version)
- [ ] Recipe rating / variation tracking per grandchild

---

## Deployment
**Frontend (Vercel)**
```
NEXT_PUBLIC_API_URL=https://your-railway-backend.railway.app
```

**Backend (Railway)**
```
DATABASE_URL → auto-injected by Railway Postgres plugin (no setup needed)
PORT=3001
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

---

## Versioning
- GitHub repo: source of truth
- Tag releases: `v1.0.0-birthday` for the launch build
- DB migrations run via `db/migrate.js`
