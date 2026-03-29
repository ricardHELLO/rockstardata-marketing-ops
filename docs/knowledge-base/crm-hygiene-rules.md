# CRM Hygiene Rules — Pipedrive Source of Truth

Referencia completa para el agente de higiene CRM. Pipedrive es el sistema maestro.
NUNCA modificar deals existentes. NUNCA borrar registros. NUNCA ignorar la blacklist.

---

## Campos Obligatorios por Objeto

### Organization (empresa)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| name | texto | SÍ | Nombre del grupo (ej: "Grupo Tragaluz") |
| address | texto | Recomendado | Ciudad/región principal |
| Nº locales | `e8363efb...` (número) | SÍ | Criterio clave de cualificación |
| Tipo concepto | `1792d365...` (selección) | SÍ | Casual dining, QSR, Fast casual, Dark kitchen, Ocio nocturno, Otro |
| POS utilizado | `6a5d5f06...` (selección múltiple) | Recomendado | GLOP, CEGID, Agora, Revo, BDP, Lightspeed, ICG, Sighore, Last.app, Square, Otro, Desconocido |
| Fuente | `c6b71093...` (selección) | SÍ | Outbound, Inbound, Referral partner, Evento, Web/tool |
| Campaña | `94b70f47...` (texto) | Recomendado | Ej: QSR_MADRID_ABR26 |

### Person (contacto)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| name | texto | SÍ | Nombre completo |
| email | email | SÍ | Al menos 1 email verificado |
| phone | teléfono | Recomendado | |
| org_id | referencia | SÍ | Siempre asociado a Organization |
| Cargo | `1580bcc2...` (texto) | Recomendado | CEO, COO, CFO, Controller, Dir. Operaciones |
| LinkedIn URL | `c8b5a1c6...` (URL) | Recomendado | |

### Deal

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| title | texto | SÍ | Formato: "Empresa — RockstarData" |
| org_id | referencia | SÍ | |
| person_id | referencia | SÍ | |
| pipeline_id | referencia | SÍ | Pipeline ID = 4 |
| stage_id | referencia | SÍ | Empieza en "Contactado" |
| owner_id | referencia | SÍ | Ricard: ID 22822961 |

---

## Pipeline de Restauración — Deal Stages

1. **Contactado** — primer contacto realizado
2. **Reunión** — demo o reunión agendada/realizada
3. **Oportunidad** — interés confirmado, propuesta en curso
4. **Inminente** — negociación avanzada
5. **Ganado** — contrato cerrado (**requiere approval humano**)
6. **Perdido** — oportunidad descartada (**requiere approval humano**)

---

## Proceso de Deduplicación (Orden Estricto)

**Regla fundamental: MEJOR ACTUALIZAR QUE CREAR.**

### Paso 1 — Buscar Persona por email

```
GET $MARKETING_OPS_URL/api/pipedrive/search?email={email}
```

- Búsqueda exacta, case-insensitive
- Si existe → reutilizar, NO crear nueva persona
- Si múltiples coincidencias → usar la más reciente con deal activo

### Paso 2 — Buscar Organización

```
GET $MARKETING_OPS_URL/api/pipedrive/search?domain={domain}
```

- Usar dominio de email solo si NO es genérico
- **Dominios genéricos a ignorar:** gmail.com, hotmail.com, outlook.com, yahoo.com, icloud.com, live.com, me.com
- Si dominio genérico → buscar por nombre normalizado:
  - Lowercase
  - Eliminar: "S.A.", "S.L.", "Group", "Grupo", "Restaurant", "Restauración", puntuación
  - Ejemplo: "Grupo Tragaluz S.L." → buscar "tragaluz"

### Paso 3 — Verificar deal abierto

```
GET $MARKETING_OPS_URL/api/pipedrive/deals?org_id={org_id}&status=open
```

- Si existe deal abierto para esa org → NO crear otro lead/deal
- En su lugar: añadir nota o actividad al deal existente con los nuevos datos

### Árbol de decisión

```
¿Lead ya existe en blacklist?
  → SÍ: Rechazar. Registrar en logs. Parar.
  → NO: continuar

¿Persona ya existe por email?
  → SÍ: Reutilizar person_id. Verificar org.
  → NO: Crear nueva persona (solo con datos completos: nombre + email + org)

¿Organización ya existe?
  → SÍ: Reutilizar org_id.
  → NO: Crear nueva org (requiere: nombre + Nº locales + Fuente)

¿Deal abierto para esa org?
  → SÍ: Añadir nota al deal existente. NO crear nuevo deal.
  → NO: Solicitar approval para crear deal nuevo.
```

---

## Blacklist — Verificación

Tipos de blacklist y acción:

| Tipo | Acción |
|---|---|
| Dominio bloqueado | No crear lead. Registrar en logs. |
| Email bloqueado | No crear lead. Registrar en logs. |
| Empresa bloqueada | No crear lead. Registrar en logs. |
| Cliente activo | No outbound frío. Cross-sell solo con approval. |
| Distribuidor en blacklist | No contactar. |

**Endpoint para verificar:**
```
GET $MARKETING_OPS_URL/api/leads/check-blacklist?email={email}&domain={domain}
```

---

## Criterios de Cualificación de Lead

Un lead es **calificado** si cumple TODOS:

- [ ] Organización tiene 3+ locales (idealmente 5+)
- [ ] Decisor identificado: CEO, COO, CFO, Controller, Director de Operaciones
- [ ] Email verificado (no genérico, no rebotado)
- [ ] No está en blacklist
- [ ] Concepto compatible: restauración, casual dining, QSR, fast casual
- [ ] No es catering industrial, vending, o delivery-only sin locales físicos

**Score mínimo para activar outbound:** 40/100 (ver ICP scoring en icp-targeting.md)

---

## State Machine de Leads

```
net_new
  → [dedup check] → duplicate: añadir nota al deal existente
  → [blacklist check] → blacklisted: registrar y descartar
  → [qualif check] → unqualified: registrar motivo
  → qualified: solicitar approval para outbound

qualified + APPROVED
  → outbound_active: CRM Hygiene registra actividad en Pipedrive

outbound_active
  → responded: actualizar stage a "Reunión" si hay respuesta positiva
  → no_response: continuar secuencia hasta agotarla

responded + meeting
  → deal created: convertir lead a deal (con approval)
```

---

## Reglas de Formato — Pipedrive

### Normalización de nombres

- **Organizations:** Title case. Sin abreviaciones legales al principio. "Grupo Tragaluz" no "GRUPO TRAGALUZ S.L."
- **Persons:** "Nombre Apellido" — sin cargos en el nombre.
- **Deals:** "Empresa — RockstarData" (guión largo —, no guión corto -)

### Notas y actividades

- Toda nota debe incluir: fecha, fuente, agente que la generó
- Formato: `[RDMKT][AGENTE_ID] {descripción}` — ej: `[RDMKT][CRM_HYGIENE] Lead cualificado. Score: 72/100. POS: GLOP. Fuente: outbound_linkedin`
- Nunca dejar notas con información personal sensible fuera de los campos designados

### Rate limiting Pipedrive

- Límite: 100 requests / 2 segundos por API token
- Si recibes 429: esperar 2 segundos y reintentar max 3 veces
- Nunca lanzar búsquedas en paralelo masivas (máximo 5 concurrent)

---

## Acciones que Requieren Approval (NUNCA Ejecutar Directamente)

- Cambio de stage a **Ganado** o **Perdido**
- Cambio de owner
- Borrado de cualquier registro
- Creación masiva (>10 registros en un lote)
- Conversión de lead a deal

Para estas acciones: crear registro en `approvals` vía:
```
POST $MARKETING_OPS_URL/api/approvals
{
  "type": "crm_update",
  "summary": "descripción breve",
  "payload": { "before": {...}, "after": {...} },
  "requested_by": "crm_hygiene_agent"
}
```

---

## Endpoints del Backend Relevantes

```
GET  /api/leads?status=net_new              — leads pendientes de procesamiento
GET  /api/leads/check-blacklist             — verificar blacklist antes de crear
GET  /api/pipedrive/search?email={email}    — buscar persona por email
GET  /api/pipedrive/search?domain={domain}  — buscar org por dominio
GET  /api/pipedrive/deals?org_id={id}       — deals abiertos de una org
POST /api/approvals                         — solicitar approval para acción
POST /api/logs                              — registrar auditoría
```

Todos los endpoints requieren header: `x-api-key: $MARKETING_OPS_API_KEY`
