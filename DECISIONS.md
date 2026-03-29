# DECISIONS.md — RockstarData Marketing Ops

## Decision 1: Raw `pg` over Prisma/Knex for DB access

**Decision:** Use `pg` with a thin typed wrapper (`query<T>`, `queryOne<T>`).

**Reason:** The schema has only 5 tables and is fully defined in SQL. The dedup logic requires composable WHERE clauses with JSONB operators that ORMs handle poorly. Adding Prisma would double the project surface area (schema.prisma, migrations, client generation) for minimal benefit.

**Alternatives descartadas:** Prisma (too heavy for 5 tables), Knex (acceptable but unnecessary layer), TypeORM (Java-style patterns, poor TS experience).

---

## Decision 2: Zod for request validation

**Decision:** Use Zod schemas for all API input validation.

**Reason:** TypeScript-native (infers types from schemas), composable, fast, and works well with Express. The `parse()` method throws a `ZodError` which we catch in middleware and convert to a structured 400 response.

**Alternatives descartadas:** Joi (no native TS inference), class-validator (requires decorators + classes), manual validation (error-prone).

---

## Decision 3: Pino for structured logging

**Decision:** Use Pino with JSON output in production, pino-pretty in development.

**Reason:** Fastest JSON logger for Node.js. Structured logs are required by the tech spec. Pino-pretty gives readable output in development without changing the logging calls.

**Alternatives descartadas:** Winston (slower, more complex config), console.log (not structured).

---

## Decision 4: Embedded admin panel (HTML/JS) over separate React app

**Decision:** Serve a single `index.html` with vanilla JS from Express at `/admin`.

**Reason:** V1 admin needs are minimal (approve/reject + view logs). Adding React/Next.js doubles the build complexity. The panel calls the same API endpoints and can be replaced with a proper SPA in V2.

**Alternatives descartadas:** Next.js standalone (separate deploy, separate build), extending Paperclip UI (coupling risk).

---

## Decision 5: PostgreSQL on port 5433

**Decision:** Map PostgreSQL to host port 5433 instead of default 5432.

**Reason:** Other projects in this workspace may use port 5432. Using 5433 avoids conflicts.

---

## Decision 6: Internal API key authentication

**Decision:** Use a shared API key (`INTERNAL_API_KEY`) in the `x-api-key` header for Paperclip → backend communication, with timing-safe comparison.

**Reason:** Simple, sufficient for internal service-to-service auth in V1. Timing-safe comparison prevents timing attacks. No need for JWT or OAuth between internal services.

**Alternatives descartadas:** JWT (overkill for internal comms), mTLS (complex for V1).

---

## Decision 7: Dedup runs against local DB first, then Pipedrive

**Decision:** Phase B dedup checks the `leads_intake` table for existing records. Phase C adds Pipedrive API searches on top.

**Reason:** Allows the core logic to work and be tested without Pipedrive credentials. The local DB acts as a cache/mirror of what's been sent to Pipedrive.

---

## Decision 8: Token bucket rate limiter for Pipedrive

**Decision:** Use an in-process token bucket (80 tokens / 2s) instead of an external rate limiter library.

**Reason:** Pipedrive allows 100 req/2s. We use 80 to leave headroom. The bucket is ~30 lines of code, gives precise per-service control, and avoids adding a dependency for a simple problem. If we scale to multiple instances, we'd need Redis-based rate limiting.

**Alternatives descartadas:** Bottleneck (adds dependency for simple use case), p-limit (concurrency, not rate limiting), axios-rate-limit (less control).

---

## Decision 9: Slack notifications are non-blocking on approval creation

**Decision:** If Slack notification fails when creating an approval, log a warning but don't fail the approval creation.

**Reason:** The approval record in the DB is the source of truth, not Slack. Slack is a convenience notification. Failing to notify shouldn't block the approval workflow — Ricard can always check the admin panel.

---

## Decision 10: Instantly is a stub in V1

**Decision:** The Instantly service stores draft payloads in `agent_logs` instead of calling the Instantly API.

**Reason:** Instantly integration is V2 scope. Storing drafts preserves the agent's work and creates an audit trail that can be replayed when the integration is activated.

---

## Decision 11: Paperclip must NOT be started from the project directory

**Decision:** Always start Paperclip from `~` (home directory) or with `DATABASE_URL=""` explicitly unset.

**Reason:** Paperclip loads `.env` from the current working directory via dotenv. If started from the project root, it picks up `DATABASE_URL=localhost:5433` (marketing-ops PostgreSQL) and tries to connect to it instead of its own embedded PostgreSQL on port 54329, causing startup to fail with an `AggregateError`.

**How to start Paperclip correctly:**
```bash
cd ~ && DATABASE_URL="" npx paperclipai run
```

**Alternatives discarded:** Renaming the project `.env` (breaks our backend), using a separate `.env.paperclip` (Paperclip doesn't support custom env file paths in this version).
