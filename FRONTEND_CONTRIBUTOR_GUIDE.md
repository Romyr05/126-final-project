# Frontend Contributor Guide

## 1. What This App Is

Gameflix is a web app for video game discovery and personal game tracking. The repository shows a frontend, a Python backend, Supabase database migrations, data import scripts, and project documentation.

In plain English, the app is meant to let people browse games, view game details, search games, save favorites, log play status, write reviews, create game lists, manage a profile, and eventually get recommendations.

The exact finished product is unclear from the repository because the current frontend is still mostly a scaffold. The root route at `frontend/app/page.tsx` only renders:

```tsx
<h1>Hello, Next.js! TEST CI CD</h1>
```

The `Journal` and `LandingPage` pages currently return `null`, and several planned route folders only contain `.gitkeep` files. The backend and database make the intended app purpose much clearer than the current UI.

Who uses it:

- Regular users who want to discover, review, favorite, log, and organize games.
- Teammates building the frontend screens for those actions.
- Backend/database teammates who expose game, user, review, list, log, favorite, and recommendation data.

Main user flow, inferred from files:

1. A user opens the frontend.
2. The frontend eventually shows a landing page or game browsing page.
3. The user browses or searches games.
4. The user opens a game detail page.
5. If logged in, the user can favorite the game, log a status, review it, or add it to a list.
6. The frontend calls the FastAPI backend, and the backend reads or writes Supabase data.

What the frontend is responsible for:

- Defining pages and routes with Next.js App Router files under `frontend/app`.
- Rendering React UI.
- Calling backend API endpoints through `frontend/lib/api.ts`.
- Creating Supabase browser clients through `frontend/lib/supabaseClient.ts` for future auth/session work.
- Showing loading, success, empty, and error states.
- Keeping UI changes organized in reusable components under `frontend/components`.
- Protecting users from confusing states, such as blank screens, failed API calls, or missing login state.

## 2. Big Picture Architecture

This project is split into several top-level areas:

- `frontend/`: Next.js, React, TypeScript frontend.
- `backend/`: FastAPI Python backend.
- `supabase/`: Supabase local config and SQL migrations.
- `scripts/`: Python scripts for fetching and normalizing game data.
- `data/`: raw and processed game data.
- `docs/`: setup notes.

Frontend framework:

- The frontend uses Next.js `16.2.4`.
- It uses React `19.2.4`.
- It uses TypeScript.
- It has Tailwind CSS `4.x` dependencies and a PostCSS plugin, but there is no global CSS file currently importing Tailwind.

Important Next.js note:

- This repo has an `AGENTS.md` warning that this Next.js version may have breaking changes.
- The local docs in `frontend/node_modules/next/dist/docs/` show that this project uses the App Router.
- In the App Router, folders under `app/` define route segments, and a route only becomes visible when it has a `page.tsx` or `route.ts` file.

Backend/API relationship:

- The frontend can call the FastAPI backend through `frontend/lib/api.ts`.
- `frontend/lib/api.ts` reads `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000`.
- The backend app lives in `backend/app/main.py`.
- The backend registers routers for games, favorites, lists, logs, recommendations, reviews, and users.
- The backend uses Supabase for data storage and auth-aware queries.

Where frontend code lives:

- Routes and page components: `frontend/app`.
- Reusable components: `frontend/components`.
- Frontend helpers: `frontend/lib`.
- Future hooks: `frontend/hooks`.
- Future shared TypeScript types: `frontend/types`.
- Public static files: `frontend/public`.

Where shared code lives:

- Frontend API helpers are in `frontend/lib`.
- Backend validation schemas are in `backend/app/schemas`.
- Database contracts are mostly visible in `supabase/migrations`.
- There is no shared generated TypeScript API client yet.

Where configuration files live:

- Frontend scripts/dependencies: `frontend/package.json`.
- Frontend TypeScript config: `frontend/tsconfig.json`.
- Frontend Next config: `frontend/next.config.ts`.
- Frontend ESLint config: `frontend/eslint.config.mjs`.
- Frontend PostCSS/Tailwind plugin config: `frontend/postcss.config.mjs`.
- Frontend environment example: `frontend/.env.example`.
- Backend dependencies: `backend/requirements.txt`.
- Backend environment example: `backend/.env.example`.
- Supabase local config: `supabase/config.toml`.
- CI config: `.github/workflows/ci.yml`.

How data likely moves through the app:

1. A React page or component renders in the browser or on the Next.js server.
2. It calls a helper such as `getGames()` from `frontend/lib/api.ts`.
3. The helper calls the FastAPI backend at `NEXT_PUBLIC_API_URL`.
4. The backend route queries Supabase.
5. Supabase returns rows.
6. FastAPI returns JSON.
7. The frontend renders that JSON as UI.

For protected user actions, the backend expects an `Authorization: Bearer <access token>` header. The current frontend API helper does not attach this token yet, so future auth-related frontend work must add that carefully.

## 3. Repository Map

| Path | Purpose | When to edit | Be careful about |
|---|---|---|---|
| `README.md` | Root overview of the project layout and basic commands. | Update when project setup or folder responsibilities change. | Keep commands accurate. The root has no `package.json`; frontend commands must run from `frontend/`. |
| `docs/setup-guide.md` | Short setup notes for frontend and backend. | Update when setup changes. | Do not duplicate secrets or outdated commands. |
| `frontend/` | Main Next.js frontend project. | Most frontend work starts here. | Run Node commands from this directory, not the repo root. |
| `frontend/package.json` | Frontend dependencies and npm scripts. | Add dependencies or scripts here. | Package manager is mixed because both npm and pnpm lockfiles exist. Coordinate before changing lockfiles. |
| `frontend/package-lock.json` | npm lockfile. | Changes when using `npm install`. | Do not manually edit. Avoid changing both npm and pnpm lockfiles accidentally. |
| `frontend/pnpm-lock.yaml` | pnpm lockfile. | Changes when using `pnpm install`. | The README uses npm, so ask the team before switching package managers. |
| `frontend/pnpm-workspace.yaml` | pnpm workspace/config file. | Rarely. | Current content only lists ignored built dependencies, not workspace packages. |
| `frontend/app/` | Next.js App Router route tree. | Add pages, layouts, loading states, and route-specific UI. | A folder is not a public route until it has `page.tsx` or `route.ts`. |
| `frontend/app/layout.tsx` | Root layout wrapping every route. | Add global providers, global CSS import, app-wide shell, metadata later. | Root layout must keep `<html>` and `<body>`. Avoid making the whole app a Client Component unless required. |
| `frontend/app/page.tsx` | Home route at `/`. | Change the first screen users see. | Currently a placeholder. Keep it simple until real landing or browse UI exists. |
| `frontend/app/Journal/page.tsx` | Route at `/Journal`. Currently returns `null`. | Build a journal/logging page if this route stays. | Uppercase route names create uppercase URLs. Decide as a team before renaming. |
| `frontend/app/LandingPage/page.tsx` | Route at `/LandingPage`. Currently returns `null`. | Build a landing page if this route stays. | Uppercase URL. Consider whether `/` should become the landing page instead. |
| `frontend/app/games/` | Planned games route folder. | Add `page.tsx` for a games browse page. | Currently only `.gitkeep`; no route exists yet. |
| `frontend/app/games/[gameId]/` | Planned dynamic game detail route. | Add `page.tsx` for game detail pages. | Backend `GET /games/{game_id}` expects a UUID. Use `/games/slug/{slug}` if using slugs. |
| `frontend/app/recommendations/` | Planned recommendations route folder. | Add recommendations UI after backend is ready. | Backend currently returns `"TBD"`, not real recommendation data. |
| `frontend/app/login/` | Planned login route folder. | Add login page. | No `page.tsx` yet. Coordinate with Supabase auth helpers. |
| `frontend/app/register/` | Planned register route folder. | Add signup page. | No `page.tsx` yet. Signup must create/check `public.users` through Supabase trigger. |
| `frontend/app/profile/` | Planned profile route folder. | Add profile page. | Protected backend route is `GET/PATCH /users/me`. Needs bearer token. |
| `frontend/app/lists/` | Planned lists route folder. | Add user/public list pages. | Backend has protected and public list routes with different auth requirements. |
| `frontend/components/` | Reusable React components. | Add shared UI such as game cards, forms, buttons, layout sections. | Currently empty except `.gitkeep`; keep components small and named clearly. |
| `frontend/components/Journal/` | Planned Journal-specific components. | Add components used only by the Journal page. | Empty now. Avoid adding route files here; route files belong in `app/`. |
| `frontend/components/landingPage/` | Planned landing-page components. | Add components used only by landing page UI. | Empty now. Folder casing differs from route casing. |
| `frontend/lib/api.ts` | Fetch helper for FastAPI calls. | Add frontend API helper functions. | Current helper throws on non-2xx and does not attach auth tokens. |
| `frontend/lib/supabaseClient.ts` | Browser Supabase client factory. | Use for client-side auth/session features. | Requires public Supabase URL and anon key. Do not put service role keys in browser code. |
| `frontend/lib/supabase/legacy/` | Older Supabase SSR/admin helper files. | Inspect before building auth middleware or server-side auth. | Some files use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `admin.ts` uses service role and is server-only. |
| `frontend/hooks/` | Placeholder for future custom React hooks. | Add reusable frontend logic like `useGameSearch`. | Hooks that use state/effects require Client Components. |
| `frontend/types/` | Placeholder for future shared frontend types. | Add TypeScript types for API responses and props. | Keep types aligned with backend schemas and migrations. |
| `frontend/public/` | Static assets served by Next.js. | Add images/icons that can be referenced by URL. | Do not store secrets or huge raw data here. Anything in `public` is visible to users. |
| `frontend/public/images/` | Planned image assets folder. | Add UI images. | Currently empty except `.gitkeep`. Prefer optimized images and clear filenames. |
| `frontend/next.config.ts` | Next.js config. | Add Next-specific settings only when needed. | Currently empty. Read local Next docs before changing config. |
| `frontend/tsconfig.json` | TypeScript config. | Rarely; update paths or strictness if team agrees. | `strict: true` is enabled. Import alias `@/*` maps to `frontend/*`. |
| `frontend/eslint.config.mjs` | ESLint config. | Adjust lint rules if needed. | Uses Next core web vitals and TypeScript config. |
| `frontend/postcss.config.mjs` | PostCSS config for Tailwind. | Edit only when changing CSS tooling. | Tailwind plugin is configured, but no Tailwind CSS file is imported yet. |
| `frontend/.env.example` | Frontend environment variable template. | Add new public frontend variables here. | Do not include real secret values. Use `NEXT_PUBLIC_` only for values safe in the browser. |
| `backend/app/main.py` | FastAPI app and CORS setup. | Frontend contributors may inspect when debugging API/CORS. | CORS currently allows local port 3000 only. |
| `backend/app/routes/` | Backend API route modules. | Inspect to learn endpoints and response shapes. | Do not change backend behavior casually from frontend work. |
| `backend/app/schemas/` | Pydantic request validation schemas. | Inspect to know request body fields. | Frontend forms must send values that match these schemas. |
| `backend/app/utils/auth.py` | Bearer-token auth helper. | Inspect when building protected frontend requests. | Protected API calls need valid Supabase access tokens. |
| `backend/app/database/supabase_client_backend.py` | Backend Supabase client setup. | Inspect for env requirements. | Service role key must stay server-side. |
| `backend/tests/` | Backend pytest tests. | Run when changing backend contracts or auth assumptions. | Current CI only runs backend tests, not frontend checks. |
| `supabase/migrations/` | SQL database schema and policies. | Inspect to understand tables and columns. | Migrations are risky after they have been applied. Coordinate before editing. |
| `scripts/` | Data fetching and normalization scripts. | Use for importing IGDB/Twitch data into Supabase. | Scripts use service role and Twitch credentials. Do not expose those values. |
| `data/raw/` | Raw game data. | Usually not edited by frontend contributors. | Large/generated data is ignored by git in some cases. |
| `.github/workflows/ci.yml` | GitHub Actions CI. | Update when adding frontend CI checks. | Currently only installs backend dependencies and runs pytest. |
| `.gitignore` | Ignored generated files, env files, dependencies, caches. | Update when new generated files appear. | Do not remove env/build ignores unless you know why. |
| `.next/` and `frontend/.next/` | Next.js build/dev output. | Never edit manually. | Generated. Delete/regenerate only if debugging build cache issues. |

## 4. How To Run The App Locally

### Required tools

Frontend:

- Node.js `>=20.9.0`. This requirement comes from `frontend/node_modules/next/package.json`.
- npm, because the README and setup guide use npm and `frontend/package-lock.json` exists.
- A terminal running from `frontend/` for frontend commands.

Backend:

- Python 3.12 is used locally in this workspace.
- pip.
- Backend dependencies from `backend/requirements.txt`.
- Supabase credentials in `backend/.env.local`.

Optional but useful:

- Supabase CLI and Docker if you run Supabase locally.
- A hosted Supabase project if you do not run Supabase locally.
- Browser devtools for frontend debugging.

### Important local environment note

In this environment, frontend commands could not run because `node` was not available and `npm` reported:

```text
WSL 1 is not supported. Please upgrade to WSL 2 or above.
Could not determine Node.js install directory
```

If you see that, install Node.js inside the Linux environment or move to WSL 2. Do not debug the app until the Node toolchain itself works.

### Install frontend dependencies

From the repo root:

```bash
cd frontend
npm install
```

Use npm unless the team decides to standardize on pnpm. The repository currently has both `package-lock.json` and `pnpm-lock.yaml`, which is a sign that the package manager has not been standardized yet.

### Create frontend environment variables

From the repo root:

```bash
cd frontend
cp .env.example .env.local
```

Then edit `frontend/.env.local` with real local values. Do not commit `frontend/.env.local`.

Recommended formatting:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-supabase-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If using hosted Supabase, `NEXT_PUBLIC_SUPABASE_URL` will look more like:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
```

### Start the frontend dev server

From `frontend/`:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port 3000 is busy, Next.js may use another port. Read the terminal output and open the URL it prints.

### Stop the frontend dev server

Press:

```text
Ctrl+C
```

in the terminal running `npm run dev`.

### Install backend dependencies

From the repo root:

```bash
cd backend
python -m pip install -r requirements.txt
```

Using a virtual environment is recommended:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

### Create backend environment variables

From the repo root:

```bash
cd backend
cp .env.example .env.local
```

Then fill in values. Do not commit real secrets.

### Start the backend API

The backend has no package script, but `backend/app/main.py` defines a FastAPI app named `app`. A typical local command is:

```bash
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open:

```text
http://127.0.0.1:8000
http://127.0.0.1:8000/docs
```

The `/docs` page is FastAPI's interactive API documentation.

### Common startup errors

| Error | What it usually means | How to fix |
|---|---|---|
| `cat: package.json: No such file or directory` at repo root | The root has no frontend package file. | Run frontend commands from `frontend/`. |
| `node: command not found` | Node.js is not installed or not in PATH. | Install Node.js `>=20.9.0` in the environment where you run commands. |
| `WSL 1 is not supported` | The Node/npm installation is not usable in WSL 1. | Use WSL 2 or install a compatible Linux Node.js version. |
| `Missing NEXT_PUBLIC_SUPABASE_URL...` | Frontend Supabase env values are missing. | Fill `frontend/.env.local`. Restart `npm run dev`. |
| `Missing Dependency so either...` from backend | Backend Supabase env values are missing. | Fill `backend/.env.local`. Restart backend. |
| Browser CORS error | Frontend origin is not allowed by backend. | Use `http://localhost:3000` or `http://127.0.0.1:3000`, or update backend CORS intentionally. |
| `API request failed: 404` | Frontend called a route the backend does not have, or used wrong ID format. | Check `backend/app/routes/*` and FastAPI `/docs`. |
| Network `ECONNREFUSED` or failed fetch | Backend is not running or `NEXT_PUBLIC_API_URL` is wrong. | Start backend on port 8000 or update env. |
| Port already in use | Another process is using the port. | Stop the other process or use a different port and update env/CORS. |

## 5. Environment Variables

Do not print or commit real secrets. This section lists variable names and safe examples only.

### Frontend variables

These appear in `frontend/.env.example`, `frontend/lib/api.ts`, `frontend/lib/supabaseClient.ts`, and legacy Supabase helpers.

| Name | What it controls | Required? | Safe example | Where used | If missing |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL used by browser/server Supabase clients. | Required when using Supabase features. | `http://127.0.0.1:54321` or `https://project-ref.supabase.co` | `frontend/lib/supabaseClient.ts`, `frontend/lib/supabase/legacy/*` | Supabase client creation can fail or use `undefined`. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public Supabase key used by legacy SSR helpers. | Required only if those legacy helpers are used. | `eyJ...public-key` | `frontend/lib/supabase/legacy/server.ts`, `middleware.ts`, `proxy.ts` | Legacy SSR auth helpers fail. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase anon key used by the active browser client. | Required when using `createClient()` from `frontend/lib/supabaseClient.ts`. | `eyJ...anon-key` | `frontend/lib/supabaseClient.ts` | Browser Supabase client fails. |
| `NEXT_PUBLIC_API_URL` | Base URL for FastAPI requests. | Optional because code defaults to `http://localhost:8000`, but recommended. | `http://localhost:8000` | `frontend/lib/api.ts` | Frontend calls `http://localhost:8000`. This is fine locally, wrong in production. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase admin key. | Not required for normal frontend. Only used by `legacy/admin.ts`. | No safe public example. | `frontend/lib/supabase/legacy/admin.ts` | Admin helper throws if called. Never expose this to browser code. |

Notes:

- Variables beginning with `NEXT_PUBLIC_` are bundled into browser JavaScript. Only put public values there.
- The service role key is a secret. It must never be used in a Client Component or exposed to users.
- `frontend/.env.example` currently has spaces around `NEXT_PUBLIC_SUPABASE_ANON_KEY = ...`. Prefer no spaces around `=` for consistency.

### Backend variables

These appear in `backend/.env.example` and `backend/app/database/supabase_client_backend.py`.

| Name | What it controls | Required? | Safe example | Where used | If missing |
|---|---|---|---|---|---|
| `SUPABASE_URL` | Backend Supabase project URL. | Yes. | `http://127.0.0.1:54321` or `https://project-ref.supabase.co` | `backend/app/database/supabase_client_backend.py` | Backend raises a runtime error on import. |
| `SUPABASE_ANON_KEY` | Backend anon key for public/user-scoped Supabase clients. | Yes. | `eyJ...anon-key` | `create_user_supabase`, `supabase_public` | Public and user-scoped backend routes cannot work. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend admin key. | Yes in current backend client file because it creates `supabase_admin`. | No safe public example. | `supabase_admin` in backend client setup | Backend raises a runtime error on import. Keep secret. |

### Script variables

These appear in `scripts/.env.example`, `scripts/fetch_games.py`, and `scripts/normalize_games.py`.

| Name | What it controls | Required? | Safe example | Where used | If missing |
|---|---|---|---|---|---|
| `TWITCH_CLIENT_ID` | Twitch app client ID for IGDB API access. | Required for `fetch_games.py`. | `your-client-id` | `scripts/fetch_games.py` | Script raises an error or Twitch request fails. |
| `TWITCH_CLIENT_SECRET` | Twitch app client secret for IGDB API access. | Required for `fetch_games.py`. | No safe public example. | `scripts/fetch_games.py` | Script raises an error or token request fails. |
| `grant_type` | OAuth grant type for Twitch token request. | Required by current script params. | `client_credentials` | `scripts/fetch_games.py` | Token request may fail. Note the variable is lowercase. |
| `SUPABASE_URL` | Supabase URL for data normalization. | Required for `normalize_games.py`. | `https://project-ref.supabase.co` | `scripts/normalize_games.py` | Script raises an error. |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for batch upserts into Supabase. | Required for `normalize_games.py`. | No safe public example. | `scripts/normalize_games.py` | Script raises an error. Keep secret. |

### Supabase config optional references

These appear in `supabase/config.toml`, mostly as optional or disabled provider settings.

| Name | What it controls | Required? | Where used | If missing |
|---|---|---|---|---|
| `OPENAI_API_KEY` | Supabase Studio AI helper. | Optional. | `[studio] openai_api_key` | Studio AI features unavailable. |
| `SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN` | Twilio SMS auth token. | Optional because Twilio SMS is disabled. | `[auth.sms.twilio]` | No effect unless Twilio SMS is enabled. |
| `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` | Apple OAuth secret. | Optional because Apple auth is disabled. | `[auth.external.apple]` | No effect unless Apple auth is enabled. |
| `S3_HOST` | Experimental S3 host. | Optional. | `[experimental]` | No effect unless experimental S3 features are used. |
| `S3_REGION` | Experimental S3 region. | Optional. | `[experimental]` | No effect unless experimental S3 features are used. |
| `S3_ACCESS_KEY` | Experimental S3 access key. | Optional. | `[experimental]` | No effect unless experimental S3 features are used. |
| `S3_SECRET_KEY` | Experimental S3 secret key. | Optional. | `[experimental]` | No effect unless experimental S3 features are used. |
| `SENDGRID_API_KEY` | Commented example for SMTP. | Optional/commented. | `supabase/config.toml` comments | No effect unless SMTP config is enabled. |

## 6. Frontend Mental Model

### Where the app starts

Next.js starts with `frontend/app/layout.tsx` and `frontend/app/page.tsx`.

- `layout.tsx` wraps every route.
- `page.tsx` inside `app/` becomes the `/` route.

Current root layout:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

This means every page is rendered inside `<body>{children}</body>`.

### How pages and routes are defined

This frontend uses the Next.js App Router.

Simple rule:

- Folder name = URL segment.
- `page.tsx` inside a folder = visible page for that URL.
- No `page.tsx` = not a visible page.

Examples in this repo:

- `frontend/app/page.tsx` creates `/`.
- `frontend/app/Journal/page.tsx` creates `/Journal`.
- `frontend/app/LandingPage/page.tsx` creates `/LandingPage`.
- `frontend/app/games/` does not create `/games` yet because it has no `page.tsx`.
- `frontend/app/games/[gameId]/` is planned for dynamic game detail URLs, but it has no `page.tsx` yet.

Next.js 16 local docs also show that dynamic route params are passed as async route props in examples, such as `params: Promise<{ slug: string }>`. Check `frontend/node_modules/next/dist/docs/` before implementing more advanced App Router features.

### How components are organized

Current component folders exist but are empty:

- `frontend/components/Journal/`
- `frontend/components/landingPage/`

Beginner-friendly pattern:

- Put route files in `frontend/app`.
- Put reusable UI in `frontend/components`.
- Put API and Supabase helpers in `frontend/lib`.
- Put custom hooks in `frontend/hooks`.
- Put shared types in `frontend/types`.

### How data is fetched

The only active API helper is `frontend/lib/api.ts`.

It defines:

- `request<T>(path, init)`
- `getGames<T>()`
- `getGame<T>(gameId)`
- `getRecommendations<T>()`

The helper:

1. Builds a URL from `NEXT_PUBLIC_API_URL`.
2. Calls `fetch`.
3. Adds `Content-type: application/json`.
4. Throws an error if the response is not OK.
5. Returns parsed JSON.

Important limitation:

- It does not currently attach Supabase access tokens.
- Protected backend routes such as `/favorites`, `/logs`, `/reviews/me`, `/lists`, and `/users/me` need a bearer token.

### How state is managed

There is no global state library in the frontend right now.

No Redux, Zustand, Jotai, MobX, or React Context provider is currently used.

For future work:

- Use local React state for one component's UI state.
- Use URL/search params for shareable filters like game search.
- Use Supabase session state for logged-in user features.
- Add a Context provider only when many components need the same state.

### How forms work

No frontend forms are implemented yet.

Backend schemas show likely form requirements:

- Review form: `game_id`, `rating` from 1 to 5, optional `review_text`.
- Log form: `game_id`, `status` with one of `played`, `playing`, `completed`, `dropped`, `wishlist`.
- List form: `list_name`, optional `description`, `is_public`.
- User profile form: `username`.

### How styling works

Tailwind CSS is installed and PostCSS is configured:

- `tailwindcss`
- `@tailwindcss/postcss`
- `frontend/postcss.config.mjs`

However, there is no `frontend/app/globals.css`, and `frontend/app/layout.tsx` does not import global CSS. That means Tailwind utilities are not fully wired into visible app CSS yet.

Future setup likely needs:

```css
@import "tailwindcss";
```

inside `frontend/app/globals.css`, then:

```tsx
import "./globals.css"
```

inside `frontend/app/layout.tsx`.

### How assets/images/icons are handled

Static files should go in `frontend/public`.

Example:

- File: `frontend/public/images/game-placeholder.png`
- Browser path: `/images/game-placeholder.png`

There is no icon library installed right now. If the team wants icons, add one intentionally and document it.

### How errors/loading states are handled

No route-level `loading.tsx` or `error.tsx` files exist yet.

Future options:

- Add `loading.tsx` beside a route page for route-level loading UI.
- Add `error.tsx` beside a route page for route-level error UI.
- Use `try/catch` around client-side API calls.
- Show clear empty states when arrays are empty.

## 7. Main User Flows

### Flow 1: Open the current home page

What the user does:

- Opens `/`.

Route:

- `frontend/app/page.tsx`

Components involved:

- Only the default exported `Page` component.

API calls or data files:

- None.

State changes:

- None.

Success looks like:

- The page shows `Hello, Next.js! TEST CI CD`.

Failure might look like:

- Next.js dev server is not running.
- Browser shows a build/runtime error.

### Flow 2: Open placeholder route pages

What the user does:

- Opens `/Journal` or `/LandingPage`.

Routes:

- `frontend/app/Journal/page.tsx`
- `frontend/app/LandingPage/page.tsx`

Components involved:

- `JournalPage`
- `LandingPage`

API calls or data files:

- None.

State changes:

- None.

Success looks like:

- Technically the route renders, but it is blank because both components return `null`.

Failure might look like:

- A teammate thinks the page is broken. It is currently intentionally empty from the code.

### Flow 3: Browse games

Status:

- Likely intended, not implemented in the frontend yet.

Evidence:

- `frontend/app/games/` exists.
- `frontend/lib/api.ts` has `getGames<T>()`.
- Backend has `GET /games`.
- Database has `public.games`.

What the user does:

- Opens a games browsing page.
- Views a list of games.

Route likely to handle it:

- Future `frontend/app/games/page.tsx`.

Components likely involved:

- Future `GameCard`.
- Future `GameGrid` or `GameList`.
- Future loading/error/empty state components.

API calls involved:

- `getGames<T>()` from `frontend/lib/api.ts`, which calls `GET /games`.

Backend response shape:

```ts
{
  count: number
  games: Array<{
    game_id: string
    igdb_id: number
    title: string
    description: string | null
    release_year: number | null
    external_rating: number | null
    avg_user_rating: number | null
    cover_image: string | null
    slug?: string | null
  }>
}
```

This shape is inferred from `backend/app/routes/games.py` and `supabase/migrations`.

State changes:

- Possibly loading, error, and game list state.
- Possibly page/search query state later.

Success looks like:

- A list/grid of games appears.

Failure might look like:

- Backend is down.
- Supabase env is missing.
- API returns empty games.
- Frontend expects the wrong response shape.

### Flow 4: Search games

Status:

- Backend exists, frontend helper does not exist yet.

Evidence:

- Backend has `GET /games/search?q=...`.

What the user does:

- Types a game title into a search box.

Route likely to handle it:

- Future `frontend/app/games/page.tsx`.

Components likely involved:

- Future `SearchInput`.
- Future `GameList`.

API calls involved:

- Future helper such as `searchGames<T>(query: string)`.
- Backend route: `GET /games/search?q=<query>`.

State changes:

- Search text.
- Loading state while searching.
- Result list.
- Error state if request fails.

Success looks like:

- Matching games appear.

Failure might look like:

- Empty results.
- Validation error if `q` is empty because backend requires minimum length 1.

### Flow 5: View game details

Status:

- Likely intended, not implemented in the frontend yet.

Evidence:

- `frontend/app/games/[gameId]/` exists.
- `frontend/lib/api.ts` has `getGame<T>(gameId)`.
- Backend has `GET /games/{game_id}`, `GET /games/slug/{slug}`, and `GET /games/igdb/{igdb_id}`.

What the user does:

- Clicks a game from a list.
- Opens a detail page.

Route likely to handle it:

- Future `frontend/app/games/[gameId]/page.tsx`.

Components likely involved:

- Future `GameDetails`.
- Future `ReviewList`.
- Future `FavoriteButton`.
- Future `LogStatusControl`.

API calls involved:

- `getGame<T>(gameId)` for UUID IDs.
- Future `getGameBySlug<T>(slug)` if URLs use slugs.
- Future review calls to `GET /reviews/game/{game_id}`.

State changes:

- Loaded game data.
- Possibly favorite/review/log state if the user is logged in.

Success looks like:

- Title, description, release year, cover image, rating, reviews, and user actions appear.

Failure might look like:

- 404 if `gameId` is not a UUID and the UUID route is used.
- Missing image if `cover_image` is null.
- Protected actions fail if no bearer token is sent.

### Flow 6: Login/register/profile

Status:

- Route folders exist, but pages are not implemented.

Evidence:

- `frontend/app/login/`
- `frontend/app/register/`
- `frontend/app/profile/`
- Supabase frontend helpers exist.
- Backend has `GET /users/me` and `PATCH /users/me`.

What the user does:

- Registers or logs in.
- Views or updates their profile.

Routes likely to handle it:

- Future `frontend/app/login/page.tsx`
- Future `frontend/app/register/page.tsx`
- Future `frontend/app/profile/page.tsx`

Components likely involved:

- Future auth forms.
- Future profile form.

API calls involved:

- Supabase auth calls through a Supabase client.
- Backend `GET /users/me` and `PATCH /users/me` after login.

State changes:

- Supabase session.
- Current user/profile data.
- Form state.

Success looks like:

- User is logged in.
- `public.users` profile row exists.
- Protected backend calls return the user's data.

Failure might look like:

- Invalid login.
- Missing Supabase env.
- Missing `public.users` row if trigger migration has not been applied.
- Protected API returns 401 if bearer token is missing or invalid.

### Flow 7: Favorites, logs, reviews, and lists

Status:

- Backend exists, frontend screens are not implemented.

Evidence:

- Backend route files exist for `favorites`, `logs`, `reviews`, and `lists`.
- Database tables exist for `favorites`, `game_logs`, `reviews`, `lists`, and `list_items`.
- Planned frontend route folders exist for `lists` and `Journal`.

What the user does:

- Favorites a game.
- Logs a game status.
- Writes or edits a review.
- Creates a list and adds games to it.

Routes likely to handle it:

- Future game detail page.
- Future journal/log page.
- Future lists pages.
- Future profile page.

API calls involved:

- `GET/POST/DELETE /favorites`
- `GET/POST/PATCH/DELETE /logs`
- `GET/POST/PATCH/DELETE /reviews`
- `GET/POST/PATCH/DELETE /lists`

State changes:

- Favorite status.
- Log status.
- Review form values.
- Lists and list items.

Success looks like:

- UI updates after the backend confirms the change.
- Reloading the page shows the saved data.

Failure might look like:

- 401 if not logged in.
- 403 if trying to edit another user's list.
- 404 if item does not exist.
- 409 if creating a duplicate review.

### Flow 8: Recommendations

Status:

- Placeholder only.

Evidence:

- `frontend/app/recommendations/` exists.
- `frontend/lib/api.ts` has `getRecommendations<T>()`.
- Backend `GET /recommendations` returns `"TBD"`.

What the user does:

- Opens recommendations page.

Route likely to handle it:

- Future `frontend/app/recommendations/page.tsx`.

Components likely involved:

- Future recommendation cards/list.

API calls involved:

- `getRecommendations<T>()`.

State changes:

- Recommendation list loading/error state.

Success looks like:

- Unclear from the repository because recommendation logic is not implemented.

Failure might look like:

- UI expecting an array but receiving the string `"TBD"`.

## 8. Component Guide

The frontend currently has very few implemented React components. This section documents the current components and important frontend modules.

| File path | What it renders or provides | Props or inputs | State it owns | Uses | Common reasons to edit | Safe beginner-friendly changes |
|---|---|---|---|---|---|---|
| `frontend/app/layout.tsx` | Root HTML shell for all pages. | `children: React.ReactNode` | None | React types | Add global CSS import, app-wide providers, shared nav/footer later. | Add `<main>{children}</main>` inside `<body>` or import `./globals.css` after adding the CSS file. |
| `frontend/app/page.tsx` | Home page at `/`. Currently one heading. | None | None | Nothing | Replace placeholder with real home/landing/browse UI. | Change heading text, add simple links, add a small static section. |
| `frontend/app/Journal/page.tsx` | Route at `/Journal`, currently blank. | None | None | Nothing | Build journal/logging screen. | Return a placeholder heading while the real page is planned. |
| `frontend/app/LandingPage/page.tsx` | Route at `/LandingPage`, currently blank. | None | None | Nothing | Build landing page. | Return simple static content or redirect plan after team decides. |
| `frontend/lib/api.ts` | API helper functions for FastAPI. | `path`, optional `RequestInit`, generic response type `T` | None | `fetch`, `process.env.NEXT_PUBLIC_API_URL` | Add new backend endpoint helpers. | Add `searchGames<T>(q: string)` using `request<T>(...)`. |
| `frontend/lib/supabaseClient.ts` | Creates a browser Supabase client. | Env vars | None | `@supabase/ssr` | Use for login/register/session features. | Import it into a Client Component auth form. |
| `frontend/lib/supabase/legacy/server.ts` | Creates Supabase SSR client using cookies. | Request cookies through `next/headers` | Cookie writes through Supabase helper | `@supabase/ssr`, `next/headers` | Server-side auth/session work. | Inspect only until auth architecture is agreed. |
| `frontend/lib/supabase/legacy/middleware.ts` | Session update/redirect helper for middleware-style auth. | `NextRequest` | Cookies/session response | `NextResponse`, Supabase SSR | Protected route middleware. | Do not use blindly; paths redirect to `/auth/login` while app route folder is `/login`. |
| `frontend/lib/supabase/legacy/proxy.ts` | Similar session update helper with slightly different cookie signature. | `NextRequest` | Cookies/session response | `NextResponse`, Supabase SSR | Possible Next 16 proxy/middleware pattern. | Compare with current Next docs before using. |
| `frontend/lib/supabase/legacy/admin.ts` | Server-only admin Supabase client. | Server env vars | None | `server-only`, `@supabase/supabase-js` | Trusted server-side admin tasks only. | Do not import into Client Components. |

Suggested future components:

| Component | Suggested path | What it would do | Safe first version |
|---|---|---|---|
| `GameCard` | `frontend/components/GameCard.tsx` | Display game title, cover, year, rating. | Accept `title`, `coverImage`, and `releaseYear` props and render static markup. |
| `GameGrid` | `frontend/components/GameGrid.tsx` | Render a list of `GameCard`s. | Accept `games` prop and map over it. |
| `SearchInput` | `frontend/components/SearchInput.tsx` | Let user type a search query. | Client Component with `value` and `onChange` props. |
| `ErrorMessage` | `frontend/components/ErrorMessage.tsx` | Display readable API errors. | Accept `message` prop. |
| `LoadingState` | `frontend/components/LoadingState.tsx` | Show loading text/spinner/skeleton. | Render a small accessible loading message. |

## 9. Styling Guide

### Styling system used

The repo appears intended to use Tailwind CSS:

- `tailwindcss` is in `frontend/package.json`.
- `@tailwindcss/postcss` is in `frontend/package.json`.
- `frontend/postcss.config.mjs` enables the Tailwind PostCSS plugin.

Current gap:

- There is no `frontend/app/globals.css`.
- `frontend/app/layout.tsx` does not import global CSS.
- No current component uses Tailwind classes.

So the styling system is configured but not fully used yet.

### Where global styles should live

Use:

```text
frontend/app/globals.css
```

For Tailwind v4, the global CSS file typically starts with:

```css
@import "tailwindcss";
```

Then import it in `frontend/app/layout.tsx`:

```tsx
import "./globals.css"
```

### Where component styles should live

Preferred beginner approach:

- Use Tailwind utility classes directly in components once Tailwind is wired.
- If a component needs complex custom CSS, use a CSS Module such as `GameCard.module.css`.

Examples:

- Shared component: `frontend/components/GameCard.tsx`
- Optional CSS module: `frontend/components/GameCard.module.css`

### How to add a new style safely

1. Check whether Tailwind is already imported in `layout.tsx`.
2. If not, add `globals.css` and import it as a separate setup task.
3. Style one component at a time.
4. Prefer readable class groups: layout, spacing, color, typography, state.
5. Check desktop and mobile widths.
6. Run lint/build when Node works.

### How to keep UI consistent

- Reuse components instead of copying markup.
- Keep repeated values consistent, such as padding, border radius, and text sizes.
- Use the same loading and error components across pages.
- Keep button styles consistent.
- Do not invent a new visual style on every route.

### Common styling mistakes to avoid

- Adding Tailwind classes before Tailwind is imported globally.
- Putting secrets or data files in `public/`.
- Hardcoding fixed widths that break on mobile.
- Using uppercase route folders accidentally when the intended URL should be lowercase.
- Creating nested cards or overly decorative UI for simple app workflows.
- Relying only on color to communicate errors or status.
- Forgetting focus styles for buttons, links, and inputs.

## 10. Data Fetching And API Guide

### API/client files

Current frontend API file:

```text
frontend/lib/api.ts
```

Current Supabase client files:

```text
frontend/lib/supabaseClient.ts
frontend/lib/supabase/legacy/server.ts
frontend/lib/supabase/legacy/middleware.ts
frontend/lib/supabase/legacy/proxy.ts
frontend/lib/supabase/legacy/admin.ts
```

### FastAPI helper pattern

`frontend/lib/api.ts` has this core helper:

```ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
```

What this means:

- You call `request<T>("/games")`.
- It calls `http://localhost:8000/games` locally by default.
- It parses JSON for you.
- It throws if the status is 400, 401, 404, 500, etc.

### Current frontend API helpers

| Helper | Backend route | Notes |
|---|---|---|
| `getGames<T>()` | `GET /games` | Backend returns `{ count, games }`. |
| `getGame<T>(gameId: string)` | `GET /games/{game_id}` | Backend expects UUID. Do not pass a slug here. |
| `getRecommendations<T>()` | `GET /recommendations` | Backend currently returns `"TBD"`. |

### Useful backend routes visible from the repo

Public routes:

- `GET /`
- `GET /games`
- `GET /games/search?q=<query>`
- `GET /games/slug/{slug}`
- `GET /games/igdb/{igdb_id}`
- `GET /games/{game_id}`
- `GET /reviews/game/{game_id}`
- `GET /lists/public`
- `GET /recommendations`

Protected routes requiring bearer token:

- `GET /users/me`
- `PATCH /users/me`
- `GET /favorites`
- `GET /favorites/{game_id}`
- `POST /favorites`
- `DELETE /favorites/{game_id}`
- `GET /logs`
- `GET /logs/status/{status}`
- `GET /logs/{game_id}`
- `POST /logs`
- `PATCH /logs/{game_id}`
- `DELETE /logs/{game_id}`
- `GET /reviews/me`
- `GET /reviews/{game_id}`
- `POST /reviews`
- `PATCH /reviews/{game_id}`
- `DELETE /reviews/{game_id}`
- `GET /lists`
- `GET /lists/{list_id}`
- `GET /lists/{list_id}/games`
- `POST /lists`
- `POST /lists/{list_id}/games`
- `PATCH /lists/{list_id}`
- `DELETE /lists/{list_id}/games/{game_id}`
- `DELETE /lists/{list_id}`

### Request and response shapes

Game list response, inferred from backend:

```ts
type GamesResponse = {
  count: number
  games: Game[]
}
```

Game row, inferred from migrations:

```ts
type Game = {
  game_id: string
  igdb_id: number
  title: string
  description: string | null
  release_year: number | null
  external_rating: number | null
  avg_user_rating: number | null
  cover_image: string | null
  created_at: string
  updated_at: string
  slug?: string | null
}
```

Review create request:

```ts
type ReviewCreate = {
  game_id: string
  rating: number
  review_text?: string | null
}
```

Log create request:

```ts
type LogCreate = {
  game_id: string
  status: "played" | "playing" | "completed" | "dropped" | "wishlist"
}
```

List create request:

```ts
type ListCreate = {
  list_name: string
  description?: string | null
  is_public: boolean
}
```

User update request:

```ts
type UserUpdate = {
  username: string
}
```

### Error handling pattern

Current helper only gives this error:

```text
API request failed: <status>
```

That is enough for a first version, but future UI should give users clearer messages:

- 401: "Please log in first."
- 403: "You do not have permission to do that."
- 404: "That item was not found."
- 409: "You already created this review."
- 500: "Something went wrong. Try again."

### Loading state pattern

No loading pattern exists yet.

For Server Components:

- Add `loading.tsx` beside the route.

For Client Components:

- Use `useState` for `isLoading`.
- Show a loading component while the request is pending.

### Where to add a new API call

Add FastAPI helper functions in:

```text
frontend/lib/api.ts
```

Example:

```ts
export function searchGames<T>(query: string) {
  return request<T>(`/games/search?q=${encodeURIComponent(query)}`);
}
```

For protected calls, extend the helper to accept a token:

```ts
export function getMyProfile<T>(accessToken: string) {
  return request<T>("/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
```

## 11. State Management Guide

### Local component state

Use local state when one component owns the value.

Examples:

- Search input text.
- Whether a modal is open.
- Selected rating in a review form.
- Loading/error state for a button click.

In Next.js App Router, components that use `useState`, `useEffect`, click handlers, or browser APIs must start with:

```tsx
"use client"
```

### Server-rendered data

For pages that can load data before rendering, use async Server Components.

Example future route:

```tsx
import { getGames } from "@/lib/api"

type GamesResponse = {
  count: number
  games: { game_id: string; title: string }[]
}

export default async function GamesPage() {
  const data = await getGames<GamesResponse>()

  return (
    <main>
      {data.games.map((game) => (
        <p key={game.game_id}>{game.title}</p>
      ))}
    </main>
  )
}
```

### Context providers

No React Context provider exists yet.

Use Context when many distant components need the same value, such as:

- Current user profile.
- Theme.
- Global notification/toast state.

Avoid Context for simple local form fields.

### Stores

No Zustand, Redux, Jotai, or MobX store exists.

Do not add a global store until local state, URL state, or Context is clearly not enough.

### URL/query state

Use URL state for values that should be shareable or bookmarkable.

Good examples:

- Search query: `/games?q=zelda`
- Page number: `/games?page=2`
- Sort: `/games?sort=rating`

Next.js App Router pages can read `searchParams`. In the local Next 16 docs, `searchParams` examples use a Promise type, so check the local docs before implementing.

### Form state

No form library is installed.

For simple forms, use React state:

- `username`
- `rating`
- `reviewText`
- `status`

Add a form library only if forms become complex.

### When to use each kind of state

| State kind | Use it for | Example in this app |
|---|---|---|
| Local state | One component's temporary UI state. | Search text before submit. |
| Server data | Data loaded from API/database. | Game list from `GET /games`. |
| URL state | Values users should share/bookmark. | Search query or filters. |
| Context | App-wide values many components need. | Current user session/profile. |
| External store | Complex state used across many unrelated areas. | Not needed yet. |

## 12. Adding A New Frontend Feature

Use this checklist for any new frontend feature.

1. Understand the existing route/page.
   - Look under `frontend/app`.
   - Check whether the route already has `page.tsx`.
   - Check backend routes if the feature needs data.

2. Find the closest existing component.
   - Look under `frontend/components`.
   - If nothing exists, create a small component with a clear name.

3. Decide whether to reuse or create a new component.
   - Reuse when the UI is the same with different data.
   - Create a new component when it has a clear responsibility.

4. Add or update UI.
   - Keep the first version simple.
   - Make sure text fits on mobile.
   - Use semantic HTML: `button`, `form`, `label`, `input`, `main`, `section`.

5. Add state if needed.
   - Add `"use client"` only to components that need browser interactivity.
   - Keep Server Components as the default when possible.

6. Add data fetching if needed.
   - Add a helper in `frontend/lib/api.ts`.
   - Match the backend route exactly.
   - Add auth headers for protected routes.

7. Add loading and error states.
   - Users should not see a blank screen during fetches.
   - Show useful errors for failed API calls.

8. Test manually.
   - Open the route.
   - Click the UI.
   - Try empty states and failed states if possible.
   - Check mobile width.

9. Run formatting/linting/tests.
   - `npm run lint`
   - `npm run build`
   - Backend tests if changing API expectations: `cd backend && pytest`

10. Commit with a clear message.
   - Example: `Add games listing page`
   - Mention changed routes/components in the PR description.

### Concrete example: add a games list page

Goal:

- Create a page at `/games` that lists game titles from the backend.

Files to inspect first:

- `frontend/app/games/`
- `frontend/lib/api.ts`
- `backend/app/routes/games.py`
- `supabase/migrations/001_create_tables.sql`

Files likely to edit:

- `frontend/app/games/page.tsx`
- Maybe `frontend/components/GameCard.tsx`
- Maybe `frontend/types/game.ts`

Steps:

1. Add a `Game` type.
2. Add a `GamesResponse` type.
3. Create `frontend/app/games/page.tsx`.
4. Import `getGames` from `@/lib/api`.
5. Await `getGames<GamesResponse>()`.
6. Render `data.games`.
7. Add an empty state if `data.games.length === 0`.
8. Add `frontend/app/games/loading.tsx` if the page feels slow.
9. Run the frontend with `npm run dev`.
10. Start backend on port 8000.
11. Open `http://localhost:3000/games`.

Example first version:

```tsx
import { getGames } from "@/lib/api"

type Game = {
  game_id: string
  title: string
  release_year: number | null
}

type GamesResponse = {
  count: number
  games: Game[]
}

export default async function GamesPage() {
  const data = await getGames<GamesResponse>()

  return (
    <main>
      <h1>Games</h1>
      {data.games.length === 0 ? (
        <p>No games found.</p>
      ) : (
        <ul>
          {data.games.map((game) => (
            <li key={game.game_id}>
              {game.title}
              {game.release_year ? ` (${game.release_year})` : ""}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

## 13. Editing Existing UI Safely

### Changing text

Safe:

- Edit visible text inside a component.
- Keep meaning clear.
- Check spelling and capitalization.

Example:

- Change the home heading in `frontend/app/page.tsx`.

Be careful:

- Do not change route folder names just to change displayed text.

### Changing layout

Safe:

- Wrap page content in `<main>`.
- Add simple sections.
- Use responsive layout classes after Tailwind is wired.

Be careful:

- Do not put route-specific layout in `app/layout.tsx` unless every page should share it.

### Changing styles

Safe:

- Add Tailwind classes after global Tailwind import exists.
- Add a CSS Module for one component if needed.

Be careful:

- Tailwind will not work fully until a global CSS file imports it.
- Avoid fixed pixel widths that break mobile.

### Adding a button

Safe:

- Use `<button type="button">` for non-submit buttons.
- Use `<button type="submit">` inside forms.
- Add an `onClick` only inside a Client Component.

Be careful:

- If you add `onClick`, the component needs `"use client"`.

### Adding a form input

Safe:

- Use a visible `<label>`.
- Store input value in local state.
- Validate before sending to backend.

Be careful:

- Match backend schema exactly.
- For logs, allowed statuses are only `played`, `playing`, `completed`, `dropped`, and `wishlist`.
- For reviews, rating must be 1 through 5.

### Updating a component prop

Safe:

- Update the TypeScript prop type.
- Update every place the component is used.

Be careful:

- Do not make existing required props optional unless the component truly supports missing values.

### Reusing existing components

Current reusable components are not implemented yet. When you add them:

- Put shared components in `frontend/components`.
- Keep route-specific components near their route or in a feature folder.
- Avoid copying the same card/button/form markup into many pages.

### Avoiding duplicated code

If two places call the same backend route, create one helper in `frontend/lib/api.ts`.

If two places render the same UI, create one component in `frontend/components`.

### Avoiding generated/build files

Do not edit:

- `.next/`
- `frontend/.next/`
- `node_modules/`
- `frontend/node_modules/`
- `frontend/next-env.d.ts`
- `frontend/tsconfig.tsbuildinfo`

These are generated or dependency files.

## 14. Testing And Quality Checks

Frontend scripts in `frontend/package.json`:

| Command | What it does | When to run | Passing looks like | Common failures |
|---|---|---|---|---|
| `npm run dev` | Starts the Next.js development server. | While building and manually testing. | Terminal prints a local URL, usually `http://localhost:3000`. | Node missing, port busy, env missing, compile error. |
| `npm run lint` | Runs ESLint. | Before PR, after editing TypeScript/React files. | Command exits with code 0 and no errors. | Bad imports, TypeScript/React lint issues, unused variables. |
| `npm run lint:fix` | Runs ESLint with auto-fix. | When lint reports fixable style issues. | Command exits with code 0 or reduces lint errors. | Some errors need manual fixes. Review changes before committing. |
| `npm run build` | Creates a production Next.js build. | Before PR, especially after route/data changes. | Build finishes successfully. | Type errors, invalid route usage, missing env, server/client component mistakes. |
| `npm run start` | Starts the production server after `npm run build`. | To test production build locally. | App serves built output. | Fails if no successful build exists. |

Missing frontend scripts:

| Check | Status | What to do |
|---|---|---|
| Format | No `format` script exists. | Unclear from the repository. Ask before adding Prettier. |
| Typecheck | No `typecheck` script exists. | `npm run build` performs Next/TypeScript checks. A future script could run `tsc --noEmit`. |
| Test | No frontend `test` script exists. | Manually test UI. Add a test setup later if needed. |

Backend checks:

```bash
cd backend
pytest
```

Current CI:

- `.github/workflows/ci.yml` only runs backend pytest.
- It does not currently run frontend lint/build.

Manual frontend verification checklist:

- Open the route you changed.
- Refresh the page.
- Check browser console for errors.
- Check the Network tab for failed API calls.
- Try empty API results.
- Try failed API responses if possible.
- Check mobile width.
- Check that keyboard focus works for buttons/inputs.

Known local check limitation:

- In this workspace, `npm run lint` could not run because Node/npm is not correctly available. Fix the Node toolchain before trusting frontend checks.

## 15. Debugging Guide

### Browser console

Use it for:

- React runtime errors.
- Missing props.
- Failed client-side code.
- Supabase auth errors.

Common issue:

- `process is not defined` or env confusion usually means code is running in the browser and expecting server-only behavior.

### Network tab

Use it for:

- Failed API requests.
- Wrong API URL.
- 401/403/404/500 responses.
- CORS errors.

For this repo:

- Public API base is controlled by `NEXT_PUBLIC_API_URL`.
- Local default is `http://localhost:8000`.
- Backend CORS currently allows `http://localhost:3000` and `http://127.0.0.1:3000`.

### React errors

Common causes:

- A component uses `useState`, `useEffect`, or `onClick` but does not have `"use client"`.
- A Client Component receives non-serializable props from a Server Component.
- A component maps over `undefined` because data shape was wrong.

### Build errors

Common causes:

- TypeScript type mismatch.
- Missing import.
- Wrong path alias.
- Server-only code imported into a Client Component.
- Env variable missing during build.

### TypeScript errors

This repo has `strict: true` in `frontend/tsconfig.json`.

That means:

- Avoid `any` when a type can be written.
- Handle `null` values such as `cover_image` and `description`.
- Match API response shapes carefully.

### Styling not applying

Likely causes:

- Tailwind global CSS has not been created/imported.
- Class name typo.
- CSS Module imported incorrectly.
- Global CSS imported in the wrong place.

### Environment variable problems

Rules:

- Restart `npm run dev` after changing `.env.local`.
- Frontend browser variables must start with `NEXT_PUBLIC_`.
- Do not put secret service role keys in browser code.
- Backend reads `backend/.env.local` through `python-dotenv`.

### API errors

Check:

- Is the backend running?
- Is `NEXT_PUBLIC_API_URL` correct?
- Does the backend route exist in `/docs`?
- Is the route public or protected?
- If protected, are you sending `Authorization: Bearer <token>`?
- Does the request body match the Pydantic schema?

### Dependency install problems

Check:

- Are you in `frontend/`?
- Is Node `>=20.9.0`?
- Are you using npm or pnpm consistently?
- If npm fails in WSL 1, move to WSL 2 or install Node correctly inside Linux.

## 16. Common Frontend Tasks

### Add a new page

Files to inspect first:

- `frontend/app`
- Similar route folders
- Next local docs under `frontend/node_modules/next/dist/docs/01-app`

Files likely to edit:

- A new `page.tsx` inside a route folder.

Steps:

1. Choose the URL.
2. Create a folder under `frontend/app`.
3. Add `page.tsx`.
4. Default export a React component.
5. Add links/navigation later if needed.
6. Run `npm run dev`.
7. Open the new URL.

Example:

```text
frontend/app/games/page.tsx
```

creates:

```text
/games
```

How to test:

- Open `http://localhost:3000/games`.
- Refresh the page.
- Run `npm run lint`.

### Add a new component

Files to inspect first:

- `frontend/components`
- The page that will use the component.

Files likely to edit:

- New file in `frontend/components`.
- Existing page/component that imports it.

Steps:

1. Name the component clearly, such as `GameCard`.
2. Define props with TypeScript.
3. Render simple markup.
4. Import it where needed.
5. Pass real data through props.

How to test:

- Open the page using the component.
- Check for TypeScript/lint errors.
- Try missing/null values if props allow them.

### Add a new reusable UI element

Files to inspect first:

- `frontend/components`

Files likely to edit:

- `frontend/components/Button.tsx`, `Input.tsx`, or similar.

Steps:

1. Check if a similar element already exists.
2. Create a simple component with props.
3. Keep styling generic.
4. Use it in one page first.
5. Reuse only after the first usage works.

How to test:

- Check hover/focus/disabled states.
- Use keyboard navigation.

### Add a new API call

Files to inspect first:

- `frontend/lib/api.ts`
- Relevant backend route in `backend/app/routes`
- Relevant schema in `backend/app/schemas`

Files likely to edit:

- `frontend/lib/api.ts`
- A page or component that calls the helper.

Steps:

1. Confirm backend method and path.
2. Confirm request body.
3. Confirm response shape.
4. Add a typed helper.
5. Handle errors in UI.
6. For protected routes, attach bearer token.

How to test:

- Test the backend route in FastAPI `/docs`.
- Test the frontend UI.
- Watch Network tab.

### Add a loading spinner or loading state

Files to inspect first:

- Route folder under `frontend/app`.
- Component that fetches data.

Files likely to edit:

- `loading.tsx` beside a route page, or a client component with `isLoading`.

Steps:

1. For route-level loading, add `loading.tsx`.
2. For button/request loading, use local state in a Client Component.
3. Use readable text such as `Loading games...`.
4. Disable submit buttons during submit.

How to test:

- Slow down network in browser devtools.
- Confirm loading UI appears.

### Add an error message

Files to inspect first:

- The component making the API call.
- `frontend/lib/api.ts`.

Files likely to edit:

- A page/component.
- Maybe `frontend/components/ErrorMessage.tsx`.

Steps:

1. Catch thrown errors.
2. Convert status or message into user-friendly text.
3. Show the message near the relevant UI.
4. Let the user retry when appropriate.

How to test:

- Stop the backend and trigger the request.
- Try an invalid ID.

### Add form validation

Files to inspect first:

- Backend schema in `backend/app/schemas`.
- Database constraints in `supabase/migrations`.

Files likely to edit:

- The form component.

Steps:

1. List required fields.
2. Validate before API submit.
3. Show field-level messages.
4. Prevent invalid submit.
5. Match backend constraints.

How to test:

- Submit empty fields.
- Submit invalid ratings.
- Submit valid data.

### Update navigation

Files to inspect first:

- `frontend/app/layout.tsx`
- Existing pages in `frontend/app`

Files likely to edit:

- `frontend/app/layout.tsx`
- Future `frontend/components/Nav.tsx`

Steps:

1. Decide whether navigation appears on every page.
2. If yes, add it to root layout or a shared component imported by layout.
3. Use Next.js `Link` for internal navigation.
4. Keep active/disabled states clear.

How to test:

- Click every link.
- Refresh each route.
- Check mobile layout.

### Add an image or icon

Files to inspect first:

- `frontend/public/images`
- Component where image appears.

Files likely to edit:

- Add image file under `frontend/public/images`.
- Update component/page.

Steps:

1. Add optimized image to `public/images`.
2. Reference it as `/images/file-name.png`.
3. Add meaningful `alt` text.
4. Use `next/image` for optimized images when appropriate.

How to test:

- Open page.
- Check image loads.
- Check broken image icon does not appear.

### Change colors or typography

Files to inspect first:

- Existing styles and components.
- Future `globals.css` if present.

Files likely to edit:

- Component class names.
- `frontend/app/globals.css` if global tokens are added.

Steps:

1. Find the current pattern.
2. Change one area at a time.
3. Keep contrast readable.
4. Check mobile and desktop.

How to test:

- Check pages in light/dark browser settings if supported.
- Check text contrast visually.

### Make a layout responsive

Files to inspect first:

- Page/component layout markup.

Files likely to edit:

- The component/page with layout classes.

Steps:

1. Start mobile-first.
2. Use flexible widths.
3. Avoid fixed heights for text-heavy content.
4. Check long game titles.
5. Check empty images.

How to test:

- Use browser devtools responsive mode.
- Test narrow widths around 320px.

### Connect a UI element to data

Files to inspect first:

- `frontend/lib/api.ts`
- Backend route file.
- Component needing data.

Files likely to edit:

- API helper.
- Page/component.
- Type file if added.

Steps:

1. Define the expected data type.
2. Fetch data in the page or component.
3. Add loading/error/empty states.
4. Render only after data exists.
5. Handle null fields.

How to test:

- Confirm network request path.
- Confirm UI matches actual JSON.

## 17. Code Style And Conventions

### Naming conventions

Observed:

- Page components are default exports.
- Route files use `page.tsx` and `layout.tsx`.
- Most planned route folders are lowercase: `games`, `lists`, `login`, `register`, `profile`, `recommendations`.
- Two current route folders are uppercase: `Journal`, `LandingPage`.

Inferred recommendation:

- Prefer lowercase route folders for user-facing URLs unless the team intentionally wants uppercase URLs.
- Use PascalCase for React component names, such as `GameCard`.
- Use camelCase for variables and functions.

### Component organization

Observed:

- Routes live in `frontend/app`.
- Empty component folders exist under `frontend/components`.
- Helpers live in `frontend/lib`.

Inferred recommendation:

- Keep route pages thin.
- Move repeated UI into `frontend/components`.
- Move API calls into `frontend/lib/api.ts`.
- Move shared types into `frontend/types` when they become reused.

### Import style

Observed:

- `tsconfig.json` defines alias `@/*` to `./*`.
- Current files mostly use relative imports or package imports.

Recommended:

- Use `@/lib/api` for shared frontend helpers.
- Use relative imports for files in the same small folder.

### TypeScript usage

Observed:

- TypeScript is enabled.
- `strict: true`.
- `allowJs: true`, but current frontend source is TypeScript.

Recommended:

- Write new frontend code in `.tsx` or `.ts`.
- Type API responses.
- Handle `null` from database fields.
- Avoid broad `any`.

### Styling conventions

Observed:

- Tailwind dependencies exist.
- Tailwind global CSS is not wired yet.
- No component style convention exists yet.

Inferred recommendation:

- Use Tailwind utilities after setup.
- Use CSS Modules only for complex component-specific styling.
- Keep spacing and typography consistent.

### API conventions

Observed:

- `frontend/lib/api.ts` wraps `fetch`.
- Generic return type `T` is used.
- Helper names are simple verbs: `getGames`, `getGame`, `getRecommendations`.

Recommended:

- Add one helper per backend endpoint.
- Keep path strings in `frontend/lib/api.ts`, not scattered across components.
- Add auth header support for protected routes.

### Error handling conventions

Observed:

- API helper throws `Error("API request failed: <status>")`.
- No UI error components exist yet.

Inferred recommendation:

- Catch errors in UI.
- Show readable messages.
- Preserve enough detail for debugging in console during development.

### Commit/PR expectations

Visible from repo:

- CI runs on pull requests to `main`.
- CI currently runs backend pytest only.

Inferred recommendation:

- Include a short PR description.
- Include screenshots for UI changes.
- Mention manual test steps.
- Run frontend lint/build locally when Node works.

## 18. What Not To Touch Unless You Know Why

| Path or file | Why it is risky |
|---|---|
| `frontend/.env.local`, `backend/.env.local`, `scripts/.env.local` | Contains real local secrets. Do not print or commit values. |
| `SUPABASE_SERVICE_ROLE_KEY` anywhere | Admin-level secret. Exposing it can compromise the database. |
| `frontend/node_modules/`, `backend/.venv/` | Installed dependencies. Regenerate through package managers. |
| `.next/`, `frontend/.next/` | Generated Next.js build/dev output. |
| `frontend/next-env.d.ts` | Generated by Next.js. |
| `frontend/tsconfig.tsbuildinfo` | Generated TypeScript cache. |
| `frontend/package-lock.json`, `frontend/pnpm-lock.yaml` | Lockfiles affect dependency versions. Change only through the chosen package manager. |
| `supabase/migrations/` | Database schema/history. Breaking changes can damage local/remote data. |
| `supabase/config.toml` | Controls local Supabase services, auth, ports, and provider settings. |
| `backend/app/utils/auth.py` | Protected route security depends on this. |
| `backend/app/database/supabase_client_backend.py` | Controls Supabase keys and user-scoped clients. Mistakes can bypass or break RLS. |
| `scripts/fetch_games.py`, `scripts/normalize_games.py` | Use external APIs and service role credentials to import data. |
| `data/raw/games_raw.json` | Generated raw dataset. Large and not usually part of frontend work. |
| `.github/workflows/ci.yml` | Affects PR checks for everyone. |
| `gameflix/supabase/snippets/Untitled query 754.sql` | Existing unrelated modified file shown by git status. Do not touch unless assigned. |

## 19. Pull Request Checklist

Before opening a PR:

- [ ] I ran the app locally from `frontend/`.
- [ ] I opened every route I changed.
- [ ] I tested the main happy path.
- [ ] I tested empty, loading, and error states where relevant.
- [ ] I checked mobile width and desktop width.
- [ ] I checked the browser console for errors.
- [ ] I checked the Network tab for failed API calls.
- [ ] I did not commit real `.env.local` values.
- [ ] I did not edit generated files such as `.next`, `node_modules`, or `next-env.d.ts`.
- [ ] I ran `npm run lint` if Node works.
- [ ] I ran `npm run build` if Node works and the change is more than text-only.
- [ ] I ran backend tests if I changed backend assumptions: `cd backend && pytest`.
- [ ] I added screenshots or a short screen recording for visible UI changes.
- [ ] I wrote a clear PR description explaining what changed and how I tested it.

## 20. Glossary For Beginners

| Term | Simple meaning in this repo |
|---|---|
| Component | A reusable piece of UI written as a React function. Example: a future `GameCard`. |
| Prop | Input passed into a component. Example: `title` passed into `GameCard`. |
| State | Data a component remembers while the user interacts with it. Example: search text. |
| Route | A URL handled by the app. Example: `/games`. |
| App Router | Next.js routing system where folders/files under `app/` define routes. |
| Page | A `page.tsx` file that renders UI for a route. |
| Layout | A `layout.tsx` file that wraps pages. The root layout wraps the whole app. |
| Dynamic route | A route with a variable segment, such as `games/[gameId]`. |
| API | A server endpoint the frontend calls for data or actions. Example: `GET /games`. |
| Hook | A React function for reusable behavior, often starting with `use`, such as `useState`. |
| Effect | Code that runs after rendering in a Client Component, using `useEffect`. |
| Build | The production compilation step, run with `npm run build`. |
| Bundle | JavaScript/CSS files sent to the browser after the app is built. |
| Environment variable | A config value stored outside code, such as `NEXT_PUBLIC_API_URL`. |
| Client-side | Code running in the user's browser. |
| Server-side | Code running on the server, such as Server Components or FastAPI. |
| Hydration | React attaching browser interactivity to server-rendered HTML. |
| Linting | Automated code quality/style checking. This frontend uses ESLint. |
| TypeScript | JavaScript with types. This app uses strict TypeScript settings. |
| Tailwind | Utility-first CSS framework installed in this frontend. |
| Package manager | Tool that installs dependencies. This repo currently shows npm and pnpm files. |
| Supabase | Hosted/local backend platform used here for PostgreSQL database and auth. |
| FastAPI | Python backend framework used in `backend/`. |
| RLS | Row Level Security. Supabase/PostgreSQL rules that limit which rows users can access. |
| Bearer token | Access token sent in `Authorization: Bearer <token>` for protected API calls. |
| CORS | Browser security rule controlling whether frontend can call backend across origins. |

## 21. Suggested First Issues For New Teammates

### Task: Replace the home placeholder with a simple app intro

Why it is safe:

- Only touches `frontend/app/page.tsx`.
- No API or auth required.

Files to look at:

- `frontend/app/page.tsx`
- `README.md`

What they will learn:

- How a Next.js page works.
- How to run and view the app.

### Task: Add a visible placeholder to `/Journal`

Why it is safe:

- `JournalPage` currently returns `null`.
- A simple heading improves clarity without touching data.

Files to look at:

- `frontend/app/Journal/page.tsx`

What they will learn:

- How route folders map to URLs.
- How blank pages happen.

### Task: Add Tailwind global CSS setup

Why it is safe:

- Tailwind dependencies and PostCSS config already exist.
- This enables the intended styling system.

Files to look at:

- `frontend/postcss.config.mjs`
- `frontend/app/layout.tsx`
- Local Next CSS docs in `frontend/node_modules/next/dist/docs/01-app/01-getting-started/11-css.md`

What they will learn:

- How global CSS works in Next.js App Router.
- How Tailwind connects to the app.

### Task: Create a `GameCard` component with static props

Why it is safe:

- Does not require API calls at first.
- Builds a reusable piece for future game pages.

Files to look at:

- `frontend/components`
- `supabase/migrations/001_create_tables.sql` for game fields.

What they will learn:

- Component props.
- Handling nullable game data.

### Task: Add a typed `searchGames` helper

Why it is safe:

- Adds a small helper beside existing helpers.
- Backend route already exists.

Files to look at:

- `frontend/lib/api.ts`
- `backend/app/routes/games.py`

What they will learn:

- API helper structure.
- Encoding query parameters.

### Task: Create a simple `/games` page

Why it is safe:

- The route folder already exists.
- Backend `GET /games` already exists.

Files to look at:

- `frontend/app/games/`
- `frontend/lib/api.ts`
- `backend/app/routes/games.py`

What they will learn:

- Server Component data fetching.
- Rendering API data.
- Empty states.

### Task: Add a reusable `ErrorMessage` component

Why it is safe:

- Small UI-only component.
- Useful across future pages.

Files to look at:

- `frontend/components`
- `frontend/lib/api.ts`

What they will learn:

- Reusable components.
- User-friendly errors.

### Task: Document frontend package manager decision

Why it is safe:

- It can be a docs-only change.
- The repo currently has both npm and pnpm lockfiles.

Files to look at:

- `frontend/package-lock.json`
- `frontend/pnpm-lock.yaml`
- `frontend/README.md`
- `docs/setup-guide.md`

What they will learn:

- Dependency management and team workflow.

## 22. Final Quickstart Summary

New teammate checklist:

1. Install Node.js `>=20.9.0`.
2. From the repo root, run `cd frontend`.
3. Run `npm install`.
4. Create `frontend/.env.local` from `frontend/.env.example`.
5. Start the frontend with `npm run dev`.
6. Open `http://localhost:3000`.
7. Find the route or component you need under `frontend/app` or `frontend/components`.
8. Make a tiny change first, such as changing visible text.
9. Refresh the browser and check the console.
10. If your change needs backend data, start the backend from `backend/` on port 8000.
11. Test loading, empty, and error states where relevant.
12. Run `npm run lint` when Node works.
13. Run `npm run build` before PRs with real frontend logic.
14. Open a PR with a clear description, manual test steps, and screenshots for UI changes.
