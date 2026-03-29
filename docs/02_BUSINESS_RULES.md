# RockstarData — Reglas de Negocio (CRM, Leads, Approvals, Contenido)

## Principio fundamental

**Pipedrive es el sistema maestro ("source of truth")** de todos los datos comerciales: personas, organizaciones, leads, deals y actividades.

Los agentes de Paperclip NUNCA interactúan directamente con APIs externas. Siempre pasan por el backend marketing-ops, que encapsula la lógica de negocio y mantiene audit trail.

---

## 1. Reglas de CRM (Pipedrive)

### 1.1 Estructura de Pipedrive

Pipedrive usa estos objetos principales:

- **Organizations:** Empresas / grupos de restauración.
- **Persons:** Contactos individuales (decisores, champions).
- **Leads:** Contactos cualificados que aún no tienen oportunidad activa.
- **Deals:** Oportunidades de negocio con pipeline y stages.
- **Activities:** Llamadas, emails, reuniones asociadas a deals/persons.
- **Notes:** Notas libres asociadas a cualquier objeto.

### 1.2 Campos obligatorios por objeto

#### Organization (empresa)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| name | texto | SÍ | Nombre del grupo (ej: "Grupo Tragaluz") |
| address | texto | Recomendado | Ciudad/región principal |
| Nº locales | custom field (número) | SÍ | Criterio clave de cualificación |
| Tipo concepto | custom field (selección) | SÍ | Casual dining, QSR, Fast casual, Dark kitchen, Ocio nocturno, Otro |
| POS utilizado | custom field (selección múltiple) | Recomendado | GLOP, CEGID, Agora, Revo, Otros |
| Fuente | custom field (selección) | SÍ | Outbound, Inbound, Referral partner, Evento, Web/tool |
| Campaña | custom field (texto) | Recomendado | Identificador de campaña (ej: QSR_MADRID_ABR26) |

#### Person (contacto)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| name | texto | SÍ | Nombre completo |
| email | email | SÍ | Al menos 1 email verificado |
| phone | teléfono | Recomendado | |
| org_id | referencia | SÍ | Siempre asociado a Organization |
| Cargo | custom field (texto) | Recomendado | CEO, COO, CFO, Controller, Dir. Operaciones |
| LinkedIn URL | custom field (URL) | Recomendado | |

#### Deal

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| title | texto | SÍ | Formato: "Empresa — Producto" (ej: "Grupo Tragaluz — RockstarData") |
| org_id | referencia | SÍ | |
| person_id | referencia | SÍ | |
| pipeline_id | referencia | SÍ | Pipeline de restauración por defecto |
| stage_id | referencia | SÍ | Empieza en "Contactado" |
| owner_id | referencia | SÍ | Ricard por defecto en V1 |

### 1.3 Deal stages (pipeline restauración)

1. **Contactado** — primer contacto realizado.
2. **Reunión** — demo o reunión agendada/realizada.
3. **Oportunidad** — interés confirmado, propuesta en curso.
4. **Inminente** — negociación avanzada.
5. **Ganado** — contrato cerrado.
6. **Perdido** — oportunidad descartada.

---

## 2. Reglas de leads

### 2.1 Creación de leads

Se crea un Lead en Pipedrive cuando:
- Llega un nuevo contacto desde formulario, scraping enriquecido o import.
- Tiene al menos: email verificado + nombre + empresa.
- El lead se asocia SIEMPRE a una Person y una Organization.

### 2.2 Conversión de lead a deal

Un Lead se convierte en Deal solo cuando:
- El contacto pide demo o reunión.
- Hay respuesta positiva clara en outbound (reply interesado).
- El lead cumple 100% ICP (5+ locales, España, no en blacklist) y se decide activarlo.

**Regla:** No se crean múltiples deals abiertos para la misma empresa sobre la misma oportunidad.

### 2.3 Cualificación

Un lead es **calificado** si:
- Organización tiene 3+ locales (idealmente 5+).
- Tiene decisor identificado (CEO, COO, CFO, Controller).
- Email verificado.
- No está en blacklist.
- Tiene concepto compatible (restauración, no catering industrial, no vending).

---

## 3. Deduplicación

### Orden de búsqueda ANTES de crear nada nuevo

#### Paso 1: Buscar Persona

```
GET /v1/persons/search?term={email}&fields=email
```
- Buscar por email (exacto, case-insensitive).
- Si existe → reutilizar persona, NO crear nueva.
- Si hay múltiples coincidencias → usar la más reciente con deal activo.

#### Paso 2: Buscar Organización

```
GET /v1/organizations/search?term={domain_or_name}
```
- Buscar por dominio de email (si no es gmail.com, hotmail.com, outlook.com, yahoo.com).
- Si dominio genérico → buscar por nombre normalizado (lowercase, sin "S.A.", "S.L.", "Group", "Grupo", puntuación).
- Si existe → reutilizar, NO crear nueva.

#### Paso 3: Buscar Lead/Deal abierto

```
GET /v1/deals?org_id={org_id}&status=open
```
- Si existe deal abierto para esa org → NO crear otro lead/deal.
- En su lugar: añadir nota o actividad al deal existente.

**Regla general: MEJOR ACTUALIZAR QUE CREAR.**

---

## 4. Blacklist y restricciones

### 4.1 Tipos de blacklist

| Tipo | Descripción | Acción |
|---|---|---|
| Dominio bloqueado | Dominios de empresas excluidas | No crear lead, registrar en logs |
| Email bloqueado | Emails individuales | No crear lead, registrar en logs |
| Empresa bloqueada | Organizaciones con las que no se trabaja | No crear lead, registrar en logs |
| Cliente activo | Clientes actuales de RockstarData | No iniciar outbound frío; sí se puede hacer cross-sell con aprobación |
| Distribuidor en blacklist | Pipedrive mantiene blacklist de distribuidores | No contactar |

### 4.2 Cómo verificar blacklist

- Mantener tabla `blacklist` en PostgreSQL del backend marketing-ops.
- Sincronizar con labels/tags de Pipedrive periódicamente.
- Toda verificación ocurre ANTES de crear nada en Pipedrive.

---

## 5. Ownership (asignación)

- En V1: **todo se asigna a Ricard** como owner por defecto.
- Futuro: reparto por segmento/vertical si se incorporan SDRs.
- El owner en Pipedrive debe coincidir siempre con el responsable real.

---

## 6. Approvals

### 6.1 Acciones que SIEMPRE requieren approval humano

#### Cambios en Pipedrive
- Cambio de stage a Ganado o Perdido.
- Cambio de owner.
- Borrado de cualquier registro.
- Creación masiva (>10 registros en un lote).

#### Acciones externas
- Envío de emails (outbound, follow-up, investor).
- Publicación de contenido (LinkedIn, Substack, web).
- Modificación de secuencias en Instantly.
- Contacto con cuentas enterprise o partners estratégicos.

### 6.2 Flujo de approval

```
1. Agente genera propuesta (payload con: tipo, resumen, diff before/after)
2. Backend crea registro en tabla `approvals` (status: PENDING)
3. Approval Router envía notificación a Slack #marketing-approvals
4. Ricard aprueba/rechaza via Slack o panel UI
5. Backend registra decisión (APPROVED/REJECTED + timestamp + decidido_por)
6. Solo si APPROVED: backend ejecuta la acción
7. Resultado se registra en logs
```

### 6.3 Formato del mensaje Slack

```
🔔 *Approval pendiente* — RDMKT-{id}
📌 *Tipo:* {contenido_linkedin | outbound_email | crm_update | ...}
📝 *Resumen:* {descripción breve}
👤 *Agente:* {nombre del agente}
📊 *Detalles:* {diff o borrador completo}
⏰ *Creado:* {timestamp}

[✅ Aprobar]  [✏️ Editar]  [❌ Rechazar]
```

---

## 7. Reglas de contenido

### 7.1 Posts LinkedIn

- Audiencia target rotativa: H (hosteleros), D (distribuidores), I (inversores).
- Banco de 32 posts existentes como referencia de tono y estructura.
- Dos variantes por post: A (dato/provocación), B (historia/reflexión).
- Hook en primera línea obligatorio (dato impactante o pregunta provocadora).
- CTA al final (comentario, link Substack, demo).
- NUNCA mencionar clientes reales sin anonimizar.
- NUNCA datos financieros internos de RockstarData.

### 7.2 Newsletters Substack

- 3 audiencias: Hosteleros (H), Distribuidores (D), Inversores (I).
- Templates definidos: Dato de la Semana, Playbook Operativo, Caso Real, Market Intelligence, Deep Dive, Behind the Scenes, Funding Radar.
- P.S. al final de cada newsletter con cross-link a la siguiente.
- Paywall strategy: contenido gratuito con upgrade a premium.
- 48h de margen mínimo entre borrador y fecha de envío.

### 7.3 Emails outbound

- Personalización por segmento para restauración (vertical, tamaño, POS).
- Hiper-personalización 1:1 para inversores (SIEMPRE con revisión).
- Secuencias típicas: 3-5 emails con espaciado de 3-5 días.
- Nunca más de 1 email/día a la misma persona.
- Subject lines cortos y directos, sin mayúsculas exageradas.

---

## 8. Reglas de seguridad y compliance

- **RGPD:** Todos los datos en UE. Consentimiento implícito en B2B para outbound legítimo interés.
- **API Keys:** Nunca hardcodeadas. Siempre via variables de entorno o secrets manager.
- **Datos de clientes:** Siempre anonimizados cuando se usan fuera del tenant. "Grupo Maresme" es el composite ficticio para demos/ejemplos.
- **Audit trail:** Toda acción de agente queda en log inmutable (append-only).
- **Rate limiting:** Respetar límites de API de Pipedrive (100 requests/2 segundos por API token).
