# Local Development Setup Guide
- FastAPI backend at `http://localhost:8000`
- Next.js frontend at `http://localhost:3000`

First Check your versions:

```bash
node --version
npm --version
python --version
docker --version
```

- `frontend/` - Next.js app
- `backend/` - FastAPI app
- `supabase/` - local Supabase config and migrations
- `scripts/` - optional data import scripts

## 2. Install Frontend Dependencies

Use npm for the commands in this guide because the project has a `package-lock.json`.

```bash
cd frontend
npm install
```

Do not mix npm and pnpm in the same local setup unless the team intentionally standardizes on pnpm.

## 3. Start Local Supabase

Make sure Docker is running first.

From the repository root, start Supabase:

If you installed the Supabase CLI globally, this also works:

```bash
npx supabase start
```

```bash
npx supabase status
```
## 4. Apply Database Migrations

The local database schema lives in `supabase/migrations/`.

```bash
npx supabase db reset
```
this reset the data ha be careful


## 5. Configure Backend Environment

Create `backend/.env.local` from the example:

```bash
cd backend
cp .env.example .env.local
```

Edit `backend/.env.local`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<anon key from supabase status>
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase status>
```

The backend loads this file automatically from `backend/.env.local`.

## 6. Set Up the Backend

From `backend/`, create and activate a virtual environment:

```bash
cd /home/romyr/CODING/Requirements/Web/CMSC_126/126-final-project/backend
python -m venv .venv
source .venv/bin/activate
```

Install Python dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Run the backend:

```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend API docs are available at:

- `http://localhost:8000/docs`

## 7. Configure Frontend Environment

Create `frontend/.env.local` from the example:

```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase status>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon key from supabase status>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use the same local anon key for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## 8. Run the Frontend

From `frontend/`:

```bash
cd /home/romyr/CODING/Requirements/Web/CMSC_126/126-final-project/frontend
npm run dev
```

## 10. Seed Game Data With Scripts

these seeds are the games already

- `scripts/fetch_games.py` fetches game data from IGDB/Twitch and writes `data/raw/games_raw.json`
- `scripts/normalize_games.py` reads `data/raw/games_raw.json` and inserts normalized rows into local Supabase

You do not need to run these scripts every time you start the app. Run them after a fresh database reset when you need local game data.

Create `scripts/.env.local`:

```bash
cd scripts
cp .env.example .env.local
```

Edit it with your Twitch/IGDB credentials and local Supabase values:

```env
TWITCH_CLIENT_ID=<twitch client id>
TWITCH_CLIENT_SECRET=<twitch client secret>
grant_type=client_credentials
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service_role key from supabase status>
```

Run from the repository root:

```bash
python scripts/fetch_games.py
python scripts/normalize_games.py
```

these will put those games into the supabase 

if you want to check those kadto sa studio and then tinker a bit on the sql editor