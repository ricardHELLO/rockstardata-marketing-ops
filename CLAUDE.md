# CLAUDE.md — Entry Point para Claude Code

## Proyecto

RockstarData Marketing Ops — Sistema de marketing automatizado con Paperclip AI.

## Cómo empezar

Lee estos archivos EN ESTE ORDEN antes de escribir código:

1. `docs/00_PLAYBOOK.md` — Contexto de negocio, ICP, equipo, agentes, tono de marca, governance.
2. `docs/01_PROJECT_OVERVIEW.md` — Alcance V1, stack, qué entra y qué NO entra.
3. `docs/02_BUSINESS_RULES.md` — Reglas de CRM, leads, dedup, blacklist, approvals, contenido.
4. `docs/03_TECH_SPEC.md` — Arquitectura, endpoints, modelos de datos, integraciones, infra.
5. `docs/04_TASK.md` — QUÉ construir, en qué ORDEN, definición de DONE.

## Reglas fundamentales

1. **Pipedrive es source of truth.** No inventar datos ni crear registros sin verificar dedup y blacklist.
2. **Toda acción externa requiere approval humano** (Ricard). No hay excepciones en V1.
3. **Los agentes NO llaman directamente a APIs externas.** Siempre pasan por el backend marketing-ops.
4. **No hardcodear secretos.** Todo via variables de entorno.
5. **Documentar decisiones en DECISIONS.md.** Si tomas una decisión de arquitectura, escríbela.
6. **Preguntar antes de suponer.** Si algo no está en los docs, pregunta. No inventes reglas de negocio.

## Stack

- **Backend:** Node.js / TypeScript / Express
- **BD:** PostgreSQL 17
- **Orquestación:** Paperclip AI (Node.js/React)
- **Integraciones:** Pipedrive API v1, Slack Bot API, Instantly API (stub)
- **Infra:** Docker Compose (local) → Zeabur (staging) → AWS ECS + RDS (producción)

## Comandos útiles

```bash
# Levantar todo en local
docker-compose up

# Solo backend en desarrollo
cd backend && npm run dev

# Tests
cd backend && npm test

# Lint
cd backend && npm run lint
```

## Estructura del proyecto

```
rockstardata-marketing-ops/
├── CLAUDE.md              ← Este archivo
├── DECISIONS.md           ← Documenta aquí tus decisiones
├── docker-compose.yml
├── .env.example
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── routes/
│   │   │   ├── leads.ts
│   │   │   ├── approvals.ts
│   │   │   ├── pipedrive.ts
│   │   │   ├── slack.ts
│   │   │   ├── instantly.ts
│   │   │   └── logs.ts
│   │   ├── services/
│   │   │   ├── pipedrive.service.ts
│   │   │   ├── slack.service.ts
│   │   │   ├── dedup.service.ts
│   │   │   ├── blacklist.service.ts
│   │   │   └── approval.service.ts
│   │   ├── models/
│   │   │   └── schema.sql
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── rateLimiter.ts
│   └── tests/
│       ├── unit/
│       └── integration/
├── paperclip/             ← Clonar repo oficial aquí
└── docs/
    ├── 00_PLAYBOOK.md
    ├── 01_PROJECT_OVERVIEW.md
    ├── 02_BUSINESS_RULES.md
    ├── 03_TECH_SPEC.md
    └── 04_TASK.md
```
