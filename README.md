# Checkout Payments API

Backend API for a credit-card payment checkout flow: product catalog, transaction
orchestration against an external card-payment gateway, and asynchronous webhook
resolution. Built with **NestJS + TypeScript + PostgreSQL + TypeORM**, following
**Clean Architecture** (Domain / Application / Infrastructure / Presentation) and a
**Ports & Adapters (Hexagonal)** boundary around the external payment provider.

> This repository intentionally avoids naming the concrete third-party payment
> provider anywhere in code, configuration keys, or documentation — see
> [Design decisions](#design-decisions) for why, and how to plug in real
> credentials via environment variables only.

## Repository layout

This repository contains **two independent projects**:

- **`/` (this README)** — the NestJS backend described below.
- **[`mobile/`](mobile/README.md)** — the React Native (TypeScript) checkout app that
  consumes this API. See `mobile/README.md` for its own installation, testing, and
  build instructions. A ready-to-install debug APK ships at
  [`mobile/apk/CheckoutMobile-debug.apk`](mobile/apk/CheckoutMobile-debug.apk).

## Table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Environment variables](#environment-variables)
- [Database & migrations](#database--migrations)
- [Running locally](#running-locally)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [API documentation](#api-documentation)
- [Tests & coverage](#tests--coverage)
- [Architecture](#architecture)
- [Design decisions](#design-decisions)
- [Known limitations](#known-limitations)

## Requirements

- Node.js 20+ (developed on Node 24)
- npm 10+
- PostgreSQL 16 (or Docker, to run it in a container)

## Installation

```bash
npm install
cp .env.example .env
# edit .env with your local database credentials and payment gateway keys
```

## Environment variables

All configuration is read via `@nestjs/config` and validated at boot (the app
refuses to start if a required variable is missing or malformed). See
`.env.example` for the full list with safe defaults for local development:

| Variable | Description |
|---|---|
| `PORT` | HTTP port the API listens on (default `3000`) |
| `DATABASE_HOST` / `DATABASE_PORT` / `DATABASE_USER` / `DATABASE_PASSWORD` / `DATABASE_NAME` / `DATABASE_SSL` | PostgreSQL connection |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES_IN` | Access token signing secret and TTL (default `15m`) |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token signing secret and TTL (default `7d`) |
| `THROTTLE_TTL_MS` / `THROTTLE_LIMIT` | Global rate limit window/requests |
| `THROTTLE_LOGIN_TTL_MS` / `THROTTLE_LOGIN_LIMIT` | Stricter rate limit applied only to `POST /auth/login` |
| `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` | Credentials used **once** by the seed migration to create the first admin user |
| `PAYMENT_API_URL` | Base URL of the card-payment gateway (sandbox/UAT URL) |
| `PAYMENT_PUBLIC_KEY` / `PAYMENT_PRIVATE_KEY` | Gateway API keys |
| `PAYMENT_EVENTS_KEY` | Secret used to verify the checksum embedded in incoming webhook payloads |
| `PAYMENT_INTEGRITY_KEY` | Secret used to compute the integrity signature required on every transaction creation call |
| `RECONCILE_PENDING_INTERVAL_MS` | How often (ms) the pending-transaction reconciliation job runs (default `60000`) |

## Database & migrations

Migrations live in `src/database/migrations` and are plain SQL via
`QueryRunner.query()` (no `synchronize: true` — schema changes are always explicit
and reviewable).

```bash
npm run migration:run       # apply all pending migrations
npm run migration:revert    # roll back the last migration
npm run migration:generate -- src/database/migrations/SomeName  # generate a new one from entity diffs
```

Two migrations ship out of the box:

1. **InitialSchema** — creates `users`, `products`, `transactions`,
   `transaction_items`, `webhook_events` with indexes and check constraints.
2. **SeedAdminUser** — inserts one admin user (email/password hashed with
   argon2) from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`. Skipped with a
   warning if those variables are not set.

## Running locally

```bash
npm run start:dev
```

The API boots on `http://localhost:3000`. Health check: `GET /health`.

## Running with Docker

```bash
docker compose up --build
```

This starts a `postgres` container and the API container (which runs pending
migrations automatically before starting, see the `Dockerfile` `CMD`). The API
is exposed on `http://localhost:3000`.

To run only the database (and use a local Node process for the API, as during
development):

```bash
docker compose up -d postgres
```

## Deployment

The API is deployed on an AWS EC2 instance running the same Docker Compose
setup described above (Postgres + API containers behind an Elastic IP, so the
address stays stable across instance restarts). The mobile app's
`API_BASE_URL` points directly at this deployment — see
[`mobile/src/config/env.ts`](mobile/src/config/env.ts).

## API documentation

Swagger/OpenAPI UI: **`http://localhost:3000/docs`** (generated from the same
decorators used for request validation — always in sync with the code).

### Endpoints overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public (rate-limited) | Admin login, returns access + refresh token |
| POST | `/auth/refresh` | Public | Rotates the token pair |
| POST | `/auth/logout` | Bearer | Revokes the stored refresh token |
| GET | `/products` | Public | Active product catalog |
| GET | `/products/:id` | Public | Single product |
| POST | `/products` | Bearer (ADMIN) | Create a product |
| PATCH | `/products/:id/stock` | Bearer (ADMIN) | Adjust stock |
| POST | `/transactions` | Public | Create a checkout transaction and charge a tokenized card |
| GET | `/transactions/:id` | Public | Read back a transaction's status |
| POST | `/webhooks/payments` | Signature-verified | Async payment status notifications |
| GET | `/health` | Public | Liveness check |

## Tests & coverage

```bash
npm run test        # unit tests
npm run test:cov    # unit tests with coverage report
```

**Latest results: 158 tests passing, 41 suites.**

| Metric | Coverage |
|---|---|
| Statements | 99.41% |
| Branches | 91.45% |
| Functions | 98.00% |
| Lines | 99.35% |

Threshold enforced in `package.json` (`jest.coverageThreshold`): **80%** on all
four metrics — the build fails if coverage regresses below that.

Static analysis is also configured via SonarQube (`sonar-project.properties`
at the repo root), scanning both `src` (backend) and `mobile/src` (mobile)
and consuming the same coverage reports (`coverage/lcov.info`,
`mobile/coverage/lcov.info`).

Every layer is tested in isolation:
- **Domain** (`*.entity.spec.ts`): pure unit tests, no mocks, no framework.
- **Application** (`*.use-case.spec.ts`): use cases tested against hand-written
  mocked ports (repositories, gateways) — no database, no HTTP.
- **Infrastructure** (`*.repository.spec.ts`, `*.mapper.spec.ts`, gateway
  adapter): TypeORM repositories tested against a mocked `Repository<T>`; the
  HTTP gateway adapter tested against a mocked `fetch`.
- **Presentation** (`*.controller.spec.ts`): controllers tested with mocked
  use cases, verifying HTTP-to-use-case mapping only.

## Architecture

Clean Architecture, applied per module (`src/modules/{auth,products,transactions}`):

```
modules/<name>/
├── domain/           # entities, value objects, repository & gateway PORTS (interfaces). No framework imports.
├── application/       # use cases — one class, one business operation, depends only on ports.
├── infrastructure/    # ADAPTERS: TypeORM repositories, HTTP gateway client, hashing, JWT.
└── presentation/      # controllers, DTOs (class-validator), guards.
```

Cross-cutting concerns live in `src/common` (domain error hierarchy + a single
`AllExceptionsFilter` that maps them to HTTP responses) and `src/config`
(env validation + typed configuration factory).

Dependency direction always points inward: `presentation → application → domain`,
`infrastructure → domain`. The domain layer never imports from NestJS, TypeORM,
or any HTTP library, which is what makes it trivial to unit test without a
database or an HTTP server.

## Design decisions

- **No literal provider name in code.** The payment gateway is abstracted
  behind a `PaymentGatewayPort` domain interface with a generically-named
  adapter (`CardPaymentGatewayAdapter`). All provider-specific values (base
  URL, keys) come exclusively from environment variables
  (`PAYMENT_API_URL`, `PAYMENT_PUBLIC_KEY`, etc.) — swapping providers means
  changing `.env`, not code. This is also, incidentally, the textbook
  Ports & Adapters pattern.
- **Card tokenization happens client-side.** The API only ever receives an
  already-issued card token (`cardToken` in `POST /transactions`); raw card
  numbers/CVCs never touch this backend. This keeps PCI-DSS scope on the
  gateway's own tokenization endpoint, not on this service.
- **Money as integer cents.** Every amount (`priceInCents`, `amountInCents`,
  ...) is stored and computed as an integer, never a float, avoiding rounding
  errors — and matching the integer-cents convention most card-payment APIs use.
- **`reference` vs internal `id`.** Transactions expose a `reference` (sent to
  the gateway and shown to the client as the "transaction number") that is
  decoupled from the internal UUID primary key.
- **Price snapshot on transaction items.** `unit_price_in_cents` is copied
  onto each `transaction_items` row at checkout time, so a later product price
  change never rewrites historical transactions.
- **Hybrid synchronous + webhook resolution.** `POST /transactions` calls the
  gateway and resolves the transaction immediately when the gateway responds
  synchronously (`APPROVED`/`DECLINED`). If the gateway responds `PENDING`
  (e.g. 3-D Secure challenges), the transaction stays `PENDING` and is later
  resolved by `POST /webhooks/payments`. This was verified against the real
  provider's UAT sandbox: a checkout with a real tokenized test card returned
  `PENDING` and resolved to `APPROVED` a few seconds later, purely
  asynchronously — confirming the webhook path isn't just theoretical.
- **Every outbound gateway request is signed, not just trusted over HTTPS.**
  Transaction creation requires a merchant **acceptance token** (fetched
  server-side via `GET /merchants/:publicKey`, since it's tied to the
  merchant's policy version, not to the customer) plus an **integrity
  signature** — `SHA256(reference + amount_in_cents + currency + integrityKey)`
  — or the gateway rejects the call outright with `INPUT_VALIDATION_ERROR`.
  Inbound webhook payloads carry their own checksum
  (`SHA256(concatenated property values + timestamp + eventsKey)`, compared
  with `crypto.timingSafeEqual`) inside the JSON body itself rather than an
  HTTP header. Both formats were confirmed against the live sandbox, not
  assumed from documentation alone — see [Known limitations](#known-limitations).
  Duplicate webhook deliveries are de-duplicated via the
  `webhook_events.provider_event_id` unique index — idempotent no-ops
  (verified by replaying the same signed payload twice: second call is a 200
  no-op, stock is not decremented again).
- **Stock is decremented only on `APPROVED`,** never on `PENDING` or `DECLINED`,
  by a single shared `DecreaseStockForTransactionService` used by all three
  resolution paths (synchronous, webhook, and reconciliation — see next point).
- **Pending-transaction reconciliation as a webhook safety net.** A scheduled
  job (`PendingTransactionsReconciliationScheduler`, `@Interval`, configurable
  via `RECONCILE_PENDING_INTERVAL_MS`) periodically re-checks every `PENDING`
  transaction that has a `gatewayTransactionId` directly against the gateway
  (`GET /transactions/:id`) and resolves it if the gateway has moved on. This
  covers the real-world case where a webhook is never delivered (no public
  endpoint registered, delivery dropped, etc.). It shares the exact same
  resolution logic as the synchronous path via `ApplyChargeResultService`, so
  there is only one place that decides what "resolved" means. Per-transaction
  failures (including a transaction resolved concurrently by the webhook in
  the meantime) are caught and logged without aborting the rest of the batch.
- **Gateway failures degrade to a resolved `ERROR` transaction, not a 5xx.**
  If the HTTP call to the gateway throws (network error, non-2xx), the
  transaction is marked `ERROR` with the failure reason and returned normally
  — the mobile client can render its "unhappy path" toast from the transaction
  status instead of having to handle a generic server error.
- **Admin auth protects only the back-office surface.** The mobile checkout
  flow in the source spec has no login screen, so `POST /transactions` and the
  public `GET` endpoints stay unauthenticated by design; JWT (access + hashed,
  rotated refresh tokens, argon2 password hashing) protects only product
  management (`POST /products`, `PATCH /products/:id/stock`). Login is rate
  limited more aggressively than the rest of the API to blunt brute force.
- **Domain errors, not HTTP exceptions, in use cases.** Use cases throw a small
  typed hierarchy (`NotFoundDomainError`, `ValidationDomainError`,
  `ConflictDomainError`, `UnauthorizedDomainError`, `ExternalServiceDomainError`)
  that a single global `AllExceptionsFilter` translates to HTTP status codes —
  application code never imports `@nestjs/common`'s `HttpException`.

## Known limitations

- **No stock reservation at `PENDING` time.** Between creating a `PENDING`
  transaction and it being confirmed (sync or via webhook), stock is not
  locked/reserved. Under concurrent checkouts for the last unit(s) of a
  low-stock product, a later confirmation can fail with a stock-conflict
  error. Acceptable for this exercise; a production system would add a
  reservation step or optimistic-locking on `products.stock`.
- **Webhook checksum verified with a hand-crafted payload, not a live delivery.**
  This dev environment has no public HTTPS endpoint, so the provider could not
  actually deliver a webhook here. The full flow was instead validated by:
  creating a real `PENDING` transaction against the sandbox from this API,
  reading back its real resolved status directly from the gateway, then
  POSTing a manually-signed payload (same checksum formula, same shape as the
  real transaction object) to `POST /webhooks/payments` — which correctly
  resolved the transaction and decremented stock exactly once. The checksum
  *algorithm* mirrors the integrity-signature pattern that *was* empirically
  confirmed for transaction creation; the exact `signature.properties` set
  the provider sends on a live webhook was not observed directly and should be
  double-checked against a real delivery (e.g. via an `ngrok` tunnel) before
  production use.
