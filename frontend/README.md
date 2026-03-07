# Frontend

Tech stack and developer workflow for the LiveFlares frontend.

## Tech Stack

- **React 19**, **Vite 6**, **TypeScript 5.7**
- **Chakra UI**, **Zustand**, **TanStack Query**
- **Biome** (lint, format)
- **pnpm**

## Prerequisites

- **Node.js 20+** (see `engines` in `package.json`)
- **pnpm** — install with `corepack enable && corepack prepare pnpm@latest --activate` or via npm

## Build

```bash
pnpm install
pnpm run build
```

Output is written to `dist/`.

## Run

```bash
pnpm run dev
```

Runs the Vite dev server (default port from `VITE_PORT` or Vite default). For production build preview:

```bash
pnpm run build
pnpm run preview
```

## Environment

Set `VITE_BACKEND_URL` (e.g. in `.env`) to point at the backend API when running locally.

## Code Quality

```bash
pnpm run format    # Biome format
pnpm run lint      # Biome check
pnpm run lint:fix  # Biome check --write
```

## Project Structure

| Path | Description |
|------|--------------|
| `src/api/` | API client and endpoints |
| `src/components/` | UI components (atoms, molecules, organisms, layout) |
| `src/hooks/` | React hooks (WebSocket, queries, network) |
| `src/lib/` | Utilities (formatting, clipboard, etc.) |
| `src/pages/` | Route-level pages |
| `src/store/` | Zustand stores |
| `public/` | Static assets |
