# ICP RockstarData — Definición para Agente de List Building

> Documento de referencia para construir listas de prospección.
> Última actualización: Marzo 2026

---

## ICP 1: GRUPOS DE RESTAURACIÓN

### 1.1 Definición del perfil ideal

| Dimensión | Valor ideal | Valor aceptable | Exclusión |
|---|---|---|---|
| **Nº locales** | 5-30+ | 3-4 (si crecimiento activo) | <3 locales (→ PilotStar, no RockstarData) |
| **Facturación grupo** | >2M€/año | >800K€/año | <500K€/año |
| **Formato** | Casual dining, fast casual, QSR organizado | Gastrobares, dark kitchens multi-marca, bakery chains | Fine dining puro (1-2 locales), chiringuitos estacionales |
| **Geografía** | España (cualquier CCAA) | Portugal, Francia, Italia (expansión) | Fuera de Europa |
| **Estructura societaria** | Multi-sociedad o sociedad única con multi-local | Franquicia con visibilidad centralizada | Franquiciado individual sin control de red |
| **Madurez tecnológica** | Usa POS cloud + algún software de gestión | Usa POS on-premise pero con voluntad de modernizar | Sin POS o solo caja registradora mecánica |
| **POS/TPV instalado** | GLOP, Agora, BDP, Revel, Lightspeed, ICG, Sighore | Cualquier POS con API o export de datos | POS propietario sin API ni export |
| **Pain visible** | Datos en 5+ sistemas sin cruzar, food cost desconocido en tiempo real | Usa Excel para consolidar, dedicando >4h/semana | Satisfecho con su setup actual, sin dolor percibido |
| **Decisor accesible** | CEO/propietario, COO, CFO directamente | Director de Operaciones, Controller financiero | Solo contacto con encargados de local |

### 1.2 Señales de alta intención (buscar activamente)

| Señal | Dónde buscarla | Por qué importa |
|---|---|---|
| **Apertura reciente de nuevos locales** | Google News, Google Maps (locales nuevos), LinkedIn del CEO, registro mercantil | Grupo en expansión = más dolor de consolidación de datos |
| **Contratación de Controller/CFO/COO** | LinkedIn Jobs, InfoJobs, Indeed | Están profesionalizando gestión → necesitan herramientas |
| **Búsqueda activa de software** | G2, Capterra reviews, preguntas en foros HORECA | Intent de compra directo |
| **Cambio de POS a cloud** | Noticias, LinkedIn del CTO/IT manager | Momento de transición tecnológica = ventana de venta |
| **Mención en prensa de crecimiento/inversión** | Alimarket, Restauración News, Gastroeconomy, Hosteltur | Capital disponible y voluntad de escalar |
| **Grupo con delivery propio** | Presencia en Glovo/UberEats/JustEat con marca propia multi-local | Más canales = más fragmentación de datos = más dolor |
| **Quejas públicas sobre gestión** | Google Reviews mencionando "desorganización", "esperas", "errores en cuenta" | Problemas operativos visibles = oportunidad |
| **Participación en ferias HORECA** | HIP (Hospitality Innovation Planet), Alimentaria, Hostelco | Perfil innovador, receptivo a tecnología |

### 1.3 Scoring de leads (0-100 puntos)

#### Criterios obligatorios (GATE — si no cumple, score = 0)

- [ ] ≥3 locales operativos
- [ ] Sector restauración (no catering industrial, no vending, no colectividades)
- [ ] España o mercado de expansión activo (PT, FR, IT)
- [ ] No en blacklist de Pipedrive
- [ ] No es cliente activo de RockstarData

#### Criterios de scoring

| Criterio | Puntos | Detalle |
|---|---|---|
| **Nº locales: 3-4** | +10 | Umbral mínimo |
| **Nº locales: 5-10** | +20 | Sweet spot |
| **Nº locales: 11-30** | +25 | Alta prioridad |
| **Nº locales: 30+** | +30 | Enterprise, ciclo más largo pero alto LTV |
| **Formato casual dining / fast casual** | +10 | Máximo fit con dashboards y KPIs |
| **Formato QSR organizado / franquicia** | +10 | Alto volumen de datos, necesidad de consistencia |
| **Formato dark kitchen multi-marca** | +5 | Fit parcial, mucha data de delivery |
| **POS compatible (GLOP, Agora, BDP, ICG, Sighore)** | +15 | Integración inmediata, onboarding rápido |
| **POS cloud cualquiera con API** | +10 | Integración viable |
| **POS solo on-premise sin API** | +0 | Fricción alta |
| **Decisor identificado (CEO, COO, CFO)** | +10 | Acceso directo al que firma |
| **Champion identificado (Controller, Dir. Ops)** | +5 | Facilitador interno |
| **Email corporativo verificado** | +5 | No gmail/hotmail del decisor |
| **Señal de alta intención (ver 1.2)** | +10 | Timing favorable |
| **Multi-sociedad** | +5 | Más complejidad = más valor de RockstarData |
| **Presencia en delivery (Glovo, UberEats, JustEat)** | +5 | Canal fragmentado adicional |
| **Facturación >5M€** | +5 | Capacidad de pago alta |

#### Clasificación por score

| Score | Categoría | Acción |
|---|---|---|
| 70-100 | **Tier A — Prioridad máxima** | Outbound inmediato, personalizado |
| 50-69 | **Tier B — Buen fit** | Secuencia outbound estándar |
| 30-49 | **Tier C — Potencial** | Nurturing vía newsletter, no outbound frío |
| <30 | **Descartado** | No contactar, posible candidato PilotStar si 1-2 locales |

### 1.4 Exclusiones explícitas (NUNCA prospectar)

| Tipo | Ejemplos | Razón |
|---|---|---|
| **Catering industrial / colectividades** | Aramark, Compass Group, Sodexo, ISS | Modelo operativo completamente diferente, no encaja con KPIs HORECA |
| **Vending** | Cualquier empresa de máquinas vending | Sin servicio de sala, sin food cost gestionable |
| **Hoteles puros (sin F&B significativo)** | Cadenas hoteleras sin restauración propia | Solo duermen, no comen — no generan data de restauración |
| **Catering de eventos** | Empresas de banquetes, bodas, eventos | Operación proyecto-a-proyecto, no recurrente |
| **Restauración social** | Comedores escolares, hospitalarios, residencias | Regulación diferente, márgenes incompatibles |
| **Chiringuitos / estacional puro** | Negocios que solo operan 3-4 meses/año | No generan suficiente data ni recurrencia |
| **Bares de copas / discotecas puras** | Sin cocina significativa | Sin food cost, sin gestión de compras relevante |
| **Clientes actuales RockstarData** | ~40 grupos activos | Solo cross-sell con aprobación, nunca outbound frío |
| **Blacklist Pipedrive** | Lista mantenida en CRM | Nunca contactar |

### 1.5 Datos a capturar por lead

| Campo | Obligatorio | Fuente probable |
|---|---|---|
| Nombre del grupo | ✅ | Web, LinkedIn, Google Maps |
| Nº de locales | ✅ | Google Maps, web corporativa, Alimarket |
| Nombres de los locales/marcas | ✅ | Google Maps, web |
| Formato(s) | ✅ | Web, reviews, categoría Google Maps |
| Ciudad/CCAA principal | ✅ | Google Maps |
| Web corporativa | ✅ | Google Search |
| Nombre del decisor (CEO/propietario) | ✅ | LinkedIn, registro mercantil, web |
| Cargo del decisor | ✅ | LinkedIn |
| Email del decisor | ✅ | Apollo, Hunter, web, LinkedIn |
| LinkedIn del decisor | ⬜ | LinkedIn Search |
| Teléfono | ⬜ | Web, directorios |
| POS/TPV que usan | ⬜ | BuiltWith, preguntar, inferir de fotos |
| Facturación estimada | ⬜ | Registro mercantil (SABI, Axesor, Infocif) |
| Nº empleados estimado | ⬜ | LinkedIn company page, registro mercantil |
| CIF | ⬜ | Registro mercantil |
| Presencia delivery | ⬜ | Glovo/UberEats/JustEat search |
| Señales de intención detectadas | ⬜ | Noticias, LinkedIn, G2 |
| Notas de contexto | ⬜ | Cualquier info relevante para personalizar outreach |

### 1.6 Fuentes de prospección (por orden de calidad)

1. **Alimarket (Restauración)** — Base de datos sectorial española. Directorio de cadenas con nº locales, facturación, decisores.
2. **Google Maps API / scraping** — Buscar por marca, contar locales, extraer dirección y categoría.
3. **LinkedIn Sales Navigator** — Cargo (CEO, COO, CFO) + industry (Restaurants) + company size (11-50, 51-200) + geography (Spain).
4. **Registro Mercantil (SABI, Axesor, Infocif, eInforma)** — Facturación, empleados, CIF, administradores.
5. **Prensa sectorial** — Alimarket, Restauración News, Gastroeconomy, Hosteltur, Foodservice España.
6. **Ferias** — Listados de expositores/asistentes de HIP, Alimentaria, Hostelco, Salón de Gourmets.
7. **Glovo/UberEats/JustEat** — Scraping de marcas multi-local presentes en las plataformas.
8. **TripAdvisor / TheFork** — Grupos con múltiples listings bajo misma empresa.
9. **Apollo.io** — Enriquecimiento de emails y datos de contacto.
10. **Google News alerts** — "grupo restauración" + "apertura" + "expansión" + "nuevos locales"

---

## ICP 2: DISTRIBUIDORES DE TECNOLOGÍA HORECA

### 2.1 Definición del perfil ideal

| Dimensión | Valor ideal | Valor aceptable | Exclusión |
|---|---|---|---|
| **Tipo empresa** | Proveedor de POS/TPV para HORECA | Software HORECA vertical (reservas, inventario, RRHH, contabilidad) | Software genérico sin foco HORECA |
| **Base de clientes** | >500 clientes HORECA activos | >100 clientes HORECA activos | <50 clientes o clientes no HORECA |
| **Modelo de negocio** | SaaS recurrente o licencia+mantenimiento | Hardware+software con canal de distribuidores | Solo hardware sin software propio |
| **Canal de distribución** | Red de distribuidores/partners | Venta directa + algunos partners | Solo venta directa sin canal |
| **Geografía sede** | España | Portugal, Francia, Italia, Alemania, UK | LATAM, Asia, USA (por ahora) |
| **Geografía clientes** | España multi-región | Concentrado en 1-2 CCAA pero con >200 clientes | <1 CCAA con <100 clientes |
| **Capacidad técnica** | API abierta documentada, cloud-native | API existente pero limitada, migración a cloud en curso | Sin API, solo on-premise cerrado, sin roadmap cloud |
| **Pain visible** | Clientes piden BI/analytics y no pueden ofrecerlo | Pérdida de clientes frente a competidores con analytics | Satisfecho con producto actual |
| **Decisor** | CEO, Director de Producto, CTO | Director Comercial, Head of Partnerships | Solo contacto con soporte técnico |

### 2.2 Tipos de distribuidor y prioridad

#### Tier A — Partners POS/TPV (máxima prioridad)

| Subtipo | Ejemplos conocidos | Potencial |
|---|---|---|
| **POS legacy con base masiva** | GLOP (16K+ clientes, 80 distribuidores), ICG, Cashlogy, Sintel | Máximo volumen. OEM white-label. Revenue share. |
| **POS cloud-native** | Agora, Lightspeed, Revel, Square, SumUp POS | API lista. Integración rápida. Clientes más tech-forward. |
| **POS híbridos (migrando a cloud)** | BDP, Sighore, TPV123, Dibal | Momento de transición = ventana de oportunidad. |

#### Tier B — Software HORECA vertical (segunda prioridad)

| Subtipo | Ejemplos conocidos | Potencial |
|---|---|---|
| **Reservas** | CoverManager, TheFork Manager, Resy | Dato de ocupación, no-shows, comensales. |
| **Inventario / compras** | Marketman, Apicbase, Haddock, TspoonLab | Dato de food cost, proveedores, escandallos. |
| **RRHH / turnos** | PayFit, Skello, Factorial, Kenjo | Dato de labor cost, absentismo, horas extra. |
| **Contabilidad** | Holded, Quipu, A3, Sage Despachos | Dato financiero consolidado. |
| **Marketing / fidelización** | ComeBack, Cheerfy, Loyverse | Dato de cliente, frecuencia, RFM. |
| **Delivery** | Deliverect, Hubrise, Ordatic | Dato de canal delivery, comisiones, mix. |
| **Pagos** | Loomis Pay, Dojo, SumUp, Bizum Business | Dato de transacciones, propinas, métodos de pago. |

#### Tier C — Consultoría e integradores

| Subtipo | Ejemplos | Potencial |
|---|---|---|
| **Consultoras HORECA** | Linkers, Diego Coquillat, Basque Culinary Center | Prescriptores, no partners de producto |
| **Integradores IT** | Empresas de TI que sirven a cadenas de restauración | Canal de reventa posible |
| **Asociaciones sectoriales** | Hostelería de España, Gremi de Restauració | Acceso a base de datos de asociados |

### 2.3 Señales de alta intención (buscar activamente)

| Señal | Dónde buscarla | Por qué importa |
|---|---|---|
| **Lanzamiento de módulo analytics/BI propio** | Blog del proveedor, Product Hunt, LinkedIn | Están intentando resolver el problema → les cuesta → oportunidad OEM |
| **Hiring de data engineers / BI developers** | LinkedIn Jobs | Están invirtiendo en inteligencia de datos → les puedes ahorrar el build |
| **Pérdida de clientes a competidores cloud** | LinkedIn posts del CEO quejándose, foros | Dolor competitivo directo |
| **Partnership con otro vendor de datos** | Comunicados de prensa, LinkedIn | Ya buscan soluciones externas → abiertos a partners |
| **Asistencia a HIP / eventos tech HORECA** | Listados de expositores | Perfil innovador |
| **Contenido sobre "el futuro del POS"** | Blog, LinkedIn del CEO/CTO | Pensando en evolucionar → receptivo |
| **Ronda de inversión reciente** | Crunchbase, prensa tech | Capital para invertir en producto |
| **Migración anunciada a cloud** | Blog, LinkedIn, prensa | Momento de máxima receptividad |

### 2.4 Scoring de leads (0-100 puntos)

#### Criterios obligatorios (GATE)

- [ ] Empresa de software/tech con clientes HORECA
- [ ] ≥50 clientes HORECA activos
- [ ] Sede o mercado principal en Europa
- [ ] No en blacklist de Pipedrive (272 distribuidores mapeados)
- [ ] No es partner activo de RockstarData (GLOP, etc.)

#### Criterios de scoring

| Criterio | Puntos | Detalle |
|---|---|---|
| **POS/TPV como producto principal** | +20 | Máxima prioridad — dato de ventas en tiempo real |
| **Software HORECA vertical (no POS)** | +10 | Dato complementario valioso |
| **Consultoría / integrador** | +5 | Prescriptor, no partner directo |
| **Base >1.000 clientes HORECA** | +15 | Volumen OEM significativo |
| **Base 500-999 clientes** | +10 | Buen volumen |
| **Base 100-499 clientes** | +5 | Volumen moderado |
| **API documentada y abierta** | +15 | Integración viable sin fricción |
| **API existente pero limitada** | +5 | Integración posible con trabajo |
| **Sin API** | +0 | Blocker técnico |
| **Red de distribuidores/partners >10** | +10 | Multiplicador de alcance B2B2B |
| **Modelo SaaS recurrente** | +5 | Alineado con modelo RockstarData |
| **Decisor identificado (CEO, CPO, CTO)** | +10 | Acceso directo |
| **Señal de alta intención (ver 2.3)** | +10 | Timing favorable |
| **Sede en España** | +5 | Mercado primario |
| **Sede en mercado de expansión (PT, FR, IT)** | +5 | Abre puerta a nuevo mercado |

#### Clasificación por score

| Score | Categoría | Acción |
|---|---|---|
| 70-100 | **Tier A — Partner estratégico potencial** | Outreach personalizado CEO-to-CEO, propuesta OEM/white-label |
| 50-69 | **Tier B — Buen candidato de integración** | Outreach por producto, propuesta de integración bidireccional |
| 30-49 | **Tier C — Prescriptor/nurture** | Invitar a eventos, enviar newsletter Distribuidores |
| <30 | **Descartado** | No prospectar activamente |

### 2.5 Exclusiones explícitas (NUNCA prospectar)

| Tipo | Ejemplos | Razón |
|---|---|---|
| **Software genérico sin foco HORECA** | Salesforce, HubSpot, Monday | No son canal relevante |
| **ERPs generalistas** | SAP, Oracle, Microsoft Dynamics | Demasiado grandes, no son partners reales |
| **Hardware puro sin software** | Fabricantes de impresoras térmicas, cajones portamonedas | Sin capa de datos |
| **Competidores directos** | Tenzo, Nory, Haddock (BI), Apicbase (BI) | Competencia, no partners |
| **Marketplaces de delivery** | Glovo, UberEats, JustEat (la plataforma) | Son fuente de datos, no partners |
| **Partners activos de RockstarData** | GLOP, Loomis Pay, CoverManager, TspoonLab | Ya son partners, no prospectar |
| **Blacklist Pipedrive** | 272 distribuidores mapeados en CRM | Nunca contactar |

### 2.6 Datos a capturar por lead

| Campo | Obligatorio | Fuente probable |
|---|---|---|
| Nombre empresa | ✅ | Web, LinkedIn, Crunchbase |
| Tipo de software | ✅ | Web (features page) |
| Producto principal | ✅ | Web |
| Nº clientes HORECA estimado | ✅ | Web ("trusted by X+ restaurants"), prensa, Crunchbase |
| Mercado geográfico | ✅ | Web, LinkedIn |
| Web corporativa | ✅ | Google Search |
| ¿Tiene API? | ✅ | Web (/developers, /api, /integraciones, swagger-initializer.js) |
| Nombre del decisor (CEO/CPO/CTO) | ✅ | LinkedIn, web (/about, /team) |
| Cargo del decisor | ✅ | LinkedIn |
| Email del decisor | ✅ | Apollo, Hunter, web |
| LinkedIn del decisor | ⬜ | LinkedIn Search |
| LinkedIn empresa | ⬜ | LinkedIn |
| Modelo de negocio (SaaS/licencia/hardware) | ⬜ | Web, pricing page |
| Red de distribuidores (sí/no, estimación) | ⬜ | Web (/partners, /distribuidores) |
| POS que integran (si aplica) | ⬜ | Web (/integraciones) |
| Ronda de inversión (si aplica) | ⬜ | Crunchbase, prensa |
| Señales de intención detectadas | ⬜ | LinkedIn, blog, noticias |
| Notas de contexto | ⬜ | Para personalizar outreach |

### 2.7 Fuentes de prospección (por orden de calidad)

1. **Directorio HIP (Hospitality Innovation Planet)** — Expositores de la feria HORECA más grande de España.
2. **Capterra / G2 categorías HORECA** — "Restaurant POS", "Restaurant Management", "Inventory Management for Restaurants".
3. **LinkedIn Sales Navigator** — Industry: "Computer Software" + keywords: "HORECA", "hostelería", "restauración", "POS", "TPV".
4. **Crunchbase** — Categorías: "Restaurant Technology", "Point of Sale", "Food Tech".
5. **Integraciones de POS conocidos** — Las páginas /integraciones de GLOP, Agora, Lightspeed listan partners que son exactamente nuestro ICP 2.
6. **Mapas de ecosistema** — FoodTech Spain, Spain FoodTech Ecosystem, informes de Alimarket sobre tech HORECA.
7. **Apollo.io** — Enriquecimiento de contactos una vez identificada la empresa.
8. **Prensa tech** — Xataka, TechCrunch (España), El Referente, Startupxplore.
9. **Web scraping de /swagger-initializer.js** — Patrón que indica que la empresa tiene API pública documentada.

---

## REGLAS GLOBALES PARA EL AGENTE

### Deduplicación

Antes de crear cualquier lead, el agente DEBE verificar:

1. ¿Existe ya en Pipedrive? (buscar por email, dominio, nombre normalizado)
2. ¿Está en blacklist? (dominio, email, empresa)
3. ¿Es cliente activo? (no outbound frío)
4. ¿Hay deal abierto para esa organización? (no duplicar, añadir nota)

**Regla: MEJOR ACTUALIZAR QUE CREAR.**

El backend (`/api/leads/intake`) ejecuta dedup automático contra la base de datos local y contra Pipedrive. El List Builder NO necesita verificar duplicados manualmente — solo enviar el batch completo con los datos recogidos. El sistema clasifica cada lead como: `net_new`, `new_contact_existing_org`, `existing_contact`, `duplicate_with_deal`, o `blocked`.

### Priorización de trabajo

1. Primero: ICP 1 Tier A (grupos 5+ locales con señales de intención)
2. Segundo: ICP 2 Tier A (POS con >500 clientes y API)
3. Tercero: ICP 1 Tier B (grupos 3-4 locales buen fit)
4. Cuarto: ICP 2 Tier B (software HORECA vertical)

### Output esperado por lead

```json
{
  "company_name": "Grupo La Tagliatella",
  "icp_type": "restauracion",
  "tier": "A",
  "score": 82,
  "score_breakdown": {
    "locales": 25,
    "formato": 10,
    "pos_compatible": 15,
    "decisor_identificado": 10,
    "email_corporativo": 5,
    "señal_intencion": 10,
    "multi_sociedad": 5,
    "facturacion": 2
  },
  "num_locales": 280,
  "formato": "casual dining",
  "geografia": "España multi-región",
  "web": "https://latagliatella.es",
  "pos_detectado": "desconocido",
  "decision_maker": {
    "nombre": "...",
    "cargo": "CEO",
    "email": "...",
    "linkedin": "..."
  },
  "champion": {
    "nombre": "...",
    "cargo": "Director de Operaciones",
    "email": "...",
    "linkedin": "..."
  },
  "signals": ["expansión reciente: 12 nuevos locales en 2025", "hiring de controller financiero"],
  "exclusion_check": {
    "blacklist": false,
    "cliente_activo": false,
    "deal_abierto": false
  },
  "notes": "Grupo grande con expansión agresiva. No tienen BI visible. Alto potencial."
}
```

### Naming convention de campañas

Formato: `{SEGMENTO}_{CIUDAD}_{MES}{AÑO}`
Ejemplos:
- `QSR_MADRID_ABR26`
- `FASTCASUAL_BCN_ABR26`
- `DARKK_MADRID_MAY26`

### Volumen objetivo

- 50-100 cuentas RAW por día por campaña activa
- De esas, esperar ~30-40% calificadas tras dedup y blacklist
- Meta mensual: 200+ leads calificados hacia CRM

### Idioma y tono en notas

- Notas internas: español, directo, factual.
- Nunca inventar datos. Si no se puede verificar un campo, dejarlo como `null` o `"desconocido"`.
- Siempre citar la fuente del dato (e.g., "LinkedIn CEO profile", "web /about", "Alimarket 2025").

---

## PROPUESTA DE VALOR POR ICP

### Para Grupos de Restauración

> "Conectamos tus 5+ sistemas (POS, contabilidad, RRHH, inventario, reservas, delivery) en una sola capa de inteligencia. 9 dashboards por rol, desde CEO hasta jefe de sala. Agentes IA que ejecutan acciones por WhatsApp. Sin caja negra: cada número es explicable y auditable. Resultado: de 6h/semana mirando Excel a 45 minutos con decisiones claras."

**Pains que resolvemos:**
- Food cost real desconocido hasta fin de mes
- Turno de noche sin supervisión
- Fraude invisible (descuentos, anulaciones, modificaciones)
- 5+ sistemas sin cruzar datos
- Decisiones por intuición, no por datos
- Controller financiero dedicando 60%+ del tiempo a consolidar

### Para Distribuidores Tech / POS

> "Tus clientes te piden analytics e inteligencia. No puedes construirlo sin destruir tu arquitectura. Nosotros lo hacemos en marca blanca sobre tu POS: tú vendes, tú facturas, tú retines al cliente. Tus distribuidores ganan por compartir un link — sin demos, sin desplazamientos. Resultado: de POS transaccional a plataforma de gestión inteligente."

**Pains que resolvemos:**
- Clientes migran a competidores cloud con analytics
- Distribuidores no tienen nada nuevo que vender
- El Innovator's Dilemma: no puedes construir orquestación sin canibalizar tu producto cerrado
- Churn invisible (on-premise no sabe cuántos pierde)
- Competidores como Agora, Tipsi, Haddock lideran la narrativa de innovación
