# Gameflix

Gameflix is split into a Python backend, a Next.js frontend, shared database SQL, scripts, data, and project documentation.

## Project Layout

- `backend/` - FastAPI/backend code, services, ML recommendation code, Python tests, and Python dependencies.
- `frontend/` - Next.js app router frontend, components, hooks, client API helpers, and frontend dependencies.
- `database/` - SQL schema and migration files.
- `scripts/` - One-off import, cleaning, normalization, and seed scripts.
- `data/` - Raw and processed datasets.
- `docs/` - Project notes and design documentation.

## Development

Run the frontend from `frontend/`:

```bash
cd frontend
npm run dev
```

Run backend tests from `backend/`:

```bash
cd backend
pytest
```
