# WebhookLab

Webhook testing & inspection platform. **Frontend URLs only** — backend is never exposed.

## Flow

- **`/`** — Auto-creates a webhook and redirects to inspect (no form)
- **`/w/:slug`** — Custom URL: e.g. `/w/stripe-payments` → `yourdomain.com/webhook/stripe-payments`
- **`/inspect/:id`** — Inspect captured requests

All webhook URLs use the frontend domain (e.g. `https://yourapp.com/webhook/xyz`), proxied to the backend.

## Quick Start

### 1. Backend (required for creating webhooks)

```bash
cd backend
cp .env.example .env   # Edit with your PostgreSQL credentials
pnpm install
pnpm db:migrate
pnpm dev
```

Backend runs at **http://localhost:4000** (or your configured PORT).

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs at **http://localhost:5173**.

### 3. Environment

**Backend** (`.env` in `backend/`):
- `NODE_ENV`, `PORT`, `POSTGRES_*` (or `DATABASE_URL`), `FRONTEND_URL=http://localhost:5173`

**Frontend** (optional `.env` in `frontend/`):
- `VITE_BACKEND_URL=http://localhost:4000` (if backend uses a different port)

## Troubleshooting

- **Blank screen**: Check the browser console for errors. An error boundary will show a fallback if React crashes.
- **"Create webhook" fails**: Ensure the backend is running and reachable at the URL in `VITE_BACKEND_URL`.
- **Proxy error (ECONNREFUSED)**: The backend is not running. Start it with `cd backend && pnpm dev`.
