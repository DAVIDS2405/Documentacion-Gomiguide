---
title: GomiGuide · Documentación técnica
description: Punto de entrada. Estado del frontend, APIs que usa, backend, auditorías y plan de refactorización.
---

Esta documentación describe el estado real de **GomiGuide** en dos repositorios:

| Repo | Ruta local | Stack |
|---|---|---|
| Frontend | `gomiguide-frontend` | Next.js 16 (App Router), React 19, Mantine 8, Mapbox GL, TanStack Query, Zustand, next-intl, Stack Auth |
| Backend | `gomiguide-backend` | Express 4, Prisma 5, PostgreSQL + PostGIS, Zod, Stack Auth, AWS S3, desplegado en Vercel |

## Cómo leer esta documentación

- **Frontend**: qué funciona hoy, cómo se renderiza cada pantalla, dónde está cada parte del código y qué API consume.
- **Backend**: arquitectura por capas, qué le falta para lo que pide el front y problemas conocidos.
- **Discrepancias**: llamadas del front que el backend local no expone. Es el punto más importante antes de probar nada.
- **Auditorías**: la auditoría original (PDF) y la complementaria del frontend.
- **Refactorización**: plan por fases con carpetas por dominio, código muerto y duplicados.

Las páginas marcadas **(generado)** se producen desde el código con `scripts/generate-reference.cjs`. No se editan a mano; si cambia el repo, se vuelven a generar.

## Regenerar

```bash
cd gomiguide-docs
FRONT=/ruta/gomiguide-frontend BACK=/ruta/gomiguide-backend pnpm gen
pnpm build
```

## Fuentes y alcance

- El inventario de endpoints sale del código del front (`src/lib/api.ts`, `src/lib/places-api.ts` y los `fetch` sueltos) y del código del backend (`src/routes/**`), no de la documentación de cada repo.
- Las pruebas que se hicieron para escribir esto: `tsc`, `next build`, Vitest y Biome en el front; lectura de rutas y modelo Prisma en el back. **No** se probó la app en navegador ni contra un backend desplegado.
