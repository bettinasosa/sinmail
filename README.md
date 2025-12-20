# Sinmail
Paid contact gateway for Gmail. Unknown senders pay to reach you; allowlisted senders go through for free. Messages arrive in Gmail with a `Sinmail` label and a payment receipt link.

## Product overview
- Recipient connects Gmail, sets a default price for unknown senders, and maintains an allowlist (emails + domains).
- Recipient gets a public Sinmail link and embeddable form for inbound messages.
- Sender visits link, writes subject/body. If allowlisted, message delivers instantly. Otherwise they pay and the message is relayed into Gmail within 60s with a `Sinmail` label.
- Each delivered message stores a receipt and avoids double-charging on retries.

## High-level architecture
- **Frontend**: Public message page + embeddable widget that calls the API for allowlist check, payment intent, and message send.
- **API/Backend**:
  - Authenticated recipient endpoints: connect Gmail (OAuth), set default price, manage allowlist, generate public links/forms, view receipts.
  - Public sender endpoints: preflight allowlist check, create/confirm payment, submit message, retry idempotently.
  - Delivery worker: pulls confirmed payments or free passes, posts message to Gmail, tags with `Sinmail`, stores receipt link, and marks delivery status.
  - Webhooks: payment provider (402x/Coinbase) events to confirm funds, handle retries, and reconcile receipts.
- **Payments**: 402x/Coinbase for pricing, payment intents, confirmations, and receipts. Use idempotency keys to prevent double charges.
- **Gmail integration**: OAuth + Gmail API to insert message into recipient inbox with `Sinmail` label and metadata linking to receipt. Prefer message insert with `INBOX` label + custom `Sinmail` label creation if missing.
- **Data/storage**: Recipients, allowlist entries, public links/forms, message submissions, payment intents/receipts, delivery attempts, idempotency tokens, audit logs.
- **Observability/reliability**: Structured logs, request/attempt traces, dead-letter queue for failed deliveries, alerting on undelivered/long-running jobs.

### Message flow (unknown sender)
1) Sender opens link → submits subject/body.
2) Backend checks allowlist; if not matched, creates payment intent (price from recipient’s default), returns payment session.
3) Sender pays; payment provider sends webhook → backend confirms intent.
4) Delivery worker fetches confirmed intent + message payload → inserts into Gmail with `Sinmail` label.
5) Receipt stored and linked; sender sees success state. Retries use idempotency to avoid double-charge/double-send.

### Message flow (allowlisted sender)
1) Sender opens link → submits subject/body.
2) Backend matches allowlist → bypass payment → enqueue delivery immediately.
3) Delivery inserts into Gmail with `Sinmail` label and marks as free-pass receipt.

### Core data model (sketch)
- `recipients`: id, gmail_account_id, default_price, public_link_slug, created_at.
- `allowlist_entries`: id, recipient_id, type (email|domain), value, created_at, updated_at.
- `messages`: id, recipient_id, subject, body, sender_email (optional), status (queued|paid|delivered|failed), payment_intent_id (nullable), gmail_message_id, receipt_url, created_at, updated_at.
- `payment_intents`: id, provider, provider_ref, amount, currency, status, idempotency_key, message_id, created_at, updated_at.
- `delivery_attempts`: id, message_id, status, error, attempted_at.
- `audit_logs`: id, actor, action, target, created_at, meta.

### Integrations
- Gmail OAuth scopes: minimal send/insert + labels. Store refresh token securely; rotate and revoke on disconnect.
- Payment (402x/Coinbase): intents, webhooks, receipts; enforce HTTPS and verify signatures.
- Optional email validation (syntax only) to reduce abuse.

### Security and abuse considerations
- Rate-limit public endpoints per IP + recipient.
- Require CAPTCHA or similar for message submission to deter bots.
- Verify webhook signatures; idempotent processing.
- Encrypt tokens/secrets at rest; isolate per recipient.
- Sanitise message input; prevent header injection if constructing raw MIME.

## To-do list (MVP)
- **Project setup**
  - Choose stack (e.g., Node/TypeScript or Python) and structure: api, worker, web, shared libs.
  - Add env configuration for Gmail + payment credentials; secure secret storage.
  - Decide persistence layer (SQL with migrations recommended).

[- **Recipient onboarding** -]
  - OAuth flow to connect Gmail; store refresh token; handle disconnect.
  - Create/find `Sinmail` label in Gmail; cache label id.
  - Endpoint/UI to set default price, currency, and public link slug.

[- **Allowlist management** -]
  - CRUD for allowlist entries (email + domain); bulk import optional.
  - Server-side allowlist match helper (exact email or domain suffix).

[- **Public link + sender UI** -]
  - Public message page + embeddable form (subject, body, sender email optional).
  - Client calls preflight endpoint to check allowlist and fetch payment requirement.
  - Success + failure states with delivery ETA copy.

[- **Payments** -]
  - Payment intent endpoint using 402x/Coinbase with amount from recipient default price.
  - Store intent with idempotency key; return payment session/client secret.
  - Webhook handler for payment succeeded/failed events; reconcile status.
  - Generate/store receipt URL/ID for each paid delivery.

[- **Message submission + delivery** -]
  - Submission endpoint to create message record and bind payment intent (nullable for allowlisted).
  - Delivery worker/queue that picks ready messages (free or paid-confirmed) and inserts into Gmail with `INBOX` + `Sinmail`.
  - Store Gmail message id + receipt link; mark delivered; retry with backoff and idempotency.
  - Ensure delivery within 60s path (fast queue + short polling interval).

[- **Reliability + anti-double-charge** -]
  - Idempotency keys on submission and webhook handlers.
  - Locking or status checks to avoid double sends; dedupe by message_id.
  - Dead-letter handling and alerting for repeated failures.

[- **Recipient dashboard** -]
  - View status of deliveries and receipts; resend or refund hooks optional.
  - Copy public link + embed snippet.

[- **Testing + QA** -]
  - Unit tests for allowlist match, payment webhook idempotency, Gmail delivery adapter.
  - End-to-end happy path: allowlisted free send; paid send with webhook; retry without double charge.
  - Manual sanity for label creation and Gmail message rendering.

[- **Launch readiness** -]
  - Production env + domain; HTTPS everywhere.
  - Logging/metrics dashboards; alerts on undelivered>threshold and webhook failures.
  - Terms/privacy stubs; support contact; incident playbook.
