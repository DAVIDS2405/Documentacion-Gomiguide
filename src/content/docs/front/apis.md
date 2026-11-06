---
title: APIs que usa el frontend
description: Qué endpoints llama cada flujo del front, cuáles existen en el backend local y cuáles faltan.
---

El inventario completo (88 llamadas, con archivo, pantallas y estado) está en [Llamadas a la API (generado)](/referencia/front-apis/). Aquí va el resumen por flujo.

## Resumen

| Grupo | Llamadas | Existen en backend local | Faltan |
|---|---|---|---|
| Admin: lugares | 9 | 8 | 1 |
| Admin: solicitudes de cambio | 4 | 4 | 0 |
| Admin: usuarios | 7 | 7 | 0 |
| Admin: WiFi | 2 | 2 | 0 |
| Admin: países | 12 | 0 | 12 |
| Admin: zonas | 7 | 0 | 7 |
| Admin: taxonomía | 15 | 0 | 15 |
| Admin: propiedades y formularios | 18 | 0 | 18 |
| CSV (plantilla e importación) | 3 | 0 | 3 |
| Públicas: países (lista y landing) | 2 | 1 | 1 |
| Packs (lista, catálogo, formulario, tarjetas) | 4 | 2 | 2 |
| Categorías | 1 | 1 | 0 |
| Lugares públicos (lista y envío) | 2 | 2 | 0 |
| Feedback público | 1 | 1 | 0 |
| Perfil (`/me`) | 1 | 1 | 0 |
| **Total** | **88** | **29** | **59** |

Cifras calculadas desde la [referencia generada](/referencia/front-apis/).

## Autenticación

Las rutas admin reciben `Authorization: Bearer <token de Stack>` (`lib/api.ts` → `apiRequest`). El backend valida ese token contra Stack, busca el usuario en su base por `neonAuthUserId` y exige rol `admin`.

## Flujos

### Mapa público (`/map`)

| Paso | Llamada | Estado en backend local |
|---|---|---|
| Lugares del pack | `GET /api/v1/places?packId&lang` | ✅ |
| Zonas (pack con `boundary`) | `GET /api/v1/packs` | ❌ falta (solo existen `/packs/:id/catalog` y `/form-schema`) |
| Categorías del sidebar | `GET /api/v1/categories?packId&lang` | ✅ |
| Esquema de tarjetas | `GET /api/v1/packs/:id/card-schema` | ❌ falta |
| Calles cercanas | `GET /api/nearby` (interna de Next) | — depende de Overpass |
| Dirección de un punto | `GET /api/reverse` (interna de Next) | — depende de Nominatim |
| Encuesta | `POST /api/v1/feedback` | ✅ |

Si falla `/packs`, el mapa usa `map_zones.json`. Si falta `card-schema`, las tarjetas no tienen campos.

### Formulario público (`/form`)

| Paso | Llamada | Estado |
|---|---|---|
| Opciones de pack | `GET /api/v1/packs` | ❌ falta |
| Esquema por subcategoría | `GET /api/v1/packs/1/subcategories/:id/form-schema?lang` | ✅ |
| Enviar lugar | `POST /api/v1/places/save` | ✅ |

El formulario usa el pack `1` fijo y las subcategorías fijas de `SUBCATEGORY_MAP`.

### Landings de países

| Paso | Llamada | Estado |
|---|---|---|
| Selector | `GET /api/v1/countries?lang` | ✅ |
| Landing de un país | `GET /api/v1/countries/:iso/landing?lang` | ❌ falta |

Sin la landing, `/{locale}/[country]` devuelve 404 para cualquier país.

### Admin: lugares

| Pantalla | Llamadas | Estado |
|---|---|---|
| Solicitudes | `GET /admin/place-change-requests`, `GET …/:id`, `PATCH …/approve`, `PATCH …/reject` | ✅ |
| Lista de lugares | `GET /admin/places`, `GET /admin/places/stats`, `PATCH …/:id/status`, `DELETE …/:id` | ✅ |
| Editar lugar | `PATCH /admin/places/:id`, `POST …/:id/image`, `DELETE …/:id/image` | ✅ |
| Crear lugar | `POST /admin/places` | ❌ falta (el alta pública sí existe: `/places/save`) |
| Carga masiva CSV | `GET …/csv-template`, `GET …/csv-template-info`, `POST …/csv-import` | ❌ faltan |

### Admin: países, zonas, taxonomía, propiedades

Ninguna de estas rutas existe en el backend local: `/admin/countries`, `/admin/zones`, `/admin/taxonomy` y `/admin/properties/*`. Están en el front y en el plan de refactorización como si ya existieran. Ver [Discrepancias](/referencia/discrepancias/).

Esto no quiere decir que no existan en otra versión del backend. Lo que sí es cierto es que **no están en ninguna rama local** (`main`, `develop`, `feat/feedback-survey-api`).

### Admin: usuarios y WiFi

| Pantalla | Llamadas | Estado |
|---|---|---|
| Usuarios | `GET /admin/users`, `GET /admin/users/roles`, `POST /admin/users`, `PATCH …/status`, `PATCH …/role`, `DELETE …/:id` | ✅ |
| WiFi | `POST /admin/sync/wifi`, `GET /admin/sync/wifi/status` | ✅ |
| Perfil propio | `GET /api/v1/me` | ✅ |

## Llamadas directas (sin `api`)

| Dónde | Llamada |
|---|---|
| `lib/places-api.ts` | `GET /api/v1/places`, `GET /api/v1/packs/:id/card-schema` |
| `views/MapPage/sections/SideBar/hooks/useSubcategories.ts` | `GET /api/v1/categories` |
| `lib/map.ts` | Overpass (3 servidores externos) |
| `app/api/nearby`, `app/api/reverse` | OpenStreetMap (Overpass y Nominatim) |

## Variable de entorno

Todas las llamadas al backend usan `NEXT_PUBLIC_BACKEND_URL`. Si no está definida, `places-api.ts` y `useSubcategories.ts` usan `""` y hacen peticiones relativas al propio front, que fallan sin aviso claro.
