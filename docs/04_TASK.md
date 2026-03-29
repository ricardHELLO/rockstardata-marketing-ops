# Tarea V1 — Sprint de Implementación para Claude Code

## Tu rol

Actuar como ingeniero principal para implementar la V1 descrita en:

- `00_PLAYBOOK.md` — contexto de negocio, agentes, reglas operativas.
- `01_PROJECT_OVERVIEW.md` — alcance, stack, definición de done.
- `02_BUSINESS_RULES.md` — reglas de CRM, leads, approvals, blacklist.
- `03_TECH_SPEC.md` — arquitectura, endpoints, modelos de datos, integraciones.

Lee TODOS estos archivos antes de escribir una línea de código.

---

## Objetivo del sprint

Entregar una V1 desplegable en Zeabur que incluya:

1. **Paperclip AI** self-hosted funcionando contra PostgreSQL.
2. **Backend marketing-ops** con:
   - Endpoints de intake de leads.
   - Lógica de normalización + deduplicación.
   - Integración con Pipedrive (search/create person/org/lead).
   - Modelo de approvals y endpoints para gestionarlos.
3. **Integración con Slack** para approvals pendientes (con botones).
4. **Panel sencillo** para ver y decidir approvals.
5. **6 agentes configurados** en Paperclip con heartbeats activos.
6. **Infraestructura reproducible** (Docker + docker-compose + README).

---

## Orden de ejecución (fases)

### Fase A: Infraestructura base (primero)

1. Crear estructura de directorios del monorepo:
   ```
   rockstardata-marketing-ops/
   ├── docker-compose.yml
   ├── .env.example
   ├── README.md
   ├── DECISIONS.md
   ├── backend/
   │   ├── Dockerfile
   │   ├── package.json
   │   ├── tsconfig.json
   │   ├── src/
   │   │   ├── index.ts
   │   │   ├── config.ts
   │   │   ├── routes/
   │   │   ├── services/
   │   │   ├── models/
   │   │   └── middleware/
   │   └── tests/
   ├── paperclip/
   │   └── (se clona el repo oficial)
   └── docs/
       ├── 00_PLAYBOOK.md
       ├── 01_PROJECT_OVERVIEW.md
       ├── 02_BUSINESS_RULES.md
       └── 03_TECH_SPEC.md
   ```

2. Configurar docker-compose.yml con los 3 servicios (postgres, paperclip, marketing-ops).
3. Crear `.env.example` con todas las variables de entorno.
4. Verificar que `docker-compose up` levanta todo correctamente.

### Fase B: Backend marketing-ops (core)

1. Inicializar proyecto Node.js/TypeScript con Express.
2. Configurar conexión a PostgreSQL (usar `pg` o Prisma).
3. Crear migraciones para las tablas: `leads_intake`, `approvals`, `blacklist`, `agent_logs`, `campaigns`.
4. Implementar endpoints en este orden:
   a. `POST /api/leads/intake` — normalizar, verificar blacklist, dedup, crear en Pipedrive.
   b. `GET/POST/PATCH /api/approvals` — CRUD de approvals.
   c. `GET /api/pipedrive/search` — proxy de búsqueda en Pipedrive.
   d. `POST /api/pipedrive/create` — crear org/person con dedup.
   e. `POST /api/slack/notify` — enviar approval a Slack.
   f. `POST /api/slack/webhook` — recibir acciones de botones Slack.
   g. `POST /api/logs` — registrar acciones de agentes.
5. Implementar middleware de autenticación interna (INTERNAL_API_KEY).
6. Implementar rate limiting para Pipedrive (100 req / 2s).

### Fase C: Integraciones

1. **Pipedrive:** implementar funciones `searchPerson`, `searchOrganization`, `getOpenDeals`, `createOrganization`, `createPerson`, `createLead` como se describe en `03_TECH_SPEC.md`.
2. **Slack:** implementar `sendApprovalRequest` con bloques y botones interactivos.
3. **Instantly:** solo crear interfaz y almacenar payloads (stub).

### Fase D: Panel admin

1. Crear UI mínima (puede ser extensión de Paperclip UI o standalone React/Next.js).
2. Implementar: lista de approvals pendientes, detalle con diff, botones aprobar/rechazar, vista de logs.
3. Auth básica (username/password).

### Fase E: Tests

1. Tests unitarios para: normalización de nombres, lógica de dedup, verificación de blacklist.
2. Tests de integración con mocks para: intake de leads, flujo de approval, notificación Slack.
3. Verificar que todo pasa con `npm test`.

### Fase F: Documentación

1. README.md completo con: setup local, despliegue a Zeabur, variables de entorno, endpoints.
2. DECISIONS.md con todas las decisiones de arquitectura tomadas.

---

## Requisitos de trabajo

### OBLIGATORIO

- **Leer los 4 docs** antes de empezar.
- **Pedir aclaraciones** si algo es ambiguo o falta información crítica. No suponer reglas de negocio adicionales.
- **Documentar decisiones** en DECISIONS.md con formato: "Decisión: X. Razón: Y. Alternativas descartadas: Z."
- **No hardcodear secretos.** Todo via variables de entorno.
- **Respetar rate limits** de Pipedrive (100 req / 2s).
- **Logs estructurados** en JSON para toda acción relevante.
- **Approval flow funcional** — es la pieza más crítica de governance.

### PROHIBIDO

- No suponer reglas de negocio no escritas en `02_BUSINESS_RULES.md`.
- No llamar directamente a APIs externas desde agentes de Paperclip.
- No crear más de 6 agentes en V1.
- No implementar envío real de emails vía Instantly.
- No publicar nada en LinkedIn o Substack de forma autónoma.
- No usar ORMs pesados si Express + pg son suficientes (documentar si se decide usar Prisma).
- No construir dashboards de KPIs de marketing (fuera de scope).

### PREFERENCIAS

- Priorizar claridad y trazabilidad sobre "automatizar más cosas".
- Código TypeScript estricto (no `any`).
- Funciones pequeñas y bien nombradas.
- Comentarios solo cuando el "por qué" no es obvio del código.
- Preferir composición sobre herencia.

---

## Definición de "done"

### Funcional

- [ ] `docker-compose up` levanta todo el sistema en local.
- [ ] Crear un lead de prueba vía POST /api/leads/intake termina con registros coherentes en Pipedrive.
- [ ] Lead duplicado no crea nuevo registro en Pipedrive.
- [ ] Lead en blacklist es rechazado con motivo registrado en logs.
- [ ] Toda acción externa requiere approval visible en Slack + panel.
- [ ] Aprobar en Slack ejecuta la acción y actualiza el registro.
- [ ] Rechazar en Slack marca el approval como rejected sin ejecutar.
- [ ] Los 6 agentes están configurados en Paperclip con heartbeats.
- [ ] LinkedIn Content Agent genera borradores cuando tiene issues asignados.
- [ ] Approval Router envía resúmenes a Slack con botones funcionales.

### Técnico

- [ ] README con pasos de despliegue a Zeabur.
- [ ] Tests pasan con `npm test` (cobertura >80% en lógica de negocio).
- [ ] DECISIONS.md documenta al menos 5 decisiones de arquitectura.
- [ ] No hay secretos hardcodeados.
- [ ] Logs estructurados en JSON.
- [ ] docker-compose.yml funciona sin modificaciones manuales (solo .env).

### Criterio de aceptación

El sistema está "done" cuando Ricard puede:
1. Levantar todo con un comando.
2. Enviar un lead de prueba y verlo aparecer en Pipedrive.
3. Ver un borrador de post LinkedIn generado por un agente.
4. Recibir un approval en Slack y aprobarlo/rechazarlo con un click.
5. Ver en logs qué hizo cada agente y cuánto costó.

---

## Contexto adicional que puede ser útil

### Ejemplo de lead de prueba

```json
{
  "source": "outbound",
  "campaign": "QSR_MADRID_ABR26",
  "contacts": [
    {
      "name": "Juan García",
      "email": "juan@grupotragaluz.com",
      "company": "Grupo Tragaluz",
      "num_locations": 12,
      "concept_type": "casual_dining",
      "pos": "CEGID",
      "cargo": "Director de Operaciones"
    }
  ]
}
```

### Ejemplo de approval payload

```json
{
  "type": "content_linkedin",
  "agent_name": "LinkedIn Content Agent",
  "summary": "Post LinkedIn para audiencia H (hosteleros) sobre food cost",
  "payload_after": {
    "text": "El 73% de los hosteleros no conoce su food cost real hasta fin de mes.\n\nMientras tanto, pierden entre 3% y 8% de margen bruto por ineficiencias invisibles.\n\n¿La razón? Tienen los datos repartidos en 5 sistemas que no se hablan entre sí...",
    "audience": "H",
    "cta": "Comenta con 'DATO' y te cuento cómo calcularlo en 5 minutos"
  }
}
```

### Datos para blacklist inicial (cargar en seed)

```sql
INSERT INTO blacklist (type, value, reason) VALUES
  ('domain', 'gmail.com', 'Dominio genérico'),
  ('domain', 'hotmail.com', 'Dominio genérico'),
  ('domain', 'outlook.com', 'Dominio genérico'),
  ('domain', 'yahoo.com', 'Dominio genérico'),
  ('domain', 'icloud.com', 'Dominio genérico');
-- Añadir aquí empresas bloqueadas de Pipedrive
```
