---
title: Backend · problemas conocidos
description: Riesgos de seguridad, calidad y operación del backend, con el archivo y la evidencia de cada uno.
---

Cada punto indica dónde está y cómo se comprobó. Los de seguridad vienen también de la [auditoría original](/auditoria/original/).

## Seguridad

| ID | Riesgo | Evidencia | Qué hacer |
|---|---|---|---|
| B-S1 | **SQL armado con texto** al aprobar una solicitud de cambio | `src/services/place-change-request.service.js:372` usa `tx.$executeRawUnsafe` con `status`, `properties` e ids interpolados | Pasar a `prisma.place.update` o a `Prisma.sql` con parámetros. Es el primer arreglo |
| B-S2 | **Escritura pública** en solicitudes de cambio: `POST /api/v1/place-change-requests` acepta `update` y `delete` sin autenticación | `src/routes/v1/place-change-requests.routes.js`; `proposedProperties: z.record(z.any())` en `validators/place-change-request.validators.js:44` | Decidir si editar o borrar debe requerir sesión. Limitar `proposedProperties` por tipo |
| B-S3 | **Datos de usuario en los logs**: en cada petición protegida se imprime la respuesta completa de Stack | `src/middlewares/auth.js:46`: `console.log("Stack Auth user data:", JSON.stringify(data, null, 2))` | Quitar el log o dejar solo el ID. Hay 18 `console.log` en `src/` en total |
| B-S4 | **CORS abierto** a cualquier origen | `src/app.js:16`: `app.use(cors())` sin lista de orígenes | Lista de orígenes permitidos por entorno |
| B-S5 | **Sin límite de tasa** en endpoints públicos (guardado, bulk, feedback, change requests) | No hay middleware de límite en `src/` | Límite por IP en las rutas públicas |
| B-S6 | **Cuerpo de 10 MB** en JSON y en URL-encoded, en todas las rutas | `src/app.js`: `express.json({ limit: '10mb' })` | Límites por ruta; solo las de imagen necesitan más |
| B-S7 | Consulta de lugares con interpolación de `lang`, `packId` y coordenadas | Auditoría original (`place.service.js:692-762`); hoy es seguro por el validador | Pasar a parámetros |
| B-S8 | Cada petición protegida llama a Stack, sin caché | `src/middlewares/auth.js` → `validateStackAuthSession` | Caché corta del resultado por token (segundos) |

## Calidad

| ID | Problema | Evidencia |
|---|---|---|
| B-Q1 | **Cero pruebas**; `npm test` sale con error a propósito | `find . -name '*.test.*'` sin resultados; `package.json` |
| B-Q2 | **Historial de migraciones incompleto**: 31 modelos y solo 2 migraciones. Una base nueva no se puede reconstruir solo con `migrate`; el esquema se empuja con `db push` | `prisma/migrations/` (2 carpetas) · script `db:setup` |
| B-Q3 | **Dos formas de error** distintas | Ver [Arquitectura](/backend/arquitectura/#respuestas) |
| B-Q4 | **Servicios enormes**: `place.service.js` 970 líneas, `admin-places` 601, `place-change-request` 600 | Conteo de líneas |
| B-Q5 | **Seis caminos que escriben lugares**, cada uno con sus validaciones | Auditoría original (sección "Seis caminos escriben lugares") |
| B-Q6 | **Documentación desactualizada**: `API_DOCUMENTATION.md` solo cubre países y categorías. La raíz `GET /api/v1` lista endpoints a mano, no desde las rutas, y puede desviarse | `API_DOCUMENTATION.md` (encabezados) · `src/routes/v1/index.js` |
| B-Q7 | **Varios seeds sueltos** (10 scripts) sin orden ni documentación | `prisma/seed*.js` |
| B-Q8 | Dos plantillas de entorno | `.env.example` y `env.example` |
| B-Q9 | Carpeta `src/` en JavaScript sin tipos | Todo `.js` |

## Operación

| ID | Problema |
|---|---|
| B-O1 | `morgan` solo corre en desarrollo: en producción el backend no registra sus propias peticiones |
| B-O2 | Sin monitoreo de errores: los errores se imprimen con `console.error` |
| B-O3 | Sin endpoint de estado más allá de `/health` (no revisa la base) |
| B-O4 | El arranque no comprueba variables requeridas: falta `STACK_AUTH_PROJECT_ID` y las rutas protegidas devuelven 401 sin pista clara |

## Orden sugerido

1. **B-S1** (SQL armado): corregirlo antes que cualquier otra cosa.
2. **B-S2 y B-S3**: decidir la autenticación de solicitudes y quitar los logs de usuarios.
3. **B-Q2**: línea base de migraciones, antes de tocar el esquema otra vez.
4. **B-S4 a B-S6**: CORS, límites y límite de tasa.
5. **B-Q1**: pruebas de la validación y del flujo de aprobación.
