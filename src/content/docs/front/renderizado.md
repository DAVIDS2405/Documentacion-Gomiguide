---
title: Cómo renderiza el frontend
description: Qué se renderiza en servidor, qué en el navegador, cómo llegan los datos y cómo se decide qué mostrar en cada pantalla.
---

## Capas

```
Petición
  │
  ▼
src/proxy.ts ─────────────► idioma (en/es), redirecciones de países antiguos,
  │                         guarda de /admin (solo revisa que exista una cookie)
  ▼
src/app/[locale]/…/page.tsx  servidor: metadatos, prefetch, redirecciones, notFound
  │
  ▼
src/views/…                  cliente ("use client"): estado, hooks, pantalla completa
  │
  ├─ TanStack Query          datos (lugares del mapa, precargados en el servidor)
  ├─ fetch manual (useEffect) páginas admin (sin TanStack)
  ├─ Zustand                 estado del formulario, país elegido, toggles del sidebar
  └─ lib/api.ts, lib/places-api.ts ──► backend (NEXT_PUBLIC_BACKEND_URL)
```

## 1. Enrutamiento e idioma

- Rutas en `src/app/[locale]/`. Idiomas: `en` (por defecto) y `es` (`src/i18n/routing.ts`).
- `src/app/page.tsx` redirige `/` a `/{defaultLocale}`.
- `src/proxy.ts` hace tres cosas:
  1. Redirige permanentemente `/es/ec` → `/es/ecu`, `/es/mx` → `/es/mex` y `/es/jp` → `/es/pre-home` (URLs viejas).
  2. Si la ruta contiene `/admin` y no hay cookie con `stack` o `auth` en el nombre, manda a `/login?next=…`. **No valida la sesión**.
  3. Aplica el middleware de next-intl. No corre sobre `/api`, `_next` ni archivos con extensión.

## 2. Páginas de servidor

Las `page.tsx` son delgadas: solo resuelven SSR y delegan la pantalla a `src/views/`.

| Ruta | Qué hace en el servidor |
|---|---|
| `/{locale}/map` | `prefetchQuery` de lugares del pack indicado en `?zone=`; `HydrationBoundary` los entrega al cliente |
| `/{locale}/[country]` | Pide `/countries/:iso/landing` y elige la vista (ver §5) |
| `/{locale}/[country]/[zone]` | Pide el pack; redirige a `/map?zone=<slug>` o a la landing del país |
| `/{locale}` | Metadatos y `PreHomePage` |
| `/admin/*` | Solo metadatos; el contenido es cliente |

Si una llamada del servidor falla, la página se trata como "no encontrada": en `[country]`, `getCountry()` devuelve `null` y se llama `notFound()`. **Con el backend local, todas las landings de países darían 404.**

## 3. Pantallas de cliente

`src/views/*` son componentes `"use client"`. Usan:

- **TanStack Query** (`src/app/[locale]/providers.tsx`): `staleTime` 60 s, `gcTime` 5 min, `retry: 1`, sin refetch al volver a la pestaña. Lo usan hooks como `usePlaces` y `useMapZones`. **Ninguna página admin lo usa** (cada una hace su propio `useEffect` + `useState`).
- **Zustand** (`src/stores/`): país seleccionado (persistido en `localStorage`), y el estado del formulario (`stores/form/`).
- **Mantine** para toda la UI. El tema está en `src/theme/index.ts`; además hay mucho estilo inline y `src/app/globals.css` con 130 `!important`.

## 4. Mapa público (`/map`)

Es la pantalla más compleja. Flujo:

1. El servidor precarga `GET /api/v1/places?packId=…&lang=…`.
2. El cliente lee la zona de `?zone=`, de `localStorage` o del pack por defecto (`1`, escrito en tres archivos).
3. Zonas: `GET /api/v1/packs` con su `boundary`. Si falla, usa `src/lib/map_zones.json`.
4. Categorías del sidebar: `GET /api/v1/categories?packId=…`.
5. Tarjetas: el esquema de campos sale de `GET /api/v1/packs/:id/card-schema`, **que el backend no tiene**. Sin él, `CardSchemaContext` no tiene campos para renderizar.
6. Pines con `react-map-gl/mapbox`. Estilos `mapbox://styles/mapbox/light-v11` y `…/standard` según el componente.
7. Ubicación del usuario y calles cercanas: `/api/nearby` y `/api/reverse` (rutas internas de Next que consultan OpenStreetMap; ver §7).

Dentro de `LocationMap`, la cámara la mueven cinco efectos y handlers distintos (lo documenta la auditoría complementaria).

## 5. Landings de país (`/{locale}/[country]`)

La decisión está en `src/app/[locale]/[country]/page.tsx`:

| Condición | Vista |
|---|---|
| No existe o `selectorStatus = inactive` | 404 |
| `coming_soon` | `ComingSoonPage` |
| ISO `ECU` | `EcuadorPage` (copy y zonas escritos en el código) |
| ISO `MEX` | `MexicoPage` (igual) |
| Cualquier otro activo | Redirige a `/map` con la primera zona activa |

## 6. Formulario público (`/form`)

1. **Paso 0** (`Step0UserInfo`): datos del usuario y tipo de lugar. Las opciones salen de `ITEM_TYPES` (código fijo), no del catálogo.
2. **Paso 1** (`Step1PlaceInfo` → `DynamicPlaceForm`): el esquema llega de `GET /api/v1/packs/1/subcategories/:id/form-schema` (pack fijo `1`). Cada campo se renderiza en `DynamicFormRenderer`, que elige el componente por `uiType`:

   | `uiType` | Componente |
   |---|---|
   | `input`, `textarea`, `number` | campo de texto o número |
   | `select`, `radio`, `checkboxGroup`, `chips` | selección simple o múltiple |
   | `toggle` | interruptor |
   | `time` | hora (Mantine dates) |

3. **Ubicación**: `LocationSection` reutiliza el mapa del explorador (`LocationMap`). Hoy arranca en Quito.
4. **Paso 2** (`Step2Confirmation`): resumen y envío con `collectFormData` → `POST /api/v1/places/save`. Hay una versión muerta de este flujo en `hooks/useSubmitPlace.ts`; el vivo es `views/FormPage/sections/hooks/useFormSubmission.tsx`.

## 7. Rutas internas de Next (`src/app/api/`)

| Ruta | Qué hace | Problemas conocidos |
|---|---|---|
| `/api/nearby?lat&lng` | Calles con nombre a menos de 60 m, vía Overpass (3 servidores) | Sin validación de rango; si faltan parámetros usa `0,0`; sin límite de tasa |
| `/api/reverse?lat&lng` | Geocodificación inversa con Nominatim | Interpola `lat`/`lng` sin validar; `User-Agent: my-app` |

## 8. Admin (`/{locale}/admin/**`)

Patrón que se repite en casi todas las pantallas:

```
app/[locale]/admin/<x>/page.tsx          → una línea: renderiza la vista
  └─ views/Admin/<X>/...                  "use client"
       ├─ useAuth()  → getToken()          token de Stack
       ├─ useEffect → fetchX(token)        api.getX(token, …)
       ├─ useState(loading, data, error)
       ├─ Mantine Table / Modal / Badge
       └─ notifications.show(…)            éxito o error
```

El layout `admin/layout.tsx` no muestra nada hasta que `isAdmin` es verdadero, y redirige a `/login` si no lo es. Esta es una **protección de interfaz**; la validación real debe hacerla el backend en cada endpoint (en el backend local lo hace `authorize("admin")`).

## 9. i18n y textos

- `next-intl` con `messages/en.json` y `messages/es.json`.
- Servidor: `getTranslations`. Cliente: `useTranslations`.
- Quedan textos fijos en el código: etiquetas de `ITEM_TYPES` (en inglés, en mayúsculas), alias de categorías del mapa y el copy de las landings de Ecuador y México.
