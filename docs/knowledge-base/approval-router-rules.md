# Approval Router Rules — Flujo de Aprobaciones Humanas

Guía completa para el Approval Router Agent. Tu objetivo: mantener la cola `READY_FOR_RICARD` vacía antes de fin del día.
Ricard debe gastar <10 minutos/día en approvals. NUNCA apruebes ni rechaces nada tú mismo.

---

## Canal Slack de Aprobaciones

- **Canal:** #ops-approvals
- **Canal ID:** C0AQEHA2W2U
- **Workspace:** RockstarData

---

## Tipos de Approval y Prioridad

### Prioridad ALTA — Notificar inmediatamente

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `outbound_email` | Email a prospecto o inversor | Primer email frío, follow-up, retoma |
| `linkedin_post` | Post para publicar en LinkedIn | Cualquier variante A/B |
| `crm_update_critical` | Cambio de stage a Ganado o Perdido | Deal cerrado, deal descartado |
| `investor_contact` | Cualquier comunicación a inversor | Email, LinkedIn, deck |

### Prioridad MEDIA — Notificar en batch 2x/día (9h y 17h)

| Tipo | Descripción | Ejemplo |
|---|---|---|
| `newsletter_draft` | Borrador de newsletter Substack | Cualquier audiencia H/D/I |
| `crm_update_standard` | Cambios de datos en Pipedrive | Actualizar campos, añadir persona |
| `lead_batch_create` | Creación masiva (>10 registros) | Import de lista cualificada |

### Prioridad BAJA — Incluir en resumen diario

| Tipo | Descripción |
|---|---|
| `log_review` | Revisión de anomalías en logs |
| `blacklist_update` | Propuesta de añadir a blacklist |

---

## Formato del Mensaje Slack (Block Kit)

El backend construye el mensaje con `buildApprovalBlocks()`. Tú solo llamas al endpoint.

**Estructura del mensaje en #ops-approvals:**

```
🔔 Approval pendiente — RDMKT-{id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Tipo:    {tipo legible}
👤 Agente:  {nombre del agente}
📝 Resumen: {descripción en 1-2 líneas}
⏰ Creado:  {timestamp en Madrid timezone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{contenido completo: email borrador / post / diff CRM}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ✅ Aprobar ]    [ ❌ Rechazar ]
```

---

## Criterios de Auto-approve (Solo si el Backend lo implementa — no tú)

Estos criterios son para referencia futura del sistema. El agente NUNCA auto-aprueba.

| Condición | Regla |
|---|---|
| Template ya aprobado anteriormente sin modificaciones | Solo backend puede verificar hash idéntico |
| Newsletter de tipo "datos públicos del sector" sin datos de clientes | Requiere flag `auto_approvable: true` del agente generador |
| Actividad CRM de bajo riesgo (añadir nota, no modificar datos core) | Solo lectura o notas, nunca cambio de stage/owner |

En V1: **todo pasa por Ricard**. No hay auto-approve activo.

---

## Flujo Completo de Approval

```
1. Agente (LinkedIn, Outbound, CRM Hygiene) genera propuesta
   → POST /api/approvals con payload completo

2. Backend crea registro en tabla `approvals`
   → status: PENDING
   → Asigna ID: RDMKT-{timestamp}-{tipo}

3. Approval Router detecta approval pendiente
   → GET /api/approvals?status=pending
   → Para cada approval nuevo: verificar que no ha sido notificado ya

4. Approval Router envía notificación Slack
   → POST /api/slack/notify con { approval_id }
   → Backend construye Block Kit y envía al canal

5. Ricard hace click en Aprobar o Rechazar en Slack

6. Slack envía interaction payload al backend
   → POST /api/slack/webhook (ya configurado)
   → Backend actualiza approval a APPROVED o REJECTED
   → Si APPROVED: backend ejecuta la acción
   → Si REJECTED: acción descartada, se registra motivo si lo hay

7. Resultado final registrado en logs
```

---

## Cómo Detectar y Manejar Approvals Pendientes

### Verificar cola

```
GET $MARKETING_OPS_URL/api/approvals?status=pending
  -H "x-api-key: $MARKETING_OPS_API_KEY"
```

Respuesta esperada:
```json
{
  "approvals": [
    {
      "id": "RDMKT-20260329-001",
      "type": "outbound_email",
      "status": "PENDING",
      "summary": "Email outbound a Josep Maria González, La Poma Barcelona",
      "created_at": "2026-03-29T09:15:00Z",
      "slack_notified": false,
      "requested_by": "outbound_copy_agent"
    }
  ]
}
```

### Enviar notificación

Solo si `slack_notified: false`:

```
POST $MARKETING_OPS_URL/api/slack/notify
  -H "x-api-key: $MARKETING_OPS_API_KEY"
  -H "Content-Type: application/json"
  -d '{ "approval_id": "RDMKT-20260329-001" }'
```

### Confirmar notificación enviada

El backend marca `slack_notified: true` automáticamente al enviar. No necesitas hacer nada adicional.

---

## Manejo de Silencio (No Respuesta de Ricard)

Si un approval lleva >4 horas en PENDING sin respuesta:

1. Re-notificar con mensaje de recordatorio (solo 1 re-notificación por approval)
2. Registrar en logs: `{ "level": "warn", "action": "approval_pending_reminder", "approval_id": "..." }`
3. NO escalar a otro canal. NO aprobar automáticamente. NO rechazar.

Si lleva >24 horas: registrar como `EXPIRED` en logs para revisión manual.

---

## Reglas Absolutas

- **NUNCA** aprobar ni rechazar una acción tú mismo
- **NUNCA** publicar contenido sin approval confirmado (status = APPROVED)
- **NUNCA** enviar emails sin approval confirmado
- **NUNCA** modificar el payload de un approval después de enviado
- **SIEMPRE** verificar que el approval no fue ya notificado antes de enviar a Slack
- **SIEMPRE** registrar en logs cada acción (notificación enviada, recordatorio, expirado)

---

## SLA por Tipo

| Tipo | Tiempo objetivo de respuesta de Ricard | Acción si supera |
|---|---|---|
| Outbound email (prospect activo) | 2 horas | Recordatorio único |
| LinkedIn post | 4 horas | Recordatorio único |
| CRM crítico (Ganado/Perdido) | 1 hora | Recordatorio a las 30 min |
| Newsletter | 24 horas | Recordatorio al día siguiente |
| Batch lead import | 4 horas | Recordatorio único |

---

## Endpoints del Backend Relevantes

```
GET  /api/approvals?status=pending    — cola de approvals pendientes
GET  /api/approvals/{id}              — detalle de un approval específico
POST /api/slack/notify                — enviar notificación Slack para un approval
POST /api/logs                        — registrar auditoría de acciones del agente
```

Todos los endpoints requieren header: `x-api-key: $MARKETING_OPS_API_KEY`

---

## Log Format

Cada acción debe quedar registrada:

```json
{
  "level": "info",
  "agent_name": "approval_router",
  "action": "slack_notification_sent",
  "details": {
    "approval_id": "RDMKT-20260329-001",
    "type": "outbound_email",
    "channel": "C0AQEHA2W2U"
  }
}
```

Acciones a loggear: `slack_notification_sent`, `slack_reminder_sent`, `approval_expired`, `queue_empty`.
