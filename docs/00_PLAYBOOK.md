# RockstarData Marketing — Playbook Operativo (Paperclip AI)

## Qué es RockstarData

RockstarData (rockstardata.ai) es una plataforma SaaS B2B de orquestación semántica para HORECA (hostelería, restauración, catering). Conecta 30+ sistemas operativos (POS/TPV, inventario, contabilidad, RRHH, reservas, marketing, delivery) en una capa de inteligencia unificada con agentes prescriptivos IA.

- **Clientes:** ~40 grupos de restauración multi-local en España.
- **Producto principal:** 9 dashboards por rol + Chat con tus Datos + WhatsApp agents (63+ acciones MCP).
- **Segundo producto:** PilotStar — app móvil para operador single-location (24€/mes). Lanzamiento público: 1 mayo 2026.
- **Canal OEM:** White-label via partners POS (GLOP: 16K+ clientes, Agora, Loomis Pay) a €15-25/local/mes wholesale.
- **MRR actual:** 4.386€. ARR: 52.632€.
- **Pipeline:** 1.037 tratos en Pipedrive. 419 en restauración (15,7M€), 37 en fases avanzadas (631K€).
- **Entidad legal:** Rock Star Data Ventures, S.L. (CIF B19929561). Barcelona.

## ICP (Ideal Customer Profile)

### ICP 1: Grupos de Restauración

| Dimensión | Valor |
|---|---|
| Tipo empresa | Grupos multi-local (5-30+ locales) |
| Sector | Casual dining, QSR, fast casual, dark kitchens |
| País | España (primario). Francia, Italia, UK, Alemania (expansión) |
| Decisor | CEO / propietario del grupo |
| Champion | Controller financiero, Director de Operaciones |
| Pain principal | Datos fragmentados, food cost desconocido, 6h/semana mirando números sin decisiones |

### ICP 2: Distribuidores Tech / POS

| Dimensión | Valor |
|---|---|
| Tipo empresa | Proveedores POS, software HORECA |
| Decisor | CEO / Director de Producto |
| Pain principal | Clientes piden inteligencia, no pueden construirla sin canibalizar producto |

### Ciclo de venta

- ~45 días para restauración directa.
- Deal stages en Pipedrive: Contactado → Reunión → Oportunidad → Inminente → Ganado.

## Equipo de marketing actual

| Persona | Rol | Responsabilidades |
|---|---|---|
| **Ricard Vidal** | CEO & Co-founder | Outbound directo (#1 canal revenue), contenido estratégico (LinkedIn, Substack), relación inversores, cierre ventas |
| **Helena Pérez** | Product Manager / Marketing | Coordina Lucía y María, dashboard marketing, product marketing PilotStar |
| **Lucía** | Marketing — Contenido | Newsletters, contenido redes sociales |
| **María** | Marketing — Web/SEO | Web, SEO, landing pages |
| **Data Enrichment Specialist** | Enriquecimiento datos | Scraping, enrichment con Clay/Apollo/BetterContact, limpieza BBDD |

## Objetivo Q2 2026

**Foco dual:** generación de leads + autoridad de marca a partes iguales.

### KPIs objetivo

| KPI | Mes 1 | Mes 3 |
|---|---|---|
| Leads captados/mes | 50 | 200 |
| Leads calificados (3+ locales) | 15 | 60 |
| Demos solicitadas | 5 | 20 |
| Conversión demo→cierre | 20% | 25% |
| Clientes nuevos atribuibles | 1-2 | 4-6 |

### Cadencias de contenido

- **LinkedIn (perfil CEO Ricard):** 5 posts/semana (L-V).
- **Substack:** 3 newsletters/semana — 1 Hosteleros (H), 1 Distribuidores (D), 1 Inversores (I).
- **Outbound:** 200+ cuentas nuevas contactadas/mes.

### Tono de marca

Directo, data-driven, algo provocador. Languaging propio: "retención estructural no contractual", "moat compuesto", "orquestador semántico". Principio: "sin caja negra" — toda métrica transparente y explicable. Español nativo.

## Governance (reglas de los agentes)

### Chief Agent Officer: Ricard Vidal

### Modo: CONSERVADOR

Ninguna acción se ejecuta sin aprobación de Ricard.

### Líneas rojas (NUNCA sin aprobación humana)

1. Enviar emails a inversores.
2. Contactar cuentas en blacklist de Pipedrive.
3. Publicar contenido que mencione datos de clientes reales sin anonimizar.
4. Modificar secuencias activas en Instantly.
5. Cambiar configuración de Pipedrive/CRM.
6. Publicar directamente en LinkedIn o Substack.
7. Lanzar envíos en Instantly (solo crear borradores).

### Reporting

Dashboard unificado + resumen diario en Slack. Canal: `#marketing-approvals`.

## Organigrama de agentes (Fase 1 → Fase 3)

### Fase 1: Contenido (Día 1-5, 3 agentes)

```
Ricard Vidal (Board / Chief Agent Officer)
└── CEO Agent (Marketing Operating CEO)
    ├── LinkedIn Content Agent
    └── Approval Router Agent
```

### Fase 2: Outbound (Día 6-9, +3 agentes)

```
└── CEO Agent (Marketing)
    ├── LinkedIn Content Agent
    ├── Approval Router Agent
    ├── List Builder Agent
    ├── CRM Hygiene Agent
    └── Outbound Copy Agent
```

### Fase 3: Expansión (post-validación, +4 agentes)

```
└── CEO Agent
    ├── CMO Agent (Content Lead)
    │   ├── LinkedIn Content Agent
    │   ├── Substack Newsletter Agent
    │   ├── Repurposing Agent
    │   └── Content QA & Compliance Agent
    ├── Outbound Director Agent
    │   ├── ICP & Segmentation Agent
    │   ├── List Builder Agent
    │   ├── Enrichment & Verification Agent
    │   ├── Outbound Copy Agent
    │   └── CRM Hygiene Agent
    ├── Growth Ops Agent
    │   ├── Dashboard & KPI Agent
    │   └── Attribution / Analytics Agent
    └── Approval Router Agent
```

## Fichas de agentes V1 (Fase 1 + Fase 2)

### CEO Agent (Marketing)

- **reportsTo:** null (root)
- **heartbeat:** 86400s (1/día)
- **budget:** 3000 cents (30€/mes)
- **goal:** Publicar 5 posts/semana LinkedIn + 3 newsletters/semana. Atribuir 4-6 clientes nuevos a marketing en Q2.
- **capabilities:** Priorizar objetivos, crear issues para los demás agentes, detectar bloqueos.
- **NO hace:** No genera contenido, no construye listas, no contacta a nadie.

### LinkedIn Content Agent

- **reportsTo:** CEO Agent
- **heartbeat:** 10800s (cada 3h, max 3-4/día)
- **budget:** 5000 cents (50€/mes)
- **goal:** Producir 5 borradores de post LinkedIn/semana con tono definido.
- **inputs:** Issues tipo LINKEDIN_POST con brief (tema, audiencia H/D/I, CTA).
- **outputs:** Borrador completo como comentario en issue, marcado READY_FOR_REVIEW.
- **referencia:** Banco de 32 posts LinkedIn existentes + newsletters Substack + PRDs.
- **NUNCA:** Publicar en LinkedIn. Mencionar datos de clientes no anonimizados.

### Approval Router Agent

- **reportsTo:** CEO Agent
- **heartbeat:** 21600s (2x/día — 09:00 y 18:00)
- **budget:** 2000 cents (20€/mes)
- **goal:** Cola de READY_FOR_RICARD vacía al final de cada día laboral. Tiempo de aprobación <10 min/día.
- **inputs:** Issues en estado READY_FOR_REVIEW de cualquier agente.
- **outputs:** Mensaje en Slack `#marketing-approvals` con: resumen, diff, botones Aprobar/Editar/Rechazar.
- **NUNCA:** Publicar nada. Solo orquesta aprobaciones.

### List Builder Agent

- **reportsTo:** CEO Agent
- **heartbeat:** 86400s (1/día)
- **budget:** 4000 cents (40€/mes)
- **goal:** Generar 50-100 cuentas RAW/día para campañas activas.
- **fuentes:** Sales Navigator, Apify, Google Maps, directorios sectoriales, webs corporativas.
- **output:** Dataset en tabla intermedia con: empresa, nº locales, zona, tipo concepto, contacto si disponible.
- **NUNCA:** Escribir en Pipedrive directamente.

### CRM Hygiene Agent

- **reportsTo:** CEO Agent
- **heartbeat:** 7200s (cada 2h)
- **budget:** 3000 cents (30€/mes)
- **goal:** 0 duplicados y 100% respeto de blacklist.
- **flujo:** Tomar leads READY_FOR_CRM → buscar en Pipedrive por dominio/email/empresa → si existe actualizar, si no crear → marcar IN_CRM.
- **NUNCA:** Modificar deals existentes. Borrar registros. Ignorar blacklist.

### Outbound Copy Agent

- **reportsTo:** CEO Agent
- **heartbeat:** 21600s (2x/día)
- **budget:** 4000 cents (40€/mes)
- **goal:** Generar emails/secuencias de alta calidad para 200+ cuentas/mes.
- **input:** Personas/organizaciones marcadas IN_CRM en Pipedrive + contexto de campaña.
- **output:** Borradores de emails personalizados por segmento, listos para Instantly.
- **personalización:** Por segmento (vertical, tamaño, POS) para restauración. Hiper-personalización 1:1 para inversores (siempre con revisión).
- **NUNCA:** Enviar emails. Modificar secuencias activas en Instantly.

## Stack tecnológico

| Herramienta | Función | Integración necesaria |
|---|---|---|
| **Pipedrive** | CRM source of truth | API v1 — lectura/escritura de organizations, persons, leads, deals, activities, notes |
| **Instantly** | Email outbound sequences | API — crear leads en campañas borrador, NO enviar |
| **Slack** | Aprobaciones y reporting | Bot API — enviar mensajes a `#marketing-approvals` con botones |
| **Substack** | 3 newsletters/semana | API o manual — guardar como draft |
| **LinkedIn** | 5 posts/semana CEO | Manual o via herramienta auxiliar — scheduling |
| **Clay / Apollo / BetterContact** | Enrichment de leads | APIs para waterfall enrichment |
| **Apify** | Scraping estructurado | API para listas de restaurantes |
| **PostHog** | Analytics de producto | Solo lectura (instancia EU, GDPR) |
| **n8n** | Automatizaciones existentes | Webhooks, triggers |
| **Google Drive** | Assets, decks, excels | Lectura de contenido existente |
| **ConvertKit** | Email marketing | Gestión de listas |

## Despliegue

### Fase validación: Zeabur (tier gratuito)

- Deploy 1-click: https://zeabur.com/templates/E6H44N
- PostgreSQL 17 incluido automáticamente.
- Variables de entorno: ANTHROPIC_API_KEY, OPENAI_API_KEY, SLACK_BOT_TOKEN, PIPEDRIVE_API_TOKEN, INSTANTLY_API_KEY.

### Fase producción: AWS

- Compute: ECS Fargate (mismo stack que producto RockstarData).
- BD: RDS PostgreSQL (región eu-west-1, RGPD).
- Secretos: AWS Parameter Store o Secrets Manager.
- Acceso: Tailscale o VPN. Nginx como reverse proxy + SSL.
- RGPD: todos los datos en UE. Datos de clientes anonimizados para benchmarks.

## Plazos

- **Día 1:** Deploy Zeabur + crear company + primer agente.
- **Día 2-5:** 3 agentes contenido + Slack + flujo aprobación.
- **Día 6-9:** 3 agentes outbound + Pipedrive + Instantly.
- **Día 10-14:** Validación con métricas + decisión migración AWS.
- **Deadline MVP:** 12 abril 2026.
