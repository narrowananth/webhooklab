# WebhookLab Service

Java/Spring Boot implementation of the WebhookLab backend (matching the Node API in `backend/`).

## Features

- **Webhooks**: Create webhooks (with optional name/slug), get by ID or slug
- **Capture**: `ALL /webhook/{webhookId}` — capture raw request (any method), store headers, query params, body
- **Events API**:
  - `GET /api/events/{inboxId}` — list events (paginated; optional filters: `method`, `status` (2xx/4xx/5xx), `ip`, `requestId`; Node also supports `search` for full-text filter — not in this sample)
  - `GET /api/events/{inboxId}/{eventId}` — get one event
  - `GET /api/events/{inboxId}/stats` — count and total payload size
  - `DELETE /api/events/{inboxId}` — clear all events for inbox
  - `POST /api/events/{eventId}/replay` — replay request to `targetUrl` (body: `{ "targetUrl": "https://..." }`); infers Content-Type when missing
- **Health**: `GET /health` — `{ "status": "ok", "service": "webhooklab-backend" }`; `GET /api/health` — same + database check (`database`: "connected" | "disconnected", 503 when disconnected)
- **WebSocket** (`/ws?webhookId=...`) — real-time push: when a request is captured, all clients subscribed to that webhook (by UUID or slug) receive an `event:new` message with the new event. Same contract as the Node backend; the frontend can use it for live updates with no polling.
- **Event response**: Events use `timestamp` (ISO format) for compatibility with the frontend/Node API.

## Not in this sample

- Full-text search on events (Node supports `search` filter — not in this sample).

## Configuration

- `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD` — PostgreSQL
- `PORT` — server port (e.g. 4000)
- `API_PREFIX` — optional; default `/api` (no version in path)
- `FRONTEND_URL` / `auth.frontend-url` — used to build webhook URLs (e.g. `http://localhost:5173`)

## Run

```bash
./gradlew :services:webhooklab:bootRun
```

Or run `webhooklab.WebhooklabApplication` from your IDE. Ensure PostgreSQL is running and Flyway migrations have been applied.
