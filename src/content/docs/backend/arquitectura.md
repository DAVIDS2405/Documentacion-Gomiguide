---
title: Backend · arquitectura por capas
description: Cómo viaja una petición por el backend, qué hace cada capa y dónde vive cada responsabilidad.
---

## Flujo de una petición

```
HTTP
 │
 ▼
app.js          helmet · cors · json (10 MB) · /health · /api
 │
 ▼
routes/         define método, ruta y la cadena de middlewares
 │   ├─ authenticate   (solo rutas protegidas)
 │   ├─ authorize("admin")
 │   └─ validate(schema, "body"|"query"|"params")   zod
 ▼
controllers/    lee req, llama al servicio, responde con successResponse
 │
 ▼
services/       reglas de negocio, transacciones, auditoría, consultas Prisma
 │
 ▼
config/prisma   → PostgreSQL (PostGIS)
```

Errores: cualquier `throw` llega a `middlewares/errorHandler.js`, que mapea códigos de Prisma (`P2002` → 409, `P2025` → 404, `P2003` → 400) y devuelve JSON. Las rutas inexistentes pasan por `notFound` (404).

## Autenticación

`middlewares/auth.js`:

1. Toma el token del header `Authorization: Bearer`. Si no hay, prueba la cookie `stack-auth-access-token` y el header `x-stack-access-token`.
2. Llama a `https://api.stack-auth.com/api/v1/users/me` con el ID de proyecto y el secreto del servidor. **Una llamada externa en cada petición protegida, sin caché.**
3. Busca el usuario en la base por `neonAuthUserId`, con su rol.
4. Si no existe o está inactivo, responde 403.
5. `authorize("admin")` revisa el rol.

El usuario debe existir en las dos partes: en Stack y en la tabla `users`. Un usuario nuevo de Stack recibe 403 hasta que alguien lo registre en la base.

## Respuestas

`utils/response.js` (`successResponse`) responde:

```json
{ "success": true, "data": { … }, "message": "opcional", "meta": { … } }
```

Hay **dos formas de error** en el mismo backend:

| Origen | Forma | Quién la produce |
|---|---|---|
| Validación de entrada (Zod) | `{ "success": false, "message": "Validation error", "errors": [{ "field", "message" }] }` | `middlewares/validate.js` |
| Errores de servicio y de Prisma | `{ "success": false, "error": { "message", "code", "details"? } }` | `middlewares/errorHandler.js` |

El front (`lib/api.ts`) acepta ambas: lee `error.error.message`, `error.error` como texto, `error.message` o `error.errors`. Unificarlas es una tarea pequeña y evita ese código de adaptación.

## Dominios y dónde viven

| Dominio | Ruta base | Controlador | Servicio | Tamaño del servicio |
|---|---|---|---|---|
| Lugares (público: mapa, guardado, carga masiva, bancos) | `/api/v1/places` | `place.controller.js` | `place.service.js` | 970 líneas |
| Lugares (admin) | `/api/v1/admin/places` | `admin-places.controller.js` | `admin-places.service.js` | 601 |
| Solicitudes de cambio | `/api/v1/place-change-requests`, `/api/v1/admin/place-change-requests` | `place-change-request.controller.js` | `place-change-request.service.js` | 600 |
| Usuarios y roles (admin) | `/api/v1/admin/users` | `user.controller.js` | `user.service.js` | 481 |
| Sincronización WiFi | `/api/v1/admin/sync/wifi` | `wifi-sync.controller.js` | `wifi-sync.service.js` | 346 |
| Categorías | `/api/v1/categories` | `category.controller.js` | `category.service.js` | 256 |
| Packs (catálogo y formularios) | `/api/v1/packs` | `pack.controller.js` | `pack.service.js` | 248 |
| Imágenes | — | — | `s3.service.js` | 246 |
| Países | `/api/v1/countries` | `country.controller.js` | `country.service.js` | — |
| Encuesta | `/api/v1/feedback` | `feedback.controller.js` | `feedback.service.js` | — |
| Sesión propia | `/api/v1/me` | `auth.controller.js` | `auth.service.js` | — |

## Escritura de lugares

Hay varios caminos que crean o cambian lugares (formulario público, carga masiva, alta admin, aprobación de solicitudes, sincronización WiFi). Cada uno valida y audita por su cuenta. La auditoría original propone un solo punto de escritura (`placeWriter`); ver [Problemas conocidos](/backend/problemas/).

## Modelo de datos (resumen)

31 modelos de Prisma (lista completa en [Modelo de datos](/referencia/backend-modelo/)). Los que más importan:

| Modelo | Qué guarda | Nota |
|---|---|---|
| `Place` | Lugar: `packId`, `geom` (geography), `status`, `properties` (JSON), origen externo | Un `Pack` es la región |
| `Pack` | Región o zona (`slug`, `countryId`, `cityId`, `districtId`) | **No hay modelo `Zone`**: el front llama "zona" a los packs |
| `Category`, `Subcategory`, `PackCategory`, `PackSubcategory` | Taxonomía y su activación por pack | Con tablas de traducción |
| `PropertyDefinition`, `FieldGroup`, `SubcategoryPropertyConfig` | Propiedades y su configuración por subcategoría | Con traducciones de opciones |
| `PlaceChangeRequest`, `Moderation`, `PlaceVerification`, `PlaceReport` | Flujo de revisión | — |
| `User`, `Role` | Usuarios enlazados a Stack | `neonAuthUserId` |
| `AuditLog`, `OutboxEvent` | Auditoría y eventos | — |
| `Feedback` | Encuesta del mapa | Migración `20260603` |

El tipo `geography` y la tabla `spatial_ref_sys` vienen de PostGIS.

## Qué no tiene el backend

- Zonas con su propia tabla, zonas admin y su frontera editable.
- Países admin y landings.
- Taxonomía y propiedades admin.
- Esquema de tarjetas del mapa (`card-schema`).
- Lista de packs (`GET /packs`).
- Plantilla e importación CSV.

Lista completa en [Qué le falta al backend](/backend/faltantes/).
