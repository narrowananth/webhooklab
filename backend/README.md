# WebhookLab Backend

TypeScript + Express + Zod + PostgreSQL + WebSocket API.

## Requirements

- Node.js 24.14.0 (see [.nvmrc](../.nvmrc) — use `nvm use` if using nvm)
- PostgreSQL
- pnpm

## Setup

```bash
# From project root
pnpm install
cp .env.example .env   # Edit with your PostgreSQL credentials
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start with hot reload |
| `pnpm build` | Compile TypeScript |
| `pnpm start` | Run compiled output |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema to DB (dev) |
| `pnpm db:studio` | Open Drizzle Studio |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome fix |

## Environment

See `.env.example` for variables. Key ones: `PORT`, `DATABASE_URL` (or `POSTGRES_*`), `FRONTEND_URL`.
