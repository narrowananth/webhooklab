# WebhookLab Service

Java/Spring Boot implementation of the WebhookLab backend (matching the Node API in `backend/`).

## Features

- **Webhooks**: Create webhooks (with optional name/slug), get by ID or slug
- **Capture**: `ALL /webhook/{webhookId}` — capture raw request (any method), store headers, query params, body
- **Events API**:
  - `GET /api/events/{inboxId}` — list events (paginated)
  - `GET /api/events/{inboxId}/{eventId}` — get one event
  - `GET /api/events/{inboxId}/stats` — count and total payload size
  - `DELETE /api/events/{inboxId}` — clear all events for inbox
  - `POST /api/events/{eventId}/replay` — replay request to `targetUrl` (body: `{ "targetUrl": "https://..." }`)
- **Health**: `GET /health` — `{ "status": "ok", "service": "webhooklab-backend" }`

## Configuration

- `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` — PostgreSQL
- `PORT` — server port (default 4000)
- `FRONTEND_URL` / `api.frontend-url` — used to build webhook URLs (default `http://localhost:5173`)

## Run

```bash
./gradlew :services:webhooklab:bootRun
```

Or run `fynxt.webhooklab.WebhooklabApplication` from your IDE. Ensure PostgreSQL is running and Flyway migrations have been applied.
