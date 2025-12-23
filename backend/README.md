# Sinmail Backend
API, webhooks, and worker layer for paid Gmail contact.

## Proposed stack
- Node.js + TypeScript with Fastify (HTTP) and BullMQ/Redis (queue) for delivery worker.
- PostgreSQL via Prisma (schema for recipients, allowlist, messages, payment_intents, delivery_attempts, audit_logs).
- 402x/Coinbase for payments; Gmail API for delivery + label management.

## MVP scope (mirrors root README)
- Authenticated recipient API: connect/disconnect Gmail OAuth, set default price/currency, manage allowlist, fetch public link/config.
- Public sender API: preflight allowlist check, create/confirm payment intent, submit message with idempotency key.
- Webhooks: payment succeeded/failed → update intent/message, enqueue delivery.
- Delivery worker: pick paid or allowlisted messages → insert into Gmail with `INBOX` + `Sinmail` label → store gmail_message_id + receipt URL → retry safely.
- Reliability: idempotent handlers, signature verification, rate limits, DLQ/alerts for repeated failures.

## Local bootstrap (future)
1) `npm init -y` (or pnpm) inside `backend/`.
2) Add deps: `fastify`, `@fastify/cors`, `bullmq`, `ioredis`, `prisma`, `@prisma/client`, `zod`, `dotenv`.
3) Add scripts: `dev` (ts-node-dev), `build`, `start`, `prisma migrate`.
4) Create `src/` with modules for auth, allowlist, payments (402x), messages, webhooks, delivery worker.
5) Set env: `DATABASE_URL`, `REDIS_URL`, `GMAIL_CLIENT_ID/SECRET`, `GMAIL_REDIRECT_URI`, `SESSION_SECRET`, `PAYMENT_SIGNING_SECRET`.

## Notes
- Keep Gmail scopes minimal (`https://www.googleapis.com/auth/gmail.insert` + labels); rotate/revoke tokens on disconnect.
- Use Prisma migrations checked into repo; run in CI before app start.
- All endpoints and webhooks must be idempotent; use provider refs and message ids for dedupe.
