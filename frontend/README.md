# WebhookLab Frontend

React + Vite + Tailwind + Chakra UI.

## Requirements

- Node.js 24.14.0 (see [.nvmrc](../.nvmrc) — use `nvm use` if using nvm)
- pnpm

## Setup

```bash
# From project root
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (port 5173) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome fix |

## Environment

Copy `.env.example` to `.env` and adjust as needed:

| Variable            | Description                      | Required |
|---------------------|----------------------------------|----------|
| `VITE_BACKEND_URL`  | Backend API/WebSocket base URL   | yes      |
| `VITE_PORT`         | Dev server port                  | yes      |

## Proxy

Vite proxies `/api` and `/ws` to the backend. Set `VITE_BACKEND_URL` in `.env` if your backend runs elsewhere. Start the backend for full functionality.
