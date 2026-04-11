# Play Better — Connect With Local Players
**By FanzoftheOne | Dedicated to Tricksack**

## Structure
```
Play-Better/
├── frontend/   → Deploy to Vercel  (Root Directory: frontend)
└── backend/    → Deploy to Railway (Root Directory: backend)
```

## Before deploying — put these in frontend/public/
- `intro.mp4` — your intro video
- `icon.png`  — your Play Better icon (for PWA home screen)

## What's in this build

### Pool Table
- Full 15-ball rack, solids + stripes rendered correctly
- Cue ball scratch FIXED — respawns at baulk line, no alert popup

### Auth System
- Email + password signup/login (stored locally, swap for JWT when ready)
- Admin accounts via secret code at signup
- Each user has their own profile — you cannot change another player's status

### Intro Video
- Plays `/public/intro.mp4` on launch, Skip button included
- Falls back gracefully if file not present

### PWA / Home Screen Icon
- `manifest.json` wired up
- `apple-touch-icon` and `theme-color` set
- On iPhone: Safari → Share → Add to Home Screen

### Ping System
- Bell icon on each player card sends them a notification
- Each user uploads their OWN ping sound from their device (MP3/WAV)
- Sound only plays when THEY are pinged, not on the sender's device

### Tournament Bracket
- Select any players, name the tournament
- Auto-generates pyramid bracket
- Tap a player name to advance them, champion display at the end

### Merch Store
- Admin-only: upload photos, set/edit prices
- Demo Stripe mode — add `STRIPE_PUBLISHABLE_KEY` + price IDs to go live

### Event Board (Flyers)
- Admin-only: upload tournament/event flyers
- All users can see them on the Players tab

## Env Vars

**Railway (backend)**
| Variable | Value |
|---|---|
| `DATABASE_URL` | Auto from Postgres plugin |
| `CORS_ORIGIN` | Your Vercel URL |
| `NODE_ENV` | `production` |

**Vercel (frontend)**
| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway URL |

## Codespaces note
This is TypeScript + Tailwind + Radix/shadcn + Vite.
`npm install && npm run build` in `frontend/` to verify before pushing.
