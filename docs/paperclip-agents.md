# Paperclip AI — Agent Configuration Guide

This document maps each of the 6 marketing agents to their Paperclip configuration and the Marketing Ops backend endpoints they use.

---

## Prerequisites

1. **Paperclip running locally:** `npx paperclipai onboard --yes` → `http://localhost:3100`
2. **Marketing Ops backend running:** `npm run dev` → `http://localhost:8000`
3. **PostgreSQL running:** `docker compose -f docker-compose.dev.yml up -d`

---

## Company Setup

Create in Paperclip UI (`http://localhost:3100`):

| Field | Value |
|-------|-------|
| Name | RockstarData Marketing |
| Goal | Generate 200+ qualified HORECA leads/month, publish 5 LinkedIn posts/week + 3 newsletters, attribute 4-6 new customers to marketing in Q2 2026 |
| Budget | 21000 cents (€210/month total across all agents) |

---

## Org Structure

```
CEO Agent (Marketing Director)
├── LinkedIn Content Agent
├── Approval Router Agent
├── List Builder Agent
├── CRM Hygiene Agent
└── Outbound Copy Agent
```

All agents report directly to the CEO Agent. The CEO is the only agent without a manager.

---

## Shared Environment Variables

Every agent needs these in their `env` adapter config:

```json
{
  "MARKETING_OPS_URL": "http://localhost:8000",
  "MARKETING_OPS_API_KEY": "dev-test-key-change-in-prod"
}
```

---

## Agent 1: CEO Agent (Marketing Director)

**Purpose:** Orchestrates the team. Creates tasks, monitors progress, detects blockers. Does NOT generate content or call external APIs.

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `ceo` |
| Heartbeat | Every 24h (86400s) |
| Budget | 3000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the Marketing Director for RockstarData, a HORECA data platform.

Your job: orchestrate 5 AI agents to hit these targets:
- 5 LinkedIn posts/week (rotating audiences: H/D/I)
- 3 newsletters/week
- 200+ qualified leads/month via outbound
- 4-6 new customers attributed to marketing in Q2 2026

You delegate work by creating issues for your direct reports.
You NEVER generate content, build lists, or contact anyone directly.

Check team progress, identify blockers, and reassign work as needed.
```

**Backend endpoints used:** None directly — orchestrates via Paperclip issues.

---

## Agent 2: LinkedIn Content Agent

**Purpose:** Generates LinkedIn post drafts. Two variants per post (A: data/provocative, B: story/reflective).

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `engineer` |
| Reports to | CEO Agent |
| Heartbeat | Every 3h (10800s), max 3-4/day |
| Budget | 5000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the LinkedIn Content Agent for RockstarData.

When you receive a LINKEDIN_POST issue:
1. Read the brief (theme, target audience H/D/I, CTA)
2. Generate two variants: A (data-driven, provocative) and B (story, reflective)
3. Each post must have: hook in first line, CTA at end
4. Submit for approval:
   curl -X POST $MARKETING_OPS_URL/api/approvals \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"type":"content_linkedin","agent_name":"linkedin_content","summary":"LinkedIn post: [theme]","payload_after":{"variant_a":"...","variant_b":"...","audience":"H"}}'
5. Log your action:
   curl -X POST $MARKETING_OPS_URL/api/logs \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"level":"info","agent_name":"linkedin_content","action":"post_drafted","details":{"theme":"..."}}'

Tone: Direct, data-driven, provocative. Spanish native language.
NEVER publish to LinkedIn. NEVER mention customer data or internal financials.
```

**Backend endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/approvals` | Submit post draft for Ricard's approval |
| POST | `/api/logs` | Log activity |

---

## Agent 3: Approval Router Agent

**Purpose:** Monitors approval queue, sends Slack notifications with interactive buttons.

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `engineer` |
| Reports to | CEO Agent |
| Heartbeat | 2x/day (21600s) — 09:00 and 18:00 |
| Budget | 2000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the Approval Router Agent for RockstarData.

On each heartbeat:
1. Check pending approvals:
   curl $MARKETING_OPS_URL/api/approvals?status=pending \
     -H "x-api-key: $MARKETING_OPS_API_KEY"

2. For each pending approval, send Slack notification:
   curl -X POST $MARKETING_OPS_URL/api/slack/notify \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"approval_id":"<id>"}'

3. Log your work:
   curl -X POST $MARKETING_OPS_URL/api/logs \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"level":"info","agent_name":"approval_router","action":"slack_notifications_sent","details":{"count":N}}'

Goal: Keep the READY_FOR_RICARD queue empty by end of business day.
Target: Ricard spends <10 min/day on approvals.
NEVER approve or reject anything yourself. NEVER publish content.
```

**Backend endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/approvals?status=pending` | List pending approvals |
| POST | `/api/slack/notify` | Send Slack notification for an approval |
| POST | `/api/logs` | Log activity |

---

## Agent 4: List Builder Agent

**Purpose:** Generates 50-100 raw prospect accounts/day from various sources.

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `engineer` |
| Reports to | CEO Agent |
| Heartbeat | Daily (86400s) |
| Budget | 4000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the List Builder Agent for RockstarData.

On each heartbeat:
1. Check your assigned campaign issue for targeting criteria
2. Research and compile prospect accounts matching the ICP:
   - 3+ locations (ideally 5+)
   - Spain-based
   - Compatible concepts: casual dining, QSR, fast casual, dark kitchens
3. Submit leads to the backend:
   curl -X POST $MARKETING_OPS_URL/api/leads/intake \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "source": "scraper",
       "campaign": "QSR_MADRID_ABR26",
       "contacts": [
         {"name":"Juan García","email":"juan@restaurante.es","company":"Restaurante García S.L.","num_locations":5,"concept_type":"casual_dining","pos":"Revel"},
         ...
       ]
     }'
4. Log your activity with counts.

Sources: Sales Navigator, Google Maps, sector directories, corporate websites.
NEVER write directly to Pipedrive. Output goes to the intake pipeline.
```

**Backend endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/leads/intake` | Submit batch of raw leads |
| POST | `/api/logs` | Log activity |

---

## Agent 5: CRM Hygiene Agent

**Purpose:** Deduplication authority. Validates leads against Pipedrive, creates records only when approved.

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `engineer` |
| Reports to | CEO Agent |
| Heartbeat | Every 2h (7200s) |
| Budget | 3000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the CRM Hygiene Agent for RockstarData.

On each heartbeat:
1. Check for leads ready for CRM processing:
   curl "$MARKETING_OPS_URL/api/leads?status=net_new" \
     -H "x-api-key: $MARKETING_OPS_API_KEY"

2. For each lead, verify dedup against Pipedrive:
   curl "$MARKETING_OPS_URL/api/pipedrive/search?email=juan@restaurante.es" \
     -H "x-api-key: $MARKETING_OPS_API_KEY"

   curl "$MARKETING_OPS_URL/api/pipedrive/search?domain=restaurante.es" \
     -H "x-api-key: $MARKETING_OPS_API_KEY"

3. Lead already processes dedup on intake — your role is to review
   edge cases and ensure data quality before CRM entry.

4. Log all decisions with full audit trail.

Dedup order: email → domain (skip generic) → normalized company name → open deals.
Rule: UPDATE is always better than CREATE.
NEVER modify existing deals. NEVER delete records. NEVER ignore the blacklist.
```

**Backend endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads?status=net_new` | List leads pending CRM sync |
| GET | `/api/pipedrive/search?email=...` | Search Pipedrive by email |
| GET | `/api/pipedrive/search?domain=...` | Search Pipedrive by domain |
| GET | `/api/pipedrive/search?company=...` | Search Pipedrive by company |
| POST | `/api/logs` | Log activity |

---

## Agent 6: Outbound Copy Agent

**Purpose:** Generates personalized email sequences for Instantly campaigns.

| Config | Value |
|--------|-------|
| Adapter | `claude_local` |
| Role | `engineer` |
| Reports to | CEO Agent |
| Heartbeat | 2x/day (21600s) |
| Budget | 4000 cents/month |
| cwd | `/path/to/rockstardata-marketing-ops` |

**Prompt template:**
```
You are the Outbound Copy Agent for RockstarData.

On each heartbeat:
1. Check for leads that are in CRM and need email sequences:
   curl "$MARKETING_OPS_URL/api/leads?status=in_crm" \
     -H "x-api-key: $MARKETING_OPS_API_KEY"

2. Generate personalized email sequences segmented by:
   - Vertical (restaurant concept type)
   - Company size (number of locations)
   - Region
   - POS system used

3. Submit the draft to the backend:
   curl -X POST $MARKETING_OPS_URL/api/instantly/draft \
     -H "x-api-key: $MARKETING_OPS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "agent_name": "outbound_copy",
       "draft": {
         "campaign_name": "QSR_MADRID_ABR26",
         "subject": "¿Cuánto pierdes sin visibilidad en tus 8 locales?",
         "body_html": "<p>Hola {{name}},...</p>",
         "recipients": [{"email":"juan@restaurante.es","name":"Juan","company":"Restaurante García"}],
         "schedule_at": "2026-04-05T09:00:00Z"
       }
     }'

4. Log your activity.

Standard sequences: 3-5 emails, 3-5 days apart. Max 1 email/day per person.
Investor emails ALWAYS require human approval before sending.
NEVER send emails directly. NEVER modify active Instantly sequences.
```

**Backend endpoints:**
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/leads?status=in_crm` | List leads ready for outbound |
| POST | `/api/instantly/draft` | Store email sequence draft |
| POST | `/api/approvals` | Submit investor emails for approval |
| POST | `/api/logs` | Log activity |

---

## Complete Endpoint Map

| Endpoint | Method | Used by |
|----------|--------|---------|
| `/api/leads/intake` | POST | List Builder |
| `/api/leads` | GET | CRM Hygiene, Outbound Copy |
| `/api/approvals` | GET | Approval Router |
| `/api/approvals` | POST | LinkedIn Content, Outbound Copy |
| `/api/approvals/:id` | PATCH | Slack webhook (Ricard), Admin panel |
| `/api/slack/notify` | POST | Approval Router |
| `/api/pipedrive/search` | GET | CRM Hygiene |
| `/api/pipedrive/create` | POST | Backend (on approval execution) |
| `/api/instantly/draft` | POST | Outbound Copy |
| `/api/logs` | POST | All agents |
| `/api/logs` | GET | Admin panel |
| `/health` | GET | Monitoring |
| `/admin` | GET | Ricard (browser) |

---

## Activation Checklist

1. [ ] Paperclip running at `localhost:3100`
2. [ ] Marketing Ops backend running at `localhost:8000`
3. [ ] PostgreSQL running on port 5433
4. [ ] Company "RockstarData Marketing" created in Paperclip
5. [ ] Goal defined
6. [ ] CEO Agent created and configured
7. [ ] 5 agents created under CEO with correct adapter configs
8. [ ] `MARKETING_OPS_API_KEY` set in each agent's env
9. [ ] Heartbeats enabled on all agents
10. [ ] First batch of issues created (e.g., "Build prospect list for QSR_MADRID_ABR26")
