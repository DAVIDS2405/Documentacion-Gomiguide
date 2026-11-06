---
title: Estado actual del frontend
description: Qué compila, qué pasa las pruebas, qué pantallas existen y qué depende de endpoints que el backend local no tiene.
---

## Resumen

El frontend **compila y pasa sus chequeos básicos**, pero **depende de endpoints que el backend local no expone**. Con el backend de este repositorio, varias pantallas del admin y el mapa de zonas no tendrían datos.

## Verificado en este equipo

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | ✅ sin errores |
| `next build --turbopack` | ✅ compila; genera 36 entradas de ruta |
| `vitest run` | ✅ 1 archivo, 11 pruebas |
| `biome lint .` | ❌ 7 errores y 191 avisos |
| `biome format` | ❌ 61 archivos sin formatear |
| `vitest --coverage` | ❌ falta `@vitest/coverage-v8` |
| Pruebas en navegador | ⚠️ no realizadas |

## Stack

| Área | Librería | Versión |
|---|---|---|
| Framework | Next.js | 16.1.6 |
| UI | React · Mantine | 19.2.4 · 8.3.15 |
| Mapa | mapbox-gl · react-map-gl | 3.x · 8.x |
| Datos | TanStack Query · Zustand | 5.x · 5.0.11 |
| Idioma | next-intl | 4.8.3 |
| Auth | @stackframe/stack | 2.8.70 |
| Validación | zod | 4.3.6 |
| Analítica | Mixpanel · Google Analytics · Vercel Analytics | — |

## Pantallas

Cada ruta, su render y sus APIs están en [Rutas y pantallas (generado)](/referencia/front-rutas/).

| Área | Ruta | Qué hace |
|---|---|---|
| Inicio | `/{locale}` | Selector de países (`PreHomePage`) |
| País | `/{locale}/[country]` | Landing por ISO de 3 letras: *próximamente*, Ecuador, México, o redirige al mapa |
| Zona | `/{locale}/[country]/[zone]` | Redirige a `/map?zone=` |
| Mapa | `/{locale}/map` | Mapa público con zonas, lugares, tarjetas, sidebar y encuesta |
| Formulario | `/{locale}/form` | Alta pública de un lugar en 3 pasos |
| Admin | `/{locale}/admin/**` | Lugares, solicitudes, usuarios, países, zonas, taxonomía, propiedades, CSV, WiFi |
| Auth | `/{locale}/login`, `forgot-password`, `reset-password` | Acceso del admin con Stack |
| Legal | `/terms`, `/privacy-policy`, `/report` | Textos estáticos |

## Lo que está implementado (según el código)

- **Mapa público**: carga zonas desde `/packs` (con respaldo `map_zones.json`), lugares desde `/places`, categorías desde `/categories`. Pines, tarjetas, sidebar, encuesta de satisfacción y aviso de zona no disponible.
- **Formulario público**: esquema por subcategoría desde la API, 9 tipos de campo, envío a `POST /places/save`, selección de ubicación con mapa.
- **Landing por país**: decide la vista según `selectorStatus` del país en la API.
- **Admin**: listas, detalles y formularios para cada entidad, con confirmaciones y carga de imágenes.
- **Analítica**: Mixpanel, Google Analytics (si hay ID) y Vercel Analytics.
- **Idioma**: `en` y `es`, con textos en `messages/*.json`.

## Lo que no está verificado

- Que cada pantalla funcione de punta a punta contra un backend real.
- Que el admin funcione: depende de endpoints que el backend local no tiene (ver [Discrepancias](/referencia/discrepancias/)).
- Rendimiento y peso de bundle (no medidos).
- Accesibilidad (revisión estática únicamente; ver la auditoría complementaria).

## Correr el proyecto

```bash
cp .env.example .env          # completar las variables
pnpm install
pnpm dev                      # http://localhost:3000
pnpm build && pnpm test
```

Variables necesarias: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_STACK_AUTH_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`. Opcionales: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, `NEXT_PUBLIC_KOFI_ID`. La lista completa está en la [auditoría complementaria](/auditoria/complementaria/).
