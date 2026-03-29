# RockstarData — ICP & Targeting Guide para List Builder

## Criterios de calificación (TODOS deben cumplirse)

| Criterio | Mínimo | Ideal |
|---|---|---|
| Número de locales | 3+ | 5-30 |
| País | España | España (primario) |
| Sector | Restauración organizada | Casual dining, QSR, fast casual, dark kitchen |
| Decisor identificable | CEO o propietario | CEO + Controller o Dir. Operaciones |
| Email empresarial | Obligatorio | Verificado |
| No en blacklist | Obligatorio | — |

## Sectores compatibles ✅
- Casual dining (restaurantes de servicio de mesa, precio medio 15-35€)
- QSR / Fast food (servicio rápido, múltiples locales)
- Fast casual (entre QSR y casual dining, ej. burgers artesanales, pokés)
- Dark kitchens / cloud kitchens
- Ocio nocturno organizado (grupos de bares/clubs con gestión centralizada)

## Sectores NO compatibles ❌
- Negocios de 1-2 locales (salvo que sea para canal PLG/PilotStar)
- Catering industrial (colegios, hospitales, colectividades)
- Vending
- Restauración en hoteles (si el hotel es el negocio principal)
- Cafeterías sin gestión multi-local
- Clientes actuales de RockstarData (verificar contra CRM antes de añadir)

## Campos a recoger por cuenta (schema del intake API)

```json
{
  "name": "Nombre completo del contacto",
  "email": "email@empresa.com",
  "company": "Nombre del grupo (sin S.L., S.A.)",
  "num_locations": 8,
  "concept_type": "casual_dining",  // casual_dining | qsr | fast_casual | dark_kitchen | nightlife | other
  "pos": "GLOP",  // GLOP | Agora | Revo | BDP | Loomis | Otro | Desconocido
  "region": "Madrid",
  "cargo": "CEO",  // CEO | COO | CFO | Controller | Dir.Operaciones | Otro
  "linkedin_url": "https://linkedin.com/in/..."
}
```

## Fuentes prioritarias por tipo de target

| Fuente | Mejor para |
|---|---|
| Sales Navigator | Encontrar decisores por cargo + sector + tamaño empresa |
| Google Maps + scraping | Identificar cadenas por número de locales en ciudad |
| Directorios sectoriales | Hostelería de España, FEHR, asociaciones regionales |
| LinkedIn (búsqueda empresa) | Validar tamaño y equipo directivo |
| Webs corporativas | Confirmar número de locales y expansión reciente |

## Naming convention de campañas

Formato: `{SEGMENTO}_{CIUDAD}_{MES}{AÑO}`
Ejemplos:
- `QSR_MADRID_ABR26`
- `FASTCASUAL_BCN_ABR26`
- `DARKK_MADRID_MAY26`

## Volumen objetivo

- 50-100 cuentas RAW por día por campaña activa
- De esas, esperar ~30-40% calificadas tras dedup y blacklist
- Meta mensual: 200+ leads calificados hacia CRM

## Nota importante sobre dedup

El backend (`/api/leads/intake`) ejecuta dedup automático contra la base de datos local y contra Pipedrive. El List Builder NO necesita verificar duplicados manualmente — solo enviar el batch completo con los datos recogidos. El sistema clasifica cada lead como: `net_new`, `new_contact_existing_org`, `existing_contact`, `duplicate_with_deal`, o `blocked`.
