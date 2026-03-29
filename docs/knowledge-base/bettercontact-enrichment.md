# BetterContact — Waterfall Enrichment & Lead Finder

API para enriquecer contactos (email + teléfono) y encontrar leads nuevos basados en filtros.
BetterContact es un aggregator waterfall: intenta múltiples fuentes en cascada hasta encontrar datos verificados.

---

## Configuración

- **Base URL:** `https://app.bettercontact.rocks/api/v2`
- **Auth:** header `X-API-Key: $BETTERCONTACT_API_KEY`
- **Rate limit:** 60 requests/minuto por cuenta (todas las rutas combinadas)
- **Si recibes 429:** esperar 60 segundos y reintentar. Contactar soporte si necesitas más límite.

---

## Verificar Créditos (Antes de Lanzar Búsquedas)

```
GET https://app.bettercontact.rocks/api/v2/account
X-API-Key: $BETTERCONTACT_API_KEY
```

Respuesta:
```json
{
  "success": true,
  "credits_left": 32377,
  "email": "ricard@rockstardata.ai"
}
```

Regla: verificar `credits_left` antes de lanzar batches grandes. Si `credits_left < 50`, alertar a Ricard antes de continuar.

---

## ENDPOINT 1 — Waterfall Email & Phone Enrichment

**Caso de uso:** Tienes nombre + empresa/dominio de un contacto y necesitas su email de trabajo o teléfono directo.

### Paso 1 — Enviar leads para enriquecer

```
POST https://app.bettercontact.rocks/api/v2/async
X-API-Key: $BETTERCONTACT_API_KEY
Content-Type: application/json
```

**Body:**
```json
{
  "data": [
    {
      "first_name": "Josep Maria",
      "last_name": "González",
      "company_domain": "lapoma.es",
      "linkedin_url": "https://linkedin.com/in/josepgonzalez",
      "custom_fields": {
        "lead_source": "outbound_linkedin",
        "campaign": "QSR_BCN_ABR26",
        "pipedrive_org": "La Poma Barcelona"
      }
    }
  ],
  "enrich_email_address": true,
  "enrich_phone_number": true,
  "webhook": "$MARKETING_OPS_URL/api/webhooks/bettercontact"
}
```

**Reglas del body:**
- `data`: array de 1 a 100 contactos por request
- `first_name` + `last_name`: obligatorios siempre
- `company` O `company_domain`: al menos uno es obligatorio
- `linkedin_url`: opcional pero **muy recomendado para teléfono** — mejora significativamente la tasa de éxito
- `enrich_email_address`: true si quieres email de trabajo
- `enrich_phone_number`: true si quieres móvil directo
- `custom_fields`: úsalo para pasar metadatos que volverán en la respuesta (campaign, pipedrive_id, etc.)
- `webhook`: URL donde BetterContact enviará los resultados cuando termine

**Respuesta inmediata (201):**
```json
{
  "success": true,
  "id": "req_abc123xyz",
  "message": "Processing..."
}
```

Guarda el `id` para hacer polling o ignóralo si usas webhook.

---

### Paso 2a — Webhook (Preferido)

BetterContact llama a tu webhook cuando termina. Configura el endpoint en el backend:

```
POST $MARKETING_OPS_URL/api/webhooks/bettercontact
```

El payload del webhook tiene el mismo formato que la respuesta del GET (ver abajo).

### Paso 2b — Polling (Alternativa si no hay webhook)

```
GET https://app.bettercontact.rocks/api/v2/async/{id}
X-API-Key: $BETTERCONTACT_API_KEY
```

Haz polling hasta que `status === "terminated"`. Intervalo recomendado: cada 10 segundos.

**Respuesta completa (200, status: terminated):**
```json
{
  "id": "req_abc123xyz",
  "status": "terminated",
  "credits_consumed": 2,
  "credits_left": 32375,
  "summary": {
    "total": 1,
    "valid_emails": 1,
    "catch_all_safe": 0,
    "catch_all_not_safe": 0,
    "undeliverable": 0,
    "not_found": 0
  },
  "data": [
    {
      "enriched": true,
      "email_provider": "apollo",
      "contact_first_name": "Josep Maria",
      "contact_last_name": "González",
      "contact_email_address": "josepma@lapoma.es",
      "contact_email_address_status": "deliverable",
      "contact_job_title": "Director General",
      "contact_gender": "male",
      "custom_fields": {
        "lead_source": "outbound_linkedin",
        "campaign": "QSR_BCN_ABR26",
        "pipedrive_org": "La Poma Barcelona"
      }
    }
  ]
}
```

**Valores de `contact_email_address_status`:**
| Valor | Significado | Acción |
|---|---|---|
| `deliverable` | Email verificado, entregable | Usar directamente |
| `catch_all_safe` | Dominio catch-all, probablemente válido | Usar con precaución |
| `catch_all_not_safe` | Catch-all no confiable | No usar para cold outbound |
| `undeliverable` | Email inválido o rebotará | No usar |

**Si `enriched: false`:** BetterContact no encontró datos. Registrar como "not_found" en Pipedrive y no gastar más créditos en ese contacto.

---

## ENDPOINT 2 — Waterfall Lead Finder

**Caso de uso:** Necesitas encontrar leads nuevos que cumplan el ICP — directores de operaciones en grupos de restauración con GLOP o Agora.

### Paso 1 — Lanzar búsqueda

```
POST https://app.bettercontact.rocks/api/v2/lead_finder/async
X-API-Key: $BETTERCONTACT_API_KEY
Content-Type: application/json
```

**Body para ICP Restauración (Audiencia H):**
```json
{
  "filters": {
    "company_industry": {
      "include": ["restaurants", "food and beverage services", "hospitality"]
    },
    "company_headcount_min": 10,
    "company_headcount_max": 500,
    "lead_location": {
      "include": ["Spain", "España", "Barcelona", "Madrid", "Valencia", "Bilbao", "Sevilla"]
    },
    "lead_seniority": {
      "include": ["c_suite", "owner", "director", "head", "manager"]
    },
    "lead_function": {
      "include": ["operations", "general_management"]
    },
    "lead_job_title": {
      "include": ["CEO", "COO", "Director de Operaciones", "Director General", "Gerente General", "Controller", "CFO"],
      "exact_match": false
    }
  },
  "limit": 100,
  "offset": 0,
  "webhook": "$MARKETING_OPS_URL/api/webhooks/bettercontact-leads"
}
```

**Body para ICP Distribuidores (Audiencia D):**
```json
{
  "filters": {
    "company_industry": {
      "include": ["software development", "technology, information and internet", "IT services and IT consulting"]
    },
    "company_headcount_min": 5,
    "company_headcount_max": 200,
    "lead_location": {
      "include": ["Spain"]
    },
    "lead_seniority": {
      "include": ["c_suite", "owner", "director", "founder"]
    },
    "lead_function": {
      "include": ["sales", "business_development", "general_management"]
    }
  },
  "limit": 100,
  "offset": 0
}
```

**Parámetros de paginación:**
- `limit`: 1-200 (default 100). Usa 100 como máximo práctico.
- `offset`: para paginar. Segunda página = offset 100, tercera = offset 200.

**Respuesta inmediata (201):**
```json
{
  "success": true,
  "message": "Lead finder request accepted.",
  "request_id": "bc39ffbfc24cf043b748"
}
```

---

### Paso 2 — Obtener resultados

```
GET https://app.bettercontact.rocks/api/v2/lead_finder/async/{request_id}
X-API-Key: $BETTERCONTACT_API_KEY
```

**Respuesta completa:**
```json
{
  "id": "bc39ffbfc24cf043b748",
  "status": "terminated",
  "credits_left": "32275",
  "credits_consumed": "100",
  "summary": {
    "leads_found": 87
  },
  "leads": [
    {
      "contact_id": 123456,
      "contact_full_name": "Carlos Martínez",
      "contact_first_name": "Carlos",
      "contact_last_name": "Martínez",
      "contact_job_title": "CEO",
      "contact_seniority": "c_suite",
      "contact_headline": "CEO en Grupo Martínez Hostelería",
      "contact_email_address": "carlos@grupomartinez.es",
      "contact_phone_number": "+34 612 345 678",
      "contact_linkedin_profile_url": "https://linkedin.com/in/carlosmartinez",
      "contact_gender": "male",
      "contact_location_country": "Spain",
      "contact_location_city": "Barcelona",
      "company_name": "Grupo Martínez Hostelería",
      "company_domain": "grupomartinez.es",
      "company_industry": "restaurants",
      "company_size": "51-200 employees",
      "company_employees_range_start": 51,
      "company_employees_range_end": 200,
      "company_head_quarters_city": "Barcelona",
      "company_head_quarters_country": "Spain",
      "company_linkedin_url": "https://linkedin.com/company/grupomartinez",
      "company_website": "https://grupomartinez.es"
    }
  ]
}
```

---

## Flujo Completo: Lead Enrichment en el Contexto RockstarData

### Caso A — Enriquecer lead existente (nombre + empresa conocidos)

```
1. Verificar créditos: GET /account
2. Comprobar blacklist: GET $MARKETING_OPS_URL/api/leads/check-blacklist
3. Verificar dedup en Pipedrive: GET $MARKETING_OPS_URL/api/pipedrive/search?email=...
4. Si no existe → enviar a BetterContact: POST /async
5. Guardar request_id en BD
6. Cuando llega webhook o polling termina:
   - Si enriched: true + status: deliverable → crear/actualizar Person en Pipedrive
   - Si enriched: false → registrar "not_found" en nota Pipedrive, no crear lead
   - Si status: catch_all_not_safe → registrar pero no incluir en secuencia cold outbound
7. Si email encontrado → solicitar approval para outbound: POST $MARKETING_OPS_URL/api/approvals
```

### Caso B — Encontrar leads nuevos ICP

```
1. Verificar créditos: GET /account (necesitas ~1 crédito por lead)
2. Definir filtros según campaña activa
3. Lanzar búsqueda: POST /lead_finder/async
4. Cuando llega webhook:
   - Para cada lead: verificar blacklist + dedup Pipedrive
   - Filtrar por score ICP (ver icp-targeting.md)
   - Solo los que superen score 40/100 pasan a enriquecimiento adicional si falta email
   - Los que tengan email ya → solicitar approval para outbound directamente
5. Registrar todos los leads procesados en logs
```

---

## Reglas Operativas

- **Máximo 100 contactos por request** de enriquecimiento
- **No enriquecer contactos en blacklist** — verificar siempre antes de llamar a BetterContact
- **No re-enriquecer** si ya hay email `deliverable` en Pipedrive — es un gasto de créditos innecesario
- **Priorizar linkedin_url** en el payload cuando esté disponible — mejora la tasa de éxito en teléfono
- **Guardar siempre el `request_id`** en BD para auditoría y reconciliación
- **custom_fields es tu trazabilidad** — incluir siempre `campaign`, `lead_source`, y el ID de Pipedrive si ya existe
- **Si credits_left < 50:** parar operaciones de enrichment y alertar a Ricard vía log `level: warn`

---

## Mapeo BetterContact → Pipedrive

| Campo BetterContact | Campo Pipedrive | Notas |
|---|---|---|
| `contact_email_address` | email | Solo si status = deliverable o catch_all_safe |
| `contact_phone_number` | phone | |
| `contact_job_title` | Cargo (campo custom) | |
| `contact_linkedin_profile_url` | LinkedIn URL (campo custom) | |
| `company_name` | Organization.name | |
| `company_domain` | Organization.address (dominio) | |
| `company_size` | Nº locales (aproximado) | Convertir: 10-50 employees ≈ 2-5 locales |
| `contact_location_city` | Organization.address | |

---

## Errores Comunes

| Código | Causa | Acción |
|---|---|---|
| 401 | API key inválida o cabecera incorrecta | Verificar `X-API-Key` header |
| 406 | `request_id` inválido o malformado | Verificar que el ID no esté truncado |
| 429 | Rate limit (>60 req/min) | Esperar 60s y reintentar. Log `level: warn`. |
| `enriched: false` | Lead no encontrado en ninguna fuente | Registrar como not_found. No reintentar en 30 días. |
