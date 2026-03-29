# Datos y Casos Reales — Referencia para Contenido RockstarData

Estos son los datos, cifras y casos reales que han aparecido en las newsletters publicadas.
Úsalos como referencia cuando generes posts. NO inventar datos nuevos — usar solo estos o pedir validación.

---

## Audiencia H — Hosteleros

### Food Cost

- Food cost medio en hostelería española: 30-35% de la facturación
- Food cost ha subido un **3,2 puntos** en el último trimestre (datos Q1 2026)
- El 70% de la subida de food cost no viene del proveedor — viene de problemas internos
- Escandallos: el grupo medio los revisa **cada 8 meses**. Los mejores cada 6 semanas.
- Gramajes reales superan al teórico en un **15%** de media (sin control activo)
- **Caso real:** Grupo de 4 gastrobares en Madrid → bajó food cost 4,5 puntos en 30 días sin cambiar proveedor = 97.200€/año
- **Caso real — Grupo Maresme (7 locales, 2,8M€ facturación):**
  - 1 local llevaba 14 meses perdiendo dinero (47.000€ pérdidas acumuladas)
  - 4 meses después de conectar datos: food cost de 33,4% → 29,3% (-4,1 puntos)
  - Local deficitario: de -3.200€/mes a +1.100€/mes
  - Carta reducida de 52 a 38 platos
  - Frase del cliente: "En 9 años nunca supe realmente cuánto ganaba cada local. Ahora lo sé cada lunes a las 9:00."

### Coste Laboral y Turnos

- Coste de personal: **30-38%** de la facturación en hostelería española (2ª partida del P&L)
- Hostelero medio tiene entre **12% y 18%** de horas de personal mal asignadas
- **Caso real — Valencia (6 restaurantes):**
  - Coste laboral bajó de 47.000€ a 41.300€/mes (-12%) en 60 días
  - Sin despedir a nadie — redistribución de horas
  - El 62% del coste laboral del valle (16:00-19:30) atendía media de 3,2 comensales/hora
- Ratio óptimo comensales/camarero por tipo:
  - Fast casual: 18-22 comensales
  - Casual dining: 12-16 comensales
  - Fine dining: 6-10 comensales
- Turno fantasma: cuando coste laboral de la franja supera el **45%** del revenue de esa franja
- **Caso real — Bilbao (3 locales):** 23 turnos fantasma/semana = 69h = 966€/semana = ~50.000€/año quemados
- **Caso real — Sevilla (8 locales):** Flex staffing con CoverManager + AEMET → horas extra reducidas **34%** en temporada de terrazas

### Rotación de Personal

- Rotación media del sector HORECA español: **40-60% anual**
- Coste real por salida (media ponderada grupo típico): **4.700€**
  - Camarero: 2.400€
  - Cocinero: 3.200€
  - Jefe de sala: 5.500€
  - Gerente: 8.000€
- Coste visible (finiquito) = **15%** del coste real. El 85% es invisible.
- Para grupo de 5 locales con 50 empleados y rotación del 40%: **94.000€/año** en rotación
- **El dato que cambia todo:** el 60% de las bajas ocurren en los primeros **3 meses**
- Tasa de retención a 90 días del grupo medio: **55%** (solo 5 de cada 10 llegan al 4º mes)
- Con plan de onboarding estructurado: tasa de retención a 90 días del **80%+**
- La rotación se concentra: en un mismo grupo puede haber un local con 60-70% y otro con 15-20%

### KPIs Semanales (Audiencia H)

| Métrica | Objetivo | Alarma |
|---|---|---|
| Revenue por hora laboral | >45€ | <35€ |
| % Coste laboral sobre ventas | 28-32% | >36% |
| Ratio comensales/empleado | Según tipo | >20% desviación |
| % Turnos fantasma | <8% | >15% |
| Rotación anualizada por local | <30% | >45% |
| Retención a 90 días | >80% | <60% |

### Fraude Operativo

- En grupos auditados por RockstarData: **80%** tiene al menos un vector de fraude activo desconocido
- **Caso real — Cadena de 6 pizzerías (norte de España):**
  - 49.653€ en descuadres de caja en 5 meses
  - 328 facturas eliminadas por 20.135€ — 1 operaria responsable de 165 de ellas (100% post-facturación en efectivo)
  - Mermas al 0,28% (sector espera 0,5-2%)
  - Total fraude: ~12.000€/mes durante 5+ meses
  - Sistemas conectados: Last.app (TPV) + TspoonLab + Holded + Skello
  - Un auditor externo: 4-8 semanas + 10.000€. RockstarData: primer cruce de datos, automático.
- Benchmarks de merma por tipo:
  - Quinta gama: 0,5-2%
  - Casual dining: 2-4%
  - Fine dining: 3-6%
  - Fast food: 1-3%
- Alarmas de fraude:
  - Descuadre >200€ en un día en un local
  - >5 facturas eliminadas por operario/semana
  - Merma mensual <0,3% en cualquier local
  - Desviación food cost real vs. teórico >4 puntos durante 2 semanas

---

## Audiencia D — Distribuidores Tech HORECA

### Datos del Mercado

- 280.000 establecimientos hosteleros en España
- Solo el **16%** tiene digitalización más allá del POS = 235.000 sin inteligencia operativa
- Solo el **11%** de restaurantes con 3+ locales tiene sus sistemas conectados entre sí
- El **73%** de grupos con 5+ locales ha probado alguna IA en últimos 12 meses
- El **64%** de grupos que evaluaron tech en 2025 pidieron ROI demostrable en 90 días
- El **82%** de los restaurantes con 3+ locales tiene 4+ herramientas operando en paralelo
- Churn medio en POS hostelería España: **15-25%** anual
- Licencia media de POS: 50-90€/local/mes → comisión distribuidor: 10-27€/mes

### Stack Tecnológico (7 Capas)

1. POS/TPV (~95% adopción en >300K€/año)
2. Gestión de personal/turnos (~35% en grupos 3+)
3. Reservas/CRM (~45% en restaurantes con mesa)
4. Delivery/Marketplaces (~60% en delivery)
5. Contabilidad/ERP (~90%)
6. BI/Analítica (<10%)
7. Inventario/Compras (~20% en grupos 5+)

Solo **6 de 21 cruces posibles** entre capas funcionan hoy en España. 15 en rojo.

### Bundles para Distribuidores

**Bundle 1 — Control de Costes:** POS + Inventario + BI
- Precio: 120-180€/local/mes (vs. 70€ solo POS)
- Argumento: "Baja food cost 3-5 puntos en 30 días"
- Target: grupos con food cost >32%

**Bundle 2 — Eficiencia Operativa:** POS + Personal + BI
- Precio: 140-200€/local/mes
- Argumento: "Ahorra 12% en coste laboral sin despedir a nadie"
- Target: grupos con coste laboral >34%

**Bundle 3 — Visión 360:** POS + Personal + Inventario + Contabilidad + BI
- Precio: 200-300€/local/mes
- Argumento: "Sabe cada lunes si ganas o pierdes en cada local"
- Target: grupos 5+ locales con asesor externo

### Caso Real Distribuidor

**Distribuidor GLOP, Levante, 80+ clientes (implementó framework sept-2025):**
| Métrica | Antes | Después |
|---|---|---|
| Ticket medio | 74€/mes | 122€/mes (+65%) |
| Churn anual | 22% | 15% |
| Deals nuevos Q4 2025 | 8 | 11 (+37%) |
| Revenue mensual | ~6.100€ | ~10.100€ (+65%) |
| Margen bruto mensual | ~1.500€ | ~3.800€ (+153%) |

El diagnóstico gratuito de 15 minutos: de 30 clientes contactados → 23 aceptaron → 18 pidieron demo → 12 contrataron el primer mes.

### Argumentos de Venta por POS

| POS | Ángulo | Objeción típica | Respuesta |
|---|---|---|---|
| CEGID | "CEGID tiene datos, RockstarData desbloquea todo su potencial" | "Ya tiene informes" | "¿Compara food cost entre locales en tiempo real? ¿Cruza ventas con turnos?" |
| GLOP | "Mayor base instalada España. BI añade benchmark de mercado" | "GLOP va a sacar su propia BI" | "La de GLOP solo es GLOP. Una capa neutral conecta turnos, inventario y contabilidad." |
| Revo | "API más moderna y documentada. Candidatos perfectos para empezar" | "Ya tiene buena analítica" | "Para 1 local, bien. Para 5+ locales con alertas y cruce con turnos, necesitas orquestación." |
| Agora | "Invirtiendo en apertura de API. Preparados para agentes IA que vienen" | "Esperamos a que Agora lo integre" | "¿Cuánto vas a esperar? Mientras, pierdes €X/mes por falta de visibilidad." |
| Last.app | "API más moderna del mercado español. Propuesta más avanzada posible" | "Last.app ya hace todo" | "No cruza con Skello, Holded, ni Gstock. La BI conecta todo el ecosistema." |

### Pricing de Referencia

- Capa BI sola: 50-150€/local/mes
- Bundle básico: 120-180€/local/mes
- Bundle premium: 200-300€/local/mes
- ROI mínimo que el hostelero debe percibir: **3x en primeros 90 días**
- Savings típicos: 3.000-6.000€/mes en grupo de 5 locales (coste laboral) + 2.000-5.000€/mes (food cost)

---

## Audiencia I — Inversores

### Tamaño de Mercado

- **TAM Europa:** ~800M€ (analítica básica) → 1.200-1.500M€ con agentes IA
- **SAM España:** ~65M€/año (75.000 locales × 72€/mes × 12)
- **SOM 36 meses:** 5.000-8.000 locales conectados = 4-6M€ ARR
- Mercado global POS restauración: 25.100M$ (2025) → 49.300M$ (2035)

### Landscape Competitivo

| Empresa | Funding | Modelo | Debilidad |
|---|---|---|---|
| Nory (UK/IE) | $63M (Serie B) | Replacement (OS completo) | No funciona en mercados fragmentados |
| Tenzo (UK) | ~$7M | Analytics puro | Sin capa de ejecución |
| Apicbase (BE) | ~$8M | Food cost solo | Vertical estrecho |
| Haddock (ES) | ~$2M | Fintech + OCR facturas | No cruza datos operativos |
| SOUS (NL) | €4M (Seed) | Agentes IA marketing | Solo marketing, no operaciones |
| MarginEdge (US) | ~$20M | Invoice + analytics | Solo US |
| **RockstarData** | Pre-seed | Orquestación vendor-neutral | Temprano en revenue |

### Unit Economics

**Canal Directo:**
- ARPA: 3.000-6.000€/año
- CAC: 3.000-5.000€
- Payback: 7-12 meses
- LTV/CAC: 4-6x

**Canal B2B2B (distribuidores POS):**
- ARPA efectivo: 800-1.200€/año (después de rev share)
- CAC: 200-400€ (10x inferior al directo)
- Payback: 3-6 meses
- LTV/CAC: 6-8x

### Funding Radar (Datos Q1-Q2 2026)

**Marzo 2026:** €87M totales en restaurant tech europeo
- Outpost: $17,5M (supply chain, ex-Revolut, Ribbit Capital)
- Choice: $7,1M (gestión digital, República Checa, expansión a España)
- Alpa: €2,9M (finanzas real-time, UK)
- Tendencia: capital baja 22% pero más concentrado en tracción demostrada

**Abril 2026:**
- SOUS: €4M (Países Bajos, agentes IA para independientes, seed + speed Ventures)
- Choice: expansión anunciada a España, Portugal e Italia
- EIF: €15.000M para venture europeo (growth-stage)
- Pepper: $50M (agrifood tech, Bélgica)

### Moats de RockstarData

1. **Efecto de red de datos:** Dataset aggregado crece con cada cliente. Con 200+ locales, benchmarks útiles. Con 2.000+, imposible de replicar.
2. **Switching costs acumulativos:** Cada agente MCP, cada alerta personalizada, cada flujo de reporting = coste de migración adicional
3. **Partners de distribución exclusivos:** GLOP (16.000+ clientes). Primer player que firma los distribuidores bloquea el canal.
4. **Profundidad de dominio codificada:** 259 KPIs sector-específicos, 63+ acciones MCP, glosario HORECA, lógica de diagnóstico cruzado

### Contexto RockstarData

- ARR actual: ~200K€ (pre-seed)
- Acuerdo OEM firmado con GLOP (16.000+ restaurantes, 80+ distribuidores)
- Partner de distribución: GLOP genera 29€/restaurante adicionales con RockstarData embebido
- Cláusula contractual: titularidad sobre datos anonimizados y agregados como propiedad intelectual de RockstarData
- Benchmarks publicados en newsletter vienen del dataset operativo real
- Exit natural: adquisición por incumbente (CEGID, Visma, PSG Equity) a 8-12x ARR → 24-48M€ en rango 3-4M€ ARR

---

## Datos Generales del Sector (usar en cualquier audiencia)

- 280.000 restaurantes en España
- 2,1M establecimientos hosteleros organizados en Europa
- Solo 11% tiene sistemas conectados entre sí
- Los grupos con BI conectada ahorran: 2-5 puntos food cost + 8-15% coste laboral en primeros 90 días
- Para grupo de 5 locales (50K€/mes facturación): ahorro de 6.000-18.750€/mes
- Precio BI: 50-100€/local/mes → ROI de 12-37x en primer trimestre
- El hostelero medio recibe su P&L con 3 semanas de retraso
- Grupos con alertas automáticas: detectan problemas en 3 horas. Sin alertas: 3 semanas.
- 8-15 horas administrativas semanales por local ahorradas con agentes IA operativos
- RockstarData tiene 30+ integraciones y 63 acciones MCP activas
- MCP (Model Context Protocol): estándar de Anthropic lanzado noviembre 2024, ya adoptado por Cursor, Claude Desktop, plataformas verticales HORECA
