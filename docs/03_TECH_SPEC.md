# RockstarData Marketing Ops — Especificación Técnica V1

## Arquitectura general

```
┌──────────────────────────────────────────────────────────────────┐
│                        Ricard (Board)                            │
│                    Slack #marketing-approvals                    │
│                       Panel Admin (UI)                           │
└──────────────────┬──────────────────┬────────────────────────────┘
                   │                  │
                   ▼                  ▼
┌──────────────────────┐  ┌───────────────────────────────────────┐
│   Paperclip AI       │  │   Backend marketing-ops               │
│   (Orquestación)     │◄─┤   (Lógica de negocio)                │
│                      │  │                                       │
│  • CEO Agent         │  │  • /api/leads/intake                  │
│  • LinkedIn Content  │──►  • /api/approvals                     │
│  • Approval Router   │  │  • /api/pipedrive/*                   │
│  • List Builder      │  │  • /api/slack/notify                  │
│  • CRM Hygiene       │  │  • /api/instantly/*                   │
│  • Outbound Copy     │  │                                       │
└──────────────────────┘  └──────────┬────────────┬───────────────┘
                                     │            │
                          ┌──────────▼──┐  ┌──────▼──────┐
                          │  PostgreSQL  │  │  APIs ext.  │
                          │  (RDS)       │  │  Pipedrive  │
                          │              │  │  Slack      │
                          │  • leads     │  │  Instantly  │
                          │  • approvals │  │  (stubs:    │
                          │  • logs      │  │   Clay,     │
                          │  • blacklist │  │   Apollo)   │
                          └─────────────┘  └─────────────┘
```

### Principio clave

Los agentes de Paperclip **NUNCA** llaman directamente a APIs externas. Siempre pasan por el backend marketing-ops, que:
1. Valida la request contra reglas de negocio.
2. Verifica blacklist y dedup.
3. Requiere approval si es una acción de alto impacto.
4. Ejecuta la acción solo si approved.
5. Registra todo en logs.

---

## 1. Paperclip AI (orquestación)

### Despliegue

| Entorno | Método | Base de datos |
|---|---|---|
| Validación | Zeabur template (1-click) | PostgreSQL 17 incluido |
| Local dev | `pnpm dev` o `docker-compose` | PostgreSQL embebido |
| Producción | ECS Fargate + RDS | PostgreSQL 17 en RDS (eu-west-1) |

### Configuración de Company

```json
{
  "name": "RockstarData Marketing",
  "issuePrefix": "RDMKT",
  "budgetMonthlyCents": 30000,
  "requireBoardApprovalForNewAgents": true,
  "mission": "Generar leads y autoridad de marca para RockstarData y PilotStar en HORECA."
}
```

### Variables de entorno Paperclip

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PAPERCLIP_AUTH_DISABLE_SIGN_UP=true
MARKETING_OPS_URL=http://marketing-ops:8000  # URL interna del backend
```

### Comunicación Paperclip ↔ Backend

Los agentes llaman al backend via HTTP:

| Agente | Endpoint backend | Método | Descripción |
|---|---|---|---|
| List Builder | `/api/leads/intake` | POST | Enviar lote de leads RAW |
| CRM Hygiene | `/api/pipedrive/search` | GET | Buscar orgs/persons para dedup |
| CRM Hygiene | `/api/pipedrive/create` | POST | Crear org/person (con dedup) |
| Outbound Copy | `/api/instantly/draft` | POST | Crear email borrador en campaña |
| Approval Router | `/api/approvals` | GET | Leer approvals pendientes |
| Approval Router | `/api/slack/notify` | POST | Enviar approval a Slack |
| LinkedIn Content | `/api/approvals` | POST | Crear approval para borrador |
| Todos | `/api/logs` | POST | Registrar acciones |

---

## 2. Backend marketing-ops

### Tecnología

- **Lenguaje:** Node.js / TypeScript (preferido para coherencia con Paperclip) o FastAPI (Python).
- **Framework:** Express con middleware de autenticación, o NestJS.
- **Puerto:** 8000 (interno).
- **Autenticación interna:** API key compartida entre Paperclip y backend (via env var `INTERNAL_API_KEY`).

### Endpoints HTTP

#### Leads

```
POST /api/leads/intake
  Body: { source, contacts: [{ name, email, phone?, company, num_locations?, concept_type?, pos?, campaign? }] }
  Response: { created: N, updated: N, rejected: N, details: [...] }
  Lógica: normalizar → verificar blacklist → dedup vs Pipedrive → crear/actualizar → log

GET /api/leads?status={raw|enriched|in_crm|rejected}&campaign={id}
  Response: Lista de leads con estado
```

#### Pipedrive proxy

```
GET /api/pipedrive/search?type={person|org}&term={query}
  Response: resultados de Pipedrive
  Lógica: proxy con rate limiting y logging

POST /api/pipedrive/create
  Body: { type: "person"|"org"|"lead"|"deal", data: {...} }
  Response: Pipedrive response
  Lógica: verificar blacklist → dedup → crear → log
  REQUIERE: approval previo si es creación masiva (>10)

POST /api/pipedrive/update
  Body: { type, id, data: {...} }
  Lógica: log cambio + verificar que no viola reglas
  REQUIERE: approval si cambia stage a Ganado/Perdido o cambia owner
```

#### Approvals

```
POST /api/approvals
  Body: { type, agent_name, summary, payload_before?, payload_after, priority? }
  Response: { id, status: "pending" }

GET /api/approvals?status={pending|approved|rejected|all}
  Response: Lista de approvals

PATCH /api/approvals/:id
  Body: { status: "approved"|"rejected", decided_by, notes? }
  Response: Approval actualizado
  Lógica: si approved → ejecutar acción pendiente → log
```

#### Slack

```
POST /api/slack/notify
  Body: { channel, message, blocks?, approval_id? }
  Lógica: enviar a Slack + registrar log

POST /api/slack/webhook  (Slack interactive endpoint)
  Body: Slack payload con acción de botón
  Lógica: parsear approve/reject → actualizar approval → ejecutar si approved
```

#### Instantly (stub avanzado)

```
POST /api/instantly/draft
  Body: { campaign_id, leads: [{ email, first_name, variables }], sequence_text }
  Response: { drafted: N }
  REQUIERE: approval previo siempre
  V1: solo preparar payload, NO enviar a Instantly API aún
```

#### Logs

```
POST /api/logs
  Body: { level, agent_name, action, details, timestamp? }
  Response: { id }

GET /api/logs?agent={name}&level={info|warn|error}&from={date}&to={date}
  Response: Lista de logs
```

---

## 3. Modelos de datos (PostgreSQL)

### Esquema mínimo

```sql
-- Leads entrantes (raw + procesados)
CREATE TABLE leads_intake (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raw_payload JSONB NOT NULL,
    normalized JSONB,
    source VARCHAR(50) NOT NULL,       -- 'outbound', 'inbound_form', 'scraper', 'import', 'webhook'
    campaign VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'raw',  -- 'raw', 'enriched', 'ready_for_crm', 'in_crm', 'rejected', 'blacklisted'
    rejection_reason TEXT,
    pipedrive_person_id INTEGER,
    pipedrive_org_id INTEGER,
    pipedrive_lead_id VARCHAR(50),
    pipedrive_deal_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,         -- 'content_linkedin', 'content_newsletter', 'outbound_email', 'crm_create_bulk', 'crm_stage_change', 'instantly_draft'
    agent_name VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    payload_before JSONB,
    payload_after JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'expired'
    priority VARCHAR(10) DEFAULT 'normal',  -- 'low', 'normal', 'high', 'urgent'
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    decided_by VARCHAR(100),
    decided_at TIMESTAMPTZ,
    notes TEXT,
    slack_message_ts VARCHAR(50),      -- Slack message timestamp for updating
    execution_result JSONB             -- resultado de la acción ejecutada post-approval
);

-- Blacklist
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,         -- 'domain', 'email', 'company_name', 'pipedrive_org_id'
    value VARCHAR(255) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, value)
);

-- Logs de agentes
CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(10) NOT NULL,        -- 'info', 'warn', 'error'
    agent_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,      -- 'generate_post', 'search_pipedrive', 'create_org', 'send_slack', etc.
    details JSONB,
    duration_ms INTEGER,
    cost_cents INTEGER                 -- coste estimado de la llamada LLM
);

-- Campañas outbound
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,        -- ej: 'QSR_MADRID_ABR26'
    icp_criteria JSONB NOT NULL,       -- { "min_locations": 5, "concept_type": "QSR", "region": "Madrid" }
    status VARCHAR(20) DEFAULT 'active',  -- 'draft', 'active', 'paused', 'completed'
    target_accounts INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_leads_status ON leads_intake(status);
CREATE INDEX idx_leads_campaign ON leads_intake(campaign);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_type ON approvals(type);
CREATE INDEX idx_logs_agent ON agent_logs(agent_name);
CREATE INDEX idx_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_blacklist_type_value ON blacklist(type, value);
```

---

## 4. Integraciones externas: contratos

### 4.1 Pipedrive API v1

**Base URL:** `https://api.pipedrive.com/v1`
**Auth:** Query param `?api_token={PIPEDRIVE_API_TOKEN}`
**Rate limit:** 100 requests / 2 segundos por token.

Funciones del backend:

```typescript
// Búsqueda
async function searchPerson(email: string): Promise<PipedrivePerson | null>
async function searchOrganization(term: string): Promise<PipedriveOrg | null>
async function getOpenDeals(orgId: number): Promise<PipedriveDeal[]>

// Creación (siempre tras pasar dedup y blacklist)
async function createOrganization(data: OrgInput): Promise<PipedriveOrg>
async function createPerson(data: PersonInput): Promise<PipedrivePerson>
async function createLead(data: LeadInput): Promise<PipedriveLead>
async function createDeal(data: DealInput): Promise<PipedriveDeal>

// Actualización
async function addNote(entityType: string, entityId: number, content: string): Promise<void>
async function addActivity(dealId: number, data: ActivityInput): Promise<void>
async function updateDealStage(dealId: number, stageId: number): Promise<void>  // REQUIERE APPROVAL
```

### 4.2 Slack Bot API

**Auth:** Bearer token `SLACK_BOT_TOKEN`
**Canal principal:** `#marketing-approvals`

Funciones:

```typescript
async function sendApprovalRequest(approval: Approval): Promise<string>  // returns message_ts
async function updateApprovalMessage(messageTs: string, status: string): Promise<void>
async function sendDailyDigest(stats: DailyStats): Promise<void>
```

**Bloque Slack con botones:**

```json
{
  "blocks": [
    { "type": "header", "text": { "type": "plain_text", "text": "🔔 Approval pendiente — RDMKT-{id}" } },
    { "type": "section", "text": { "type": "mrkdwn", "text": "*Tipo:* {type}\n*Agente:* {agent}\n*Resumen:* {summary}" } },
    { "type": "section", "text": { "type": "mrkdwn", "text": "*Detalles:*\n```{payload_preview}```" } },
    { "type": "actions", "elements": [
      { "type": "button", "text": { "type": "plain_text", "text": "✅ Aprobar" }, "style": "primary", "action_id": "approve", "value": "{approval_id}" },
      { "type": "button", "text": { "type": "plain_text", "text": "❌ Rechazar" }, "style": "danger", "action_id": "reject", "value": "{approval_id}" }
    ]}
  ]
}
```

### 4.3 Instantly API (stub en V1)

**Base URL:** `https://api.instantly.ai/api/v1`
**Auth:** Query param `?api_key={INSTANTLY_API_KEY}`

En V1, solo definir interfaz:

```typescript
interface InstantlyDraft {
  campaignId: string;
  leads: Array<{ email: string; firstName: string; variables: Record<string, string> }>;
  sequenceSteps: Array<{ subject: string; body: string; delay_days: number }>;
}

// V1: solo preparar y almacenar payload, no enviar
async function prepareDraft(draft: InstantlyDraft): Promise<{ draftId: string; status: 'stored' }>
```

---

## 5. Panel de control (UI)

### Opción recomendada para V1

Extender la UI de Paperclip o crear una ruta adicional en Next.js (Vercel) con:

### Vistas mínimas

1. **Cola de approvals:** Lista de pendientes con tipo, agente, resumen, timestamp. Click para ver detalle + diff. Botones Aprobar/Rechazar.
2. **Logs recientes:** Tabla filtrable por agente, nivel, acción. Últimas 24h por defecto.
3. **Estado de agentes:** Lista con nombre, último heartbeat, budget consumido, issues abiertos.

### Auth

- V1: autenticación básica (username/password) o reuso del auth de Paperclip.
- No necesita roles complejos; solo Ricard accede.

---

## 6. Infraestructura y despliegue

### Docker Compose (local / staging)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: marketing_ops
      POSTGRES_USER: rockstar
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  paperclip:
    build: ./paperclip
    ports:
      - "3100:3100"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PAPERCLIP_HOME=/paperclip
      - MARKETING_OPS_URL=http://marketing-ops:8000
    depends_on:
      - postgres

  marketing-ops:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://rockstar:${DB_PASSWORD}@postgres:5432/marketing_ops
      - PIPEDRIVE_API_TOKEN=${PIPEDRIVE_API_TOKEN}
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
      - INSTANTLY_API_KEY=${INSTANTLY_API_KEY}
      - INTERNAL_API_KEY=${INTERNAL_API_KEY}
    depends_on:
      - postgres

volumes:
  pgdata:
```

### Variables de entorno (todas)

```
# Base de datos
DATABASE_URL=postgresql://rockstar:xxx@host:5432/marketing_ops

# Paperclip
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PAPERCLIP_AUTH_DISABLE_SIGN_UP=true

# Integraciones
PIPEDRIVE_API_TOKEN=...
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C...         # ID del canal #marketing-approvals
INSTANTLY_API_KEY=...

# Seguridad
INTERNAL_API_KEY=...           # Compartida entre Paperclip y backend
NODE_ENV=production|staging|development

# Observabilidad
LOG_LEVEL=info
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t marketing-ops ./backend
      # Push to ECR (producción) o deploy a Zeabur (validación)
```

### Entornos

| Entorno | Infra | BD | URL |
|---|---|---|---|
| Local | docker-compose | PostgreSQL local | localhost:3100 / localhost:8000 |
| Staging/Validación | Zeabur | PostgreSQL Zeabur | paperclip-xxx.zeabur.app |
| Producción | AWS ECS + RDS | RDS PostgreSQL eu-west-1 | paperclip.internal (via Tailscale) |

---

## 7. Tests mínimos obligatorios

```
tests/
├── integration/
│   ├── lead-intake.test.ts       # Crear lead → verificar en BD + Pipedrive mock
│   ├── deduplication.test.ts     # Lead existente → no duplicar
│   ├── blacklist.test.ts         # Lead en blacklist → rechazar
│   ├── approval-flow.test.ts     # Crear approval → aprobar → verificar ejecución
│   └── slack-notify.test.ts      # Enviar approval → verificar payload Slack
├── unit/
│   ├── normalize.test.ts         # Normalización de nombres de empresa
│   ├── dedup-logic.test.ts       # Lógica de matching domain/email/nombre
│   └── blacklist-check.test.ts   # Verificación contra blacklist
```

### Criterio de cobertura V1

- 80%+ en lógica de negocio (dedup, blacklist, normalización).
- 100% en flujo de approval (es la pieza de governance crítica).
- Tests de integración con mocks de Pipedrive API (no llamadas reales en CI).

---

## 8. Observabilidad

### Logs estructurados

Todas las entradas de log en JSON:

```json
{
  "timestamp": "2026-04-01T10:00:00Z",
  "level": "info",
  "service": "marketing-ops",
  "agent": "CRM_Hygiene",
  "action": "search_pipedrive",
  "details": { "term": "tragaluz.com", "results": 1, "matched_org_id": 12345 },
  "duration_ms": 234,
  "request_id": "uuid-xxx"
}
```

### Métricas básicas

- Requests por endpoint (count, latency p50/p95).
- Errores por servicio.
- Approvals pendientes (gauge — si crece, hay backlog).
- Budget consumido por agente (de Paperclip).

### Alertas (futuro, no V1)

- Approval pendiente >4h sin respuesta → notificación extra a Ricard.
- Error rate >5% en cualquier servicio → alerta Slack.
- Budget de agente al 80% → warning.
