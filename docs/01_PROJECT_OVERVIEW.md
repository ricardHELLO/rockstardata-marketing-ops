# RockstarData Marketing Ops — V1 Project Overview

## Objetivo

Construir un sistema de marketing & growth operations para RockstarData usando Paperclip AI como capa de orquestación multiagente, con Pipedrive como CRM maestro, que:

1. Genere y gestione leads cualificados HORECA (200+ cuentas/mes).
2. Orqueste producción de contenido (5 posts LinkedIn/semana + 3 newsletters/semana).
3. Centralice aprobaciones humanas (Ricard) antes de cualquier acción externa.
4. Mantenga trazabilidad completa de lo que hacen los agentes.

Esta V1 NO busca automatizar todo el departamento. El objetivo es una base sólida, auditable y desplegada que demuestre valor en 2 semanas.

## Alcance V1 (lo que entra)

### Infraestructura

- Paperclip AI self-hosted funcionando contra PostgreSQL (Zeabur para validar, AWS para producción).
- Backend "marketing-ops" para integraciones: Pipedrive, Slack, Paperclip.
- Panel mínimo para aprobar/rechazar acciones y ver logs.

### Agentes operativos (máximo 6)

1. **CEO Agent** — prioriza objetivos, crea issues.
2. **LinkedIn Content Agent** — genera borradores de posts.
3. **Approval Router Agent** — empaqueta approvals para Slack.
4. **List Builder Agent** — genera listas de cuentas RAW.
5. **CRM Hygiene Agent** — deduplica y sincroniza con Pipedrive.
6. **Outbound Copy Agent** — genera emails borrador para Instantly.

### Flujos funcionales

- **Flujo contenido:** CEO Agent crea brief → LinkedIn Content Agent genera borrador → Approval Router envía a Slack → Ricard aprueba.
- **Flujo outbound:** List Builder genera cuentas RAW → CRM Hygiene cruza vs Pipedrive → Outbound Copy genera emails → Approval Router envía a Slack → Ricard aprueba → se carga en Instantly como borrador.
- **Flujo leads inbound:** Endpoint HTTP recibe leads (forms, scrapers, n8n) → normalización → dedup vs Pipedrive → alta en Pipedrive → notificación Slack.

### Integraciones activas V1

- **Pipedrive:** lectura/escritura completa (organizations, persons, leads, deals, activities, notes).
- **Slack:** envío de notificaciones y approval requests con botones.
- **Instantly:** creación de leads en campañas borrador (NO envío).

### Integraciones stub V1 (interfaz definida, no implementada)

- Substack API (newsletters).
- Clay / Apollo / BetterContact (enrichment).
- Apify / Firecrawl (scraping).
- LinkedIn scheduling.
- PostHog (lectura analytics).

## Fuera de alcance V1 (explícitamente)

- **NO** implementar los 15 agentes del organigrama completo; máximo 6.
- **NO** enviar emails ni mensajes de LinkedIn de forma autónoma.
- **NO** tocar campañas existentes en Instantly, Substack, ni LinkedIn.
- **NO** hacer scraping complejo nuevo; asumir fuentes externas vía webhook/import.
- **NO** construir dashboards de KPIs de marketing (eso es entregable de Helena Q2).
- **NO** integrar con el producto RockstarData (Snowflake, dbt, etc.) — son mundos separados.
- **NO** construir sistema de facturación, pricing ni self-service.

## Stack preferido

| Capa | Tecnología | Notas |
|---|---|---|
| Orquestación IA | Paperclip AI (Node.js/React) | Self-hosted. MIT license. |
| Backend marketing-ops | Node.js/TypeScript (Express o NestJS) | Misma tecnología que Paperclip para simplificar. FastAPI (Python) aceptable como alternativa. |
| Base de datos | PostgreSQL 17 | Zeabur lo provisiona. En AWS: RDS. |
| Panel admin | Next.js o React SPA | Puede ser parte de Paperclip UI extendida o standalone en Vercel. |
| Infra validación | Zeabur (tier gratuito) | Deploy 1-click. |
| Infra producción | AWS (ECS Fargate + RDS) | Misma región e infra que producto RockstarData. |
| CI/CD | GitHub Actions | Lint + tests + build + deploy a staging. |
| Secretos | Variables de entorno (Zeabur) → AWS Parameter Store/Secrets Manager (producción) | Ningún secreto hardcodeado. |
| Observabilidad | Logs estructurados (JSON) + métricas básicas | En producción: CloudWatch o similar. |

## Definición de "done" para V1

1. Se puede levantar todo en local con `docker-compose up`.
2. README claro con pasos de despliegue a Zeabur y a AWS.
3. Paperclip y backend marketing-ops se comunican correctamente.
4. Crear un lead de prueba vía endpoint termina creando registros coherentes en Pipedrive según reglas de BUSINESS_RULES.md.
5. Toda acción externa requiere approval visible en Slack y en panel.
6. Los 6 agentes tienen heartbeats activos y producen outputs verificables.
7. Tests de integración para: intake de leads, deduplicación, flujo de approval.
8. Decisiones de arquitectura documentadas en DECISIONS.md.
