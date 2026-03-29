# RockstarData Marketing Ops

Marketing automation backend for RockstarData — orchestrates 6 AI agents via Paperclip AI for lead generation, content production, and CRM management in the HORECA sector.

## Quick Start

```bash
# 1. Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
npm install

# 3. Run migrations
npm run migrate

# 4. Start the server
npm run dev
# → http://localhost:8000

# 5. Run tests
npm test
```

## Architecture

```
Paperclip AI (6 agents) ──HTTP──► Marketing Ops Backend (Express/TS) ──► PostgreSQL
                                          │
                                          ├──► Pipedrive API (CRM)
                                          ├──► Slack Bot API (approvals)
                                          └──► Instantly API (outbound email - stub)
```

**Key principle:** Agents propose, the backend validates (blacklist, dedup, business rules), Ricard approves via Slack or admin panel, and only then does the system execute.

## API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/health` | None | Health check |
| GET | `/health/ready` | None | Readiness (pings DB) |
| POST | `/api/leads/intake` | API key | Submit leads batch |
| GET | `/api/leads` | API key | List leads (filter by status/campaign) |
| GET | `/api/approvals` | API key | List approvals (filter by status) |
| GET | `/api/approvals/:id` | API key | Get approval detail |
| POST | `/api/approvals` | API key | Create approval |
| PATCH | `/api/approvals/:id` | API key | Approve/reject |
| POST | `/api/logs` | API key | Record agent activity |
| GET | `/api/logs` | API key | List logs |
| GET | `/api/pipedrive/search` | API key | Search Pipedrive |
| POST | `/api/pipedrive/create` | API key | Create in Pipedrive |
| POST | `/api/slack/notify` | API key | Send Slack notification |
| POST | `/api/slack/webhook` | Slack sig | Receive button clicks |
| POST | `/api/instantly/draft` | API key | Store email draft (stub) |
| GET | `/api/instantly/drafts` | API key | List drafts |
| GET | `/admin` | Basic auth | Admin panel |

## Authentication

- **API endpoints:** `x-api-key` header with `INTERNAL_API_KEY`
- **Admin panel:** Basic auth with `ADMIN_PASSWORD`
- **Slack webhook:** HMAC-SHA256 signature verification

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `INTERNAL_API_KEY` | Yes | API key for agent → backend auth |
| `PIPEDRIVE_API_TOKEN` | No | Pipedrive API token (empty = skip execution) |
| `PIPEDRIVE_OWNER_ID` | No | Default deal owner in Pipedrive |
| `SLACK_BOT_TOKEN` | No | Slack bot token for notifications |
| `SLACK_SIGNING_SECRET` | No | Slack webhook signature verification |
| `SLACK_APPROVAL_CHANNEL` | No | Channel ID for approval notifications |
| `ADMIN_PASSWORD` | No | Admin panel password (default: admin) |

## Lead Intake Pipeline

```
POST /api/leads/intake
    → Zod validate + normalize (lowercase email, extract domain, strip S.L./S.A.)
    → Blacklist check (email, domain, company)
    → Dedup vs local DB (email → domain → normalized company name)
    → Status: net_new | new_contact_existing_org | existing_contact | duplicate_with_deal | blocked
    → Insert with full audit trail
    → Auto-create approval for actionable leads
    → Slack notification sent
```

## Paperclip AI Integration

See [`docs/paperclip-agents.md`](docs/paperclip-agents.md) for complete agent configuration including:
- Adapter configs for all 6 agents
- Prompt templates with endpoint examples
- Org structure and heartbeat schedules
- Activation checklist

## Project Structure

```
rockstardata-marketing-ops/
├── src/
│   ├── index.ts                 # Express bootstrap
│   ├── config.ts                # Environment config
│   ├── lib/                     # db, logger, errors
│   ├── middleware/               # auth, error-handler, request-logger
│   ├── types/                   # TypeScript interfaces
│   ├── validators/              # Zod schemas
│   ├── services/                # Business logic
│   │   ├── leads.service.ts     # Core: normalize → blacklist → dedup → store
│   │   ├── approvals.service.ts # CRUD + execution on approval
│   │   ├── blacklist.service.ts # Email/domain/company blocking
│   │   ├── pipedrive.service.ts # Rate-limited Pipedrive client
│   │   ├── slack.service.ts     # Block Kit notifications + webhooks
│   │   └── instantly.service.ts # V1 stub
│   ├── routes/                  # Express route handlers
│   └── admin/                   # Embedded HTML/JS admin panel
├── migrations/                  # SQL migrations
├── tests/                       # Vitest test suite (46 tests)
├── docs/                        # Playbooks, specs, agent configs
├── CLAUDE.md                    # AI coding assistant instructions
└── DECISIONS.md                 # Architecture decision log
```

## Scripts

```bash
npm run dev        # Start with ts-node-dev (auto-reload)
npm run build      # Compile TypeScript
npm start          # Run compiled JS
npm run migrate    # Run database migrations
npm test           # Run test suite
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
```
