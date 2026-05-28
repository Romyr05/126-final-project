# Gameflix — 10-Minute Defense Cheat Sheet

Memorize these bullets right before you present. Full details: [`DEFENSE_STUDY_GUIDE.md`](./DEFENSE_STUDY_GUIDE.md).

---

## One-liner

**Gameflix (Vault UI)** = full-stack app to **browse games**, **log play status**, **review**, **favorite**, and get **personalized recommendations**.

---

## Stack (say in order)

1. **Next.js 16 + React 19 + TypeScript + Tailwind** → UI (`frontend/`)
2. **FastAPI + Uvicorn** → REST API (`backend/app/main.py`)
3. **Supabase** → Postgres + Auth (`supabase/migrations/`)
4. **IGDB scripts** → seed games (`scripts/fetch_games.py`, `normalize_games.py`)
5. **Deploy:** Vercel (front) + Render (API)

---

## Data flow (draw or say)

```
Browser → lib/api.ts (fetch + cookies)
       → FastAPI routes
       → Supabase tables
```

**Not:** browser → Supabase directly for main features.

---

## Main routes

| URL | What |
|-----|------|
| `/` | Landing — popular games + recent reviews |
| `/catalog` | Search, genre, sort, pagination |
| `/catalog/games_details?...` | Game detail (by slug) |
| `/Journal` | Logs + reviews (login required) |
| `/profile` | Stats, favorites, reviews (login required) |
| `/login`, `/signup` | Auth |

---

## Key files (if asked “where?”)

| Topic | File |
|-------|------|
| All API calls | `frontend/lib/api.ts` |
| Catalog UI logic | `frontend/app/catalog/pageclient.tsx` |
| Server catalog preload | `frontend/app/catalog/page.tsx` |
| FastAPI + CORS | `backend/app/main.py` |
| Login / cookies | `backend/app/routes/auth.py` |
| Protected routes | `backend/app/utils/auth.py` |
| Recommendations | `backend/app/services/recommender.py` |
| Games API | `backend/app/routes/games.py` |
| DB schema | `supabase/migrations/001_create_tables.sql` |
| Journal data | `frontend/hooks/useJournal.ts` |

---

## Database tables (name 5)

`users` · `games` · `reviews` · `favorites` · `game_logs` · (`lists`, `genres`)

**Log statuses:** `played`, `playing`, `completed`, `dropped`, `wishlist`

---

## Auth (30 seconds)

- Login → Supabase `sign_in_with_password` → backend sets **HTTP-only cookies** (`access_token`, `refresh_token`)
- Frontend: `credentials: "include"` on every `request()`
- Protected API: `get_auth_context` reads cookie → validates user

---

## Recommendations (30 seconds)

- Uses user's **reviews, favorites, game_logs**
- Weights **genres/tags** + game quality score
- No activity → **cold start** (top-rated games)
- Endpoint: `GET /recommendations` (must be logged in)

---

## Env vars (production)

| Front (Vercel) | Back (Render) |
|----------------|---------------|
| `NEXT_PUBLIC_API_URL` | `SUPABASE_URL`, keys |
| | `FRONTEND_ORIGINS` |
| | `COOKIE_SECURE=true`, `SAMESITE=none` |

---

## Problems + fixes (panel favorite)

| Problem | Fix |
|---------|-----|
| CORS blocked Vercel → Render | `FRONTEND_ORIGINS` + `CORSMiddleware` |
| Cookies not sent cross-site | `COOKIE_SECURE` + `SameSite=none` |
| API unreachable | Set `NEXT_PUBLIC_API_URL`, check Render is up |
| No games locally | `npx supabase start` + run seed scripts |

---

## Honest gaps (don’t get caught)

- **Lists page** — not fully built
- **Catalog** — filters in Python after loading games (scale limit)
- Game details: developer info **placeholder**

---

## 5-minute script structure

1. Greeting + **Gameflix** name  
2. **Problem** — track & discover games in one place  
3. **Stack** — Next.js, FastAPI, Supabase, IGDB  
4. **Features** — catalog, journal, profile, recommendations  
5. **Flow** — `api.ts` → FastAPI → Supabase, cookies for auth  
6. **Challenges** — CORS, cookies, env vars  
7. **Future** — lists, SQL optimization, more tests  
8. Thank you  

---

## 1-minute emergency version

> Gameflix helps gamers browse a catalog, log what they play, and get recommendations. We use Next.js for the UI, FastAPI for the API, and Supabase for data and login. The frontend calls our backend with fetch and cookies; the backend uses Supabase and a recommender based on reviews, favorites, and logs. We deploy on Vercel and Render and import games from IGDB. Main issues were CORS and secure cookies in production.

---

## If they say “demo it”

1. Open **landing** → games + reviews load  
2. **Catalog** → search + genre filter  
3. **Login** → header shows username  
4. **Journal** → log a game  
5. **Profile** → stats / favorites  
6. Optional: `http://localhost:8000/docs` for API list  

---

## API endpoints to remember

| Method | Path | Auth? |
|--------|------|-------|
| GET | `/games` | No |
| GET | `/games/slug/{slug}` | No |
| POST | `/auth/login` | No |
| GET | `/auth/me` | Cookie |
| GET | `/logs` | Yes |
| POST | `/logs` | Yes |
| GET | `/recommendations` | Yes |
| GET | `/profiles/me` | Yes |

---

*You’ve got this.*
