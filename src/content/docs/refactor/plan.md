---
title: Plan de refactorización del frontend
description: Carpetas por dominio, código muerto, duplicados, SOLID y fases.
---

> Copia sincronizada desde `Gomi — Plan de refactorización front.md`. Editar el original y volver a ejecutar `pnpm sync`.

**Repo:** `gomiguide-frontend` (Next.js 16, React 19, Mantine 8, Mapbox, Zustand, TanStack Query)
**Complementa:** "Gomi — Auditoría técnica front y back" y "Gomi — Auditoría front complementaria".
**Principios:** Screaming Architecture (la carpeta dice el dominio), SOLID, DRY.
**Regla de oro:** cada paso no cambia el comportamiento visible y trae su verificación (`tsc`, `biome`, `vitest`, `next build`, y prueba manual de la ruta afectada).

---

## 1. Diagnóstico con cifras

| Señal | Medida | Dónde se ve |
|---|---|---|
| Archivos TS/TSX en `src/` | 249 | — |
| Líneas de código | ~36.500 | — |
| Carpeta `views/` | 139 archivos, con nombres técnicos (`Content`, `Modal`, `Section`) | `src/views` |
| Objeto `api` | 85 métodos en 1.620 líneas; 79 funciones reciben `token` como parámetro | `src/lib/api.ts` |
| Llamadas a `getToken()` | 74 en 30 archivos | toda la capa admin |
| Patrón `setLoading` + `try/catch` a mano | 26 archivos | páginas admin |
| `useQuery` / `useMutation` en admin | **0** (TanStack Query está instalado) | `src/views/Admin` |
| `notifications.show` | 127 | en todo el front |
| Colores hex literales | `#FFFFFF` 140 veces, `#E5E7EB` 68, `#0EA5E9` 28, `#F9FAFB` 24 | en vez de `src/theme` |
| Implementaciones de móvil | 8 (`innerWidth <= 768`) | mapa, analítica, modales |
| Copias de `MAP_STYLE` y token de Mapbox | 6 y 6 | mapas |
| Archivos de más de 500 líneas | 14 | ver §5 |
| Código muerto | 26 archivos (2.301 líneas) + 4 métodos de `api` + ~20 exports | ver §3 |

**Causa raíz:** no hay una capa compartida de datos ni de UI. Cada página vuelve a implementar "pedir token → pedir datos → guardar estado → mostrar error → notificar", y cada mapa, modal y badge se copia con pequeñas variaciones. Además, el catálogo de la API (`PackCatalog`) ya trae `icon`, `color`, `sortOrder`, `visibleInFilters` y `availableForUpload`, pero el formulario público no lo usa.

---

## 2. Arquitectura objetivo (Screaming)

La estructura nueva nombra lo que hace la app: mapa, lugares, zonas, países, taxonomía, etc. Ver `src/features/` como carpeta de dominios (hoy vacía).

```
src/
├── app/                              # SOLO rutas de Next (finas: importan de features)
│   ├── [locale]/
│   │   ├── map/page.tsx              → features/map-explorer
│   │   ├── form/page.tsx             → features/place-submission
│   │   ├── [country]/page.tsx        → features/countries/landing
│   │   ├── admin/...                 → features/*-admin
│   │   └── login/ terms/ privacy-policy/ report/ ...
│   └── api/nearby, api/reverse       → shared/geo (lógica) + validación zod
│
├── features/                         # DOMINIOS. Cada uno tiene la misma forma interna
│   ├── map-explorer/                 # /map: mapa público, sidebar, tarjetas, cámara, pines
│   ├── place-submission/             # /form: pasos, store, validación, envío
│   ├── places/                       # lugares: api, queries, lista/detalle/edición admin, aprobación
│   ├── zones/                        # zonas: geometría pura, api, editor de frontera
│   ├── countries/                    # selector de países, landing genérica, admin de países
│   ├── taxonomy/                     # categorías y subcategorías (admin + catálogo público)
│   ├── properties/                   # definiciones, grupos, configuración por subcategoría
│   ├── wifi-sync/                    # sincronización WiFi por pack
│   ├── csv-import/                   # carga masiva
│   ├── users/                        # usuarios y roles (admin)
│   ├── auth/                         # login, recuperación, sesión, guard de admin
│   ├── feedback/                     # encuesta de satisfacción
│   ├── analytics/                    # Mixpanel, GA, eventos, sesión
│   ├── donations/                    # botón Ko-fi
│   └── legal/                        # privacidad y términos
│
├── shared/                           # Lo que no es de un dominio
│   ├── api/                          # cliente HTTP único (token inyectado), ApiError, getErrorMessage
│   ├── ui/                           # FormModal, ConfirmModal, StatusBadge, DataTable, EmptyState, Buttons
│   ├── map/                          # MapCanvas, mapbox.config.ts (token y estilos), clientOnly()
│   ├── geo/                          # distancia, bbox, punto en polígono (envoltura de turf)
│   ├── icons/                        # registro único de iconos (Tabler por nombre + SVG propios)
│   ├── hooks/                        # useIsMobile, useLocalStorage, useAccessToken, useDebounce
│   ├── storage/                      # readJSON / writeJSON
│   ├── files/                        # fileToBase64, compresión de imagen
│   ├── notify/                       # notify.success / notify.error
│   ├── config/                       # env.ts: todas las NEXT_PUBLIC_* en un solo sitio
│   └── theme/                        # tokens de color y tipografía (hoy en src/theme)
│
├── i18n/                             # sin cambios (routing, request)
├── proxy.ts, stack.ts                # convenciones de Next / Stack: no se mueven
└── app/globals.css                   # solo estilos globales; sin !important nuevos
```

**Forma interna de cada feature** (misma en todas, para que se pueda navegar sin buscar):

```
features/places/
├── api/           places.api.ts          # funciones puras de red (sin hooks)
├── queries/       usePlacesList.ts       # hooks TanStack Query
├── model/         types.ts  store.ts     # tipos del dominio y estado Zustand si lo hay
├── components/    PlaceCard.tsx ...       # UI del dominio
├── views/         PlacesListView.tsx     # pantalla completa (la usa la ruta)
└── index.ts                              # API pública: solo lo que otros features pueden importar
```

**Regla de dependencias:** `app → features/* → shared`. Un feature no importa de otro feature salvo por su `index.ts`. `shared` nunca importa de `features`.

### 2.1 Mapa de movimiento (archivo actual → destino)

| Actual | Destino |
|---|---|
| `views/MapPage/**` | `features/map-explorer/**` (zonas → `features/zones/geo`) |
| `views/MapPage/sections/LocationMap/**` | `features/map-explorer/camera/`, `features/map-explorer/pins/` |
| `views/MapPage/sections/FeedbackModal/**` | `features/feedback/` |
| `views/MapPage/sections/SideBar/**` | `features/map-explorer/sidebar/` |
| `views/FormPage/**` | `features/place-submission/**` |
| `views/Admin/Places/**`, `views/Admin/PlaceDetailPage.tsx`, `views/Admin/PlacesListPage.tsx`, `views/Admin/PlacesManagementPage.tsx`, `components/admin/PlaceEditModal.tsx`, `components/admin/PlaceMapModal.tsx`, `components/admin/StaticMap*.tsx`, `components/admin/InteractiveMapContent.tsx` | `features/places/**` |
| `views/Admin/Zones/**` | `features/zones/**` |
| `views/Admin/Countries/**`, `views/PreHomePage/**`, `views/ComingSoonPage/**`, `views/EcuadorPage/**`, `views/MexicoPage/**` | `features/countries/**` (landing genérica) |
| `views/Admin/Taxonomy/**`, `views/Admin/Properties/**` | `features/taxonomy/**`, `features/properties/**` |
| `views/Admin/WifiSyncPage.tsx`, `components/admin/WifiSyncPanel.tsx` | `features/wifi-sync/**` |
| `views/Admin/CsvUploadPage.tsx`, `components/admin/CsvUploadPanel.tsx` | `features/csv-import/**` |
| `views/Admin/UsersListPage.tsx`, `components/admin/CreateUserModal.tsx` | `features/users/**` |
| `views/Admin/LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `hooks/useAuth.ts`, `lib/stack-auth.ts` | `features/auth/**` |
| `views/Admin/DashboardPage.tsx`, `components/admin/AdminHeader.tsx`, `AdminSidebar.tsx` | `features/admin-shell/` (layout y dashboard) |
| `views/PrivacyPolicyPage`, `views/TermsOfUse` | `features/legal/` |
| `views/Report/**` | `features/feedback/` o `features/reports/` (decidir con producto) |
| `components/form/**` | `shared/forms/` (renderer dinámico único) |
| `components/layout/Header.tsx`, `Footer.tsx` | `shared/layout/` |
| `components/ui/Buttons/**` | `shared/ui/buttons/` |
| `components/icons/BenchIcon.tsx`, `lib/tablerIcons.ts`, `views/MapPage/utils/icon-to-svg.ts`, `dynamic-icon.ts`, `icon-map.constants.tsx` | `shared/icons/` |
| `lib/api.ts` | `shared/api/client.ts` + un `*.api.ts` por feature (§4.1) |
| `lib/places-api.ts` | `features/places/api/` (se elimina su duplicado de `Place`) |
| `lib/map.ts`, `lib/location/`, `app/api/nearby`, `app/api/reverse` | `shared/geo/`, con validación zod |
| `lib/analytics/**` | `features/analytics/` |
| `lib/fileToBase64.ts`, `lib/imageCompression.ts` | `shared/files/` |
| `lib/zones/zones.ts`, `hooks/useMapZones.ts` | `features/zones/` (un solo módulo) |
| `lib/mapbox` (constantes) | `shared/map/mapbox.config.ts` |
| `stores/data/*`, `stores/form/*` | dentro de su feature (`model/store.ts`) |
| `hooks/usePlaces.ts`, `useSubmitPlace.ts`, `useFormSchema.ts`, `useNearbyStreets.ts`, `useReverseGeocode.ts`, `useCurrentLocation.ts` | `features/places/queries/`, `features/place-submission/`, `features/map-explorer/`, `shared/geo/` |
| `types/index.ts`, `types/map.ts` | se reparten en `model/types.ts` de cada feature |
| `src/theme/index.ts` | `shared/theme/` |
| `src/views/HomePage`, `HomePage-backup` | **borrar** (§3) |

---

## 3. Código muerto: borrar

### 3.1 Archivos sin ruta que los use (26 archivos, 2.301 líneas)

Verificado con recorrido de imports desde `src/app`. Borrar en **un solo PR**.

| Grupo | Archivos | Líneas |
|---|---|---|
| Home vieja y su copia | `views/HomePage/**` (4 archivos), `views/HomePage-backup/**` (4 archivos) | ~630 |
| Formulario viejo | `views/FormPage/sections/LocationSection.tsx`, `views/FormPage/sections/Open.tsx`, `components/form/DynamicFormSection.tsx`, `components/form/DynamicFormField.tsx`, `hooks/useSubmitPlace.ts`, `stores/form/openingHours.ts`, `stores/form/pricing.ts`, `stores/form/location/validators.ts` | ~1.280 |
| Mapa viejo | `views/MapPage/sections/LocationMap/utils/placeCluster.ts`, `utils/radialPosition.ts`, `views/MapPage/sections/SideBar/hooks/useBottomSheet.ts`, `views/MapPage/constants/layout.constants.ts` | ~400 |
| Sueltos | `components/ui/ThemeDemo.tsx`, `components/ui/Buttons/ColorSchemeToggle.tsx`, `components/ui/Buttons/LanguageToggle.tsx`, `hooks/useCountdown.ts`, `lib/performance.ts`, `stores/data/exampleStore.ts` | ~190 |

**Cuidado:** `components/form/DynamicPlaceForm.tsx` **sí** se usa (lo importa `Step1PlaceInfo.tsx`). No borrar; se fusiona en §5.

**Antes de borrar:** `lib/performance.ts` tiene un `console.log` de métricas; si se quiere medir, reemplazarlo por un hook de monitoreo, no restaurarlo.

### 3.2 Métodos de `api` sin ningún llamador

| Método | Acción |
|---|---|
| `api.getUser` | borrar (el de usuarios es `getUsers`/`getMe`) |
| `api.getPlace` | borrar (ya existe `getPlaces` / `getPlaceRequest`) |
| `api.getPropertyDefinition` | borrar (usar `getPropertyDefinitions`) |
| `api.deleteCountryLanding` | borrar; el backend ya no expone landing por separado si `upsertCountryLanding` cubre el caso (confirmar contrato) |

### 3.3 Exports sin importadores (verificar con Knip antes de borrar)

- `lib/map.ts`: `getNearbyPlaces`
- `views/MapPage/sections/LocationMap/utils/placeCluster.ts`: `clusterPlaces`, `stackPlacesByPosition`, `PlaceStack`
- `views/MapPage/utils/icon-to-svg.ts`: `getHiddenGemsBadgeSvgs`
- `views/MapPage/utils/dynamic-icon.ts`: `DYNAMIC_PIN_FALLBACK_COLOR`, `PinVisual`
- `views/MapPage/constants/categories.ts`: `LOCAL_HIGHLIGHTS_SLUG` (si la API reemplaza el slug, §4.2)
- `views/MapPage/sections/SideBar/hooks/useSubcategories.ts`: `useCategory`, `useSubcategory`
- `lib/analytics/session.ts`: `getSessionStartTime`
- `views/MapPage/sections/FeedbackModal/useFeedbackTrigger.ts`: `recordFeedbackResponse`
- `hooks/usePlaces.ts`: `PLACE_INDIVIDUAL_STALE_TIME` (si solo se usa dentro, dejar de exportarla)
- `types/index.ts`: `CountryInfo`, `PageParams`, `CountryStatus` (revisar; probablemente restos del selector viejo)

### 3.4 Dependencias a quitar

| Paquete | Motivo |
|---|---|
| `@mantine/form` | no se importa |
| `@emotion/react` | Mantine 8 no lo necesita; no se importa |
| `ts-node` | no se usa |
| `jsdom`, `@testing-library/*` (4), `vite-tsconfig-paths`, `@vitejs/plugin-react` | instalados para tests que no tienen configuración (`vitest.config.ts` no existe). **No quitar**: se usan en §6, fase 0 |
| `dayjs` | **no quitar**: es peer de `@mantine/dates` |
| `embla-carousel-react` | **no quitar**: es peer de `@mantine/carousel` |
| `pnpm-lock.yaml` / `bun.lock` | dejar uno (pnpm), borrar el otro |

---

## 4. Valores que deben venir de la API

La regla: todo lo que cambia por ciudad, país, pack o contenido sale de la API. En el código solo quedan valores técnicos (rutas, colores del tema, límites de UI).

### 4.1 Ya existe en la API y el front lo usa mal o a medias

| Valor hardcodeado | Dónde | Fuente que ya existe | Acción |
|---|---|---|---|
| `SUBCATEGORY_MAP` (6 ids fijos) | `lib/api.ts:985`, `useFormSchema.ts:28`, `useSubmitPlace.ts`, `lib/form/collectFormData.ts` | `getPackCatalog(packId)` → `categories[].subcategories[].id` | Usar el id del catálogo, no un mapa de slugs |
| `ITEM_TYPES` (labels en inglés, colores, filtro `wifi`) | `lib/itemTypes.tsx`, `FormPage/sections/components/Step0UserInfo.tsx:164` | `PackCatalogSubcategory`: `icon`, `color`, `availableForUpload` | Filtrar por `availableForUpload` (hoy el toggle del admin no afecta el formulario público) |
| `ICON_MAP` (slug → icono y color) | `SideBar/constants/icon-map.constants.tsx` | `icon` (nombre Tabler) y `color` del catálogo; `useTablerIcon` ya existe | Usar el icono de la API; dejar solo los SVG propios que no están en Tabler (Metro, hidden gem) |
| `SECTION_ORDER`, `LOCAL_HIGHLIGHTS_SLUGS`, `LOCAL_HIGHLIGHT_COLOR` | `views/MapPage/constants/categories.ts` | `sortOrder` del catálogo y `color` de categoría | Ordenar por `sortOrder`; el "tipo de sección" necesita un campo nuevo en categoría (ver §4.2) |
| Filtros de bienvenida | `SideBar` | `visibleInFilters` (ya en el tipo) | Usarlo; hoy se lee en otros lugares y no siempre aquí |
| `FALLBACK_PACKS = [{ value: "1", label: "Quito" }]` | `components/admin/CsvUploadPanel.tsx:49` | `getPacks()` | Quitar el fallback; mostrar error si la API falla |
| Zonas de respaldo `map_zones.json` | `lib/zones/zones.ts`, `hooks/useMapZones.ts` | `getPacks()` con `boundary` | Decidir y eliminar (lo pide la auditoría original); hoy muestra zonas que pueden no coincidir con el admin |
| Plantilla CSV | `CsvUploadPanel.tsx` | `getCsvTemplateInfo()` (ya en `api`) | Confirmar que el panel no tiene columnas escritas a mano |
| Landings de Ecuador y México | `EcuadorPage/**`, `MexicoPage/**`, `app/[locale]/[country]/page.tsx:74-79` | `getPublicCountryLanding(iso)` | Una sola landing genérica (lo pide la auditoría original) |
| Imágenes de zonas (`/img/LandingPage/quito-city.webp`, etc.) | `EcuadorPage/sections/ZonesSection.tsx:90-104`, `MexicoPage/sections/ZonesSection.tsx:14-15` | `coverImageUrl` (ya en `AdminZone` y `Pack`) | Usar la portada de la API |

### 4.2 Requiere un campo nuevo en el backend

| Valor hardcodeado | Dónde | Campo propuesto |
|---|---|---|
| `DEFAULT_PACK_ID = 1` (3 archivos: `map/page.tsx:8`, `ViewMap.tsx:137`, `useSidebarState.ts:38`) y `packId: 1` en el envío (`collectFormData.ts:35`) | front | `pack.isDefault` o "zona por defecto" en el admin |
| `ZONE_ID_TO_ZONA` (5 ids de Quito a categorías de analítica) | `lib/analytics/zones.ts` | `zone.analyticsKey` editable en el admin |
| Tipo de sección y color de las categorías especiales (`hidden-gems`, `local-highlights`) | `categories.ts` | `category.sectionType` (`highlight`, `hidden_gem`, `standard`) |
| Centro del mapa cuando no hay pin (Quito) | `stores/form/location/location.ts:57`, `PlacePickerMapContent.tsx:21`, `ZoneUnavailableMapContent.tsx:43` | Calcular del `boundary` de la zona activa (ya existe); no requiere campo |

### 4.3 Se queda en código (no es dato de negocio)

- URL de estilos de Mapbox (`mapbox://styles/...`) y token: a `shared/map/mapbox.config.ts`, una sola vez.
- Umbral móvil (768 px), tamaños del mapa y tiempos de debounce: `shared/config/`.
- Estados de un punto o de una solicitud (`pending`, `applied`, `rejected`, `active`, `coming_soon`, `inactive`): son enums del contrato. Sus **etiquetas** van a i18n y sus **colores** a un solo registro (§5.5).
- URL de Stack Auth repetida en `middlewares/auth.js` y `user.service.js` (lado back, para referencia): una constante.
- `afterSignIn: "/admin"` (`src/stack.ts`): usar la ruta con locale.

---

## 5. DRY: duplicados y cómo unificarlos

Cada fila es un grupo de código que hace lo mismo. "Destino" es el componente o módulo único.

### 5.1 Capa de datos (lo más grande)

| ID | Duplicado | Cuántas veces | Destino | Principio |
|---|---|---|---|---|
| D1 | Pedir token, cargar, guardar estado y mostrar error a mano en cada página | 26 archivos con `setLoading`, 74 `getToken()` | `shared/api/client.ts` inyecta el token una vez; los hooks `useXxxQuery` / `useXxxMutation` (TanStack Query, ya instalado) | DRY, DIP |
| D2 | `api.*(token, ...)`: el token se pasa en cada función | 79 funciones | Cliente con `tokenProvider` (`useAccessToken()`); las funciones `places.api.ts` reciben solo datos | DIP, ISP |
| D3 | Extraer mensaje de error | 82 `catch`, 54 `instanceof` | `getErrorMessage(err)` en `shared/api/errors.ts` | DRY |
| D4 | `notifications.show({...})` con textos y colores repetidos | 127 | `notify.success(key)` / `notify.error(err)` en `shared/notify/` | DRY |
| D5 | Dos clientes de API: `lib/api.ts` y `lib/places-api.ts` (`fetchPlaces`, `fetchCardSchema`) | 2 | Un solo cliente; `places-api.ts` pasa a `features/places/api/` | DRY, SRP |
| D6 | Dos tipos `Place`: `lib/api.ts:200` y `lib/places-api.ts:28` | 2 | Un tipo por feature, generado o compartido con el back (ver §6, fase 3) | DRY |
| D7 | Tipos de zona: `MapZone` (`useMapZones`), `AdminZone`, `AdminZoneDetail`, `GeoJsonPolygon`, `ZoneBbox` | 5 | `features/zones/model/types.ts` | DRY |
| D8 | Acceso a localStorage: `sidebarStorage.ts`, `session.ts`, `useFeedbackTrigger.ts`, `ViewMap.tsx` (última zona), `countryStore` (persist) | 5 | `shared/storage/` (`readJSON`/`writeJSON`); `persist` de Zustand queda solo para stores | DRY |
| D9 | Lógica de catálogo repetida en 6 listas (`ITEM_TYPES`, `SUBCATEGORY_MAP`, `categories.ts`, `icon-map`, `FormSection`, `CollapsedIcons`) | 6 | Un hook `useCatalog(packId)` sobre `getPackCatalog` | DRY, SRP |

### 5.2 Mapas

| ID | Duplicado | Archivos | Destino |
|---|---|---|---|
| D10 | `MAP_STYLE` y `MAPBOX_TOKEN` copiados | 6 y 6 | `shared/map/mapbox.config.ts`. Hoy hay dos estilos (`light-v11` y `standard`): decidir uno o dejar el de cada modo en config |
| D11 | Par "wrapper dinámico + contenido" para mapas | `components/admin/StaticMap.tsx` + `StaticMapContent.tsx`; `PlacePickerMap.tsx` + `PlacePickerMapContent.tsx`; `ZoneBoundaryEditor.tsx` + `ZoneBoundaryEditorContent.tsx`; `InteractiveMapContent` (vía `PlaceMapModal`) | `shared/map/clientOnly.tsx` (un solo `dynamic(..., { ssr: false })`) |
| D12 | Seis mapas que crean `Map` de Mapbox con la misma configuración | `ZoneBoundaryEditorContent` (300 líneas), `PlacePickerMapContent` (187), `ZoneUnavailableMapContent` (153), `StaticMapContent` (44), `InteractiveMapContent` (49), `LocationMap` (520) | `shared/map/MapCanvas.tsx` (estilo, token, controles, bounds) y capas por feature (`PolygonLayer`, `PinLayer`) |
| D13 | Centro por defecto y bbox de zona calculados de tres formas | `PlacePickerMapContent.tsx`, `ZoneUnavailableMapContent.tsx`, `LocationMap.tsx`, `ZoneUnavailableModal.tsx` | `features/zones/geo/` (`bboxOf`, `centerOf`) |
| D14 | Máscara gris calculada dos veces | `ViewMap.tsx`, `LocationMap.tsx` (según la auditoría original) | un solo `zoneMask()` |
| D15 | `isInsideAnyActiveZone` con resultados opuestos sin zonas | `useLocationMapLogic` (true) y `useMapZones` (false) | una sola función con el caso vacío explícito |
| D16 | Distancia en metros | `lib/map.ts` (`getDistanceInMeters`), `app/api/nearby/route.ts` (importa de `lib/map`), `radialPosition.ts` (seno y coseno) | `shared/geo/distance.ts` |

### 5.3 Modales y overlays

| ID | Duplicado | Cantidad | Destino |
|---|---|---|---|
| D17 | Modal de formulario con cabecera, botones Guardar/Cancelar, estado de carga y error | `CategoryFormModal`, `SubcategoryFormModal`, `ConfigFormModal`, `DefinitionFormModal`, `FieldGroupFormModal`, `CopyConfigsModal`, `NewZoneModal`, `CreateUserModal`, `PlaceEditModal` | `shared/ui/FormModal.tsx` (props: `open`, `title`, `onSubmit`, `loading`, `children`) |
| D18 | Confirmación antes de acciones destructivas (borrar, desactivar) | `ConfirmModal` ya existe y lo usan varias pantallas admin (`window.confirm` no aparece en el código); verificar cuáles confirman con un `Modal` propio | `ConfirmModal` como único patrón |
| D19 | Cuatro overlays a mano con `position: fixed; zIndex: 99999` (11 usos) | `MobileSheet`, `ZoneUnavailableModal`, `FeedbackModal`, `ViewMap` | `Modal` de Mantine (lo pide la auditoría original) |

### 5.4 Pantallas admin

| ID | Duplicado | Archivos | Destino |
|---|---|---|---|
| D20 | Tabla con búsqueda, filtros, paginación y estado de carga | `PlacesListPage`, `PlacesManagementPage`, `UsersListPage`, `ZonesListPage`, `CountriesListPage`, `TaxonomyPage` (33 `<Table`) | `shared/ui/DataTable.tsx` + `usePaginatedQuery` |
| D21 | Página de creación y de edición con los mismos campos | `PlaceCreatePage` (1.053 líneas) y `PlaceEditModal` (709); `ZoneCreatePage` y `ZoneDetailPage`; `CountryCreatePage` y `CountryDetailPage` | Un formulario por entidad, usado en creación y edición |
| D22 | Formulario dinámico (`uiType`) en tres sitios | `components/form/DynamicPlaceForm.tsx` + `DynamicFormRenderer.tsx`; `PlaceCreatePage`; `FormPreviewModal` | `shared/forms/DynamicFormRenderer.tsx` (un solo renderer) |
| D23 | Subida de archivos a base64 y compresión | `fileToBase64` usado en 8 archivos; `imageCompression.ts` | `shared/files/` |

### 5.5 UI básica

| ID | Duplicado | Archivos | Destino |
|---|---|---|---|
| D24 | Badges de estado con colores distintos | `components/admin/StatusBadge.tsx` (hex), `Countries/components/SelectorStatusBadge.tsx` (colores de Mantine), ~20 mapas `color: "green"` inline | `shared/ui/StatusBadge.tsx` con registro por dominio (`placeStatusStyles`, `selectorStatusStyles`) |
| D25 | Detección de móvil con `innerWidth <= 768` | 8 sitios (`usePlaces`, `events.ts`, `ZoneUnavailableModal`, `ZoneUnavailableMapContent`, `PlaceMarker`, `LocationMap`, `ViewMap`, …) | `shared/hooks/useIsMobile.ts` (un solo listener con `matchMedia`, que también resuelve la rotación) |
| D26 | Colores hex en lugar del tema | `#FFFFFF` 140, `#E5E7EB` 68, `#0EA5E9` 28, `#096590` 28, `#F9FAFB` 24, `#FF3072` 11, `#10B981` 10 | Tokens en `shared/theme/` (existe la paleta en `src/theme/index.ts`) y variables CSS |
| D27 | Estilos de Mantine `styles={{}}` y `style={{}}` repetidos | 926 `style={{` en `src/` | Se cubre con los componentes de D17–D26; lo que sobre, a CSS modules o props de Mantine |
| D28 | Iconos en 4 sistemas | `lib/tablerIcons.ts`, `views/MapPage/utils/icon-to-svg.ts`, `dynamic-icon.ts`, `icon-map.constants.tsx` | `shared/icons/` (un registro; el nombre viene de la API) |

### 5.6 Geometría y zonas

| ID | Duplicado | Destino |
|---|---|---|
| D29 | `analytics/zones.ts` recorre zonas con `booleanPointInPolygon` por su cuenta | `features/zones/geo/containsPoint(zone, point)` usado por analítica y mapa |
| D30 | `turf` se importa en 4 archivos | `shared/geo/` como envoltura; ningún feature importa turf directo |

---

## 6. SOLID aplicado

### 6.1 Single Responsibility: archivos que hacen varias cosas

Umbral propuesto: **300 líneas** por archivo de componente, **150** por hook. Los archivos que lo superan:

| Archivo | Líneas | Responsabilidades a separar |
|---|---|---|
| `views/Admin/Places/PlaceCreatePage.tsx` | 1.053 | formulario, subida de imágenes, mapa de pin, envío, confirmación |
| `components/admin/CsvUploadPanel.tsx` | 944 | selección de pack, plantilla, validación, subida, resultados |
| `views/Admin/Taxonomy/TaxonomyPage.tsx` | 908 | árbol de categorías, subcategorías, reordenamiento, zonas |
| `views/Admin/PlacesManagementPage.tsx` | 891 | cola de solicitudes, filtros, estadísticas, aprobación |
| `views/Admin/Countries/CountryDetailPage.tsx` | 848 | datos del país, zonas, landing, bandera |
| `components/admin/PlaceEditModal.tsx` | 709 | formulario, mapa, imágenes |
| `components/form/DynamicFormRenderer.tsx` | 671 | render de cada `uiType` + validación + lógica condicional |
| `views/Admin/PlaceDetailPage.tsx` | 631 | datos, mapa, historial |
| `views/Admin/Zones/ZoneDetailPage.tsx` | 625 | datos, editor de frontera, portada |
| `components/layout/Header.tsx` | 592 | navegación, selector de idioma, país, menú móvil |
| `views/MapPage/sections/ViewMap.tsx` | 556 | zona, cámara, estado de sidebar, móvil, modales |
| `components/admin/WifiSyncPanel.tsx` | 543 | estado, disparo, resultados |
| `views/MapPage/sections/LocationMap/LocationMap.tsx` | 520 | mapa, cámara, zona fuera de rango, pines, popup |
| `lib/api.ts` | 1.620 | ver §6.2 |

### 6.2 Open/Closed: extender sin tocar

- **Renderer de campos:** `DynamicFormRenderer` tiene una cadena de `if (uiType === ...)`. Pasar a un registro `FIELD_RENDERERS: Record<UiType, Component>`. Un tipo nuevo se agrega en un archivo.
- **Badges de estado:** un registro por dominio (D24).
- **Iconos:** un registro (D28); agregar un icono no obliga a editar el mapa.
- **Taxonomía:** el catálogo de la API decide qué aparece (`availableForUpload`, `visibleInFilters`, `sortOrder`); el código no tiene listas.

### 6.3 Liskov: contratos que se cumplen

- Todos los modales de formulario (D17) reciben el mismo contrato (`open`, `onClose`, `onSubmit`, `initial`, `loading`). Hoy cada uno tiene su firma y su manera de cerrar.
- Los mapas (D12) cumplen un mismo contrato `MapCanvasProps`. Un mapa de admin y el de `/map` se pueden cambiar sin tocar a quien lo usa.
- `ApiError` y los errores de red se tratan igual en `getErrorMessage`. Hoy algunos `catch` esperan `Error` y otros `ApiError`.

### 6.4 Interface Segregation: interfaces pequeñas

- `useAuth()` devuelve `appUser`, `loading`, `isAdmin`, `getToken`, login, logout… Las 31 vistas que lo usan solo necesitan una o dos cosas. Dividir: `useAccessToken()`, `useCurrentUser()`, `useIsAdmin()`.
- `api` tiene 85 métodos en un solo objeto. Dividir por feature (`placesApi`, `zonesApi`, `taxonomyApi`…) para que cada feature importe solo lo suyo.
- `MapCanvasProps` recibe solo lo que el mapa usa; no el store entero.

### 6.5 Dependency Inversion: las páginas dependen de abstracciones

- Las páginas dependen de hooks (`usePlacesList`, `useZoneDetail`), no de `api` ni de `getToken` directo. Así se cambia la fuente (API, caché, mock de test) sin tocar la página.
- El cliente HTTP recibe `tokenProvider` por inyección. Un test puede pasar uno falso.
- La configuración (`NEXT_PUBLIC_*`, Mapbox, umbrales) se lee en `shared/config/env.ts`, no en cada archivo.

---

## 7. Plan por fases

Cada fase es un PR o una serie corta de PRs. No se avanza a la siguiente sin que la anterior esté verde.

### Fase 0 — Red de seguridad (antes de mover nada)

| Tarea | Verificación |
|---|---|
| Crear `vitest.config.ts` (jsdom, alias `@/`) y `@vitest/coverage-v8` | `pnpm test` y `pnpm test:coverage` pasan |
| Crear `.github/workflows/ci.yml` con `tsc --noEmit`, `biome check`, `vitest run`, `next build` | CI verde en la rama |
| Dejar un solo lockfile (pnpm) y `"packageManager"` | `pnpm install --frozen-lockfile` |
| `biome check --write .` y resolver los 7 errores de lint | `biome check .` sin errores |
| Tests de caracterización para `lib/api.ts` (mock de fetch), zonas (`isInsideAnyActiveZone`, `bboxOf`), `buildCardRows` (ya existe) y el collect del formulario | cobertura de la lógica que se va a tocar |

### Fase 1 — Borrar código muerto

| Tarea | Verificación |
|---|---|
| Borrar los 26 archivos de §3.1 en un solo PR | `next build` y prueba manual de `/`, `/map`, `/form`, `/admin` |
| Borrar los 4 métodos de `api` (§3.2) y los exports de §3.3 | `tsc` sin errores |
| Quitar `@mantine/form`, `@emotion/react`, `ts-node` (§3.4) | build |
| Agregar Knip al CI | Knip verde |

### Fase 2 — Primitivas compartidas (sin cambiar comportamiento)

Crear `shared/` y migrar usos de a uno, empezando por los de mayor conteo:

1. `shared/api/client.ts` + `errors.ts` (`getErrorMessage`, `ApiError`) → D2, D3
2. `shared/notify/` → D4 (127 usos)
3. `shared/config/env.ts` + `shared/map/mapbox.config.ts` → D10
4. `shared/hooks/useIsMobile.ts` → D25 (8 sitios)
5. `shared/storage/` → D8
6. `shared/ui/FormModal.tsx`, `ConfirmModal.tsx` → D17, D18
7. `shared/ui/StatusBadge.tsx` → D24
8. `shared/ui/DataTable.tsx` → D20 (primero en una pantalla y luego en las demás)

Cada una es un PR. Ninguna cambia la UI, solo quién la implementa.

### Fase 3 — Partir la API y tipos compartidos

1. Dividir `lib/api.ts` en `shared/api/client.ts` + `features/*/api/*.api.ts`. Dejar un `index.ts` temporal que reexporte para no romper imports; quitarlo al final de la fase.
2. Eliminar el parámetro `token` de las funciones (D2) y pasar al cliente.
3. Unificar `Place` y tipos de zona (D6, D7).
4. Decidir cómo se mantiene el contrato con el back: OpenAPI generado o esquemas zod compartidos (la auditoría original lo recomienda). Mientras tanto, un test de contrato que llame al endpoint de staging y valide la forma.

### Fase 4 — Mover a la estructura por dominio

Un dominio por PR, en este orden (del menos al más acoplado):

1. `legal/`, `donations/`, `feedback/` (pocos archivos, poca dependencia)
2. `auth/`, `admin-shell/`
3. `users/`, `wifi-sync/`, `csv-import/`
4. `taxonomy/`, `properties/`
5. `countries/` (incluye la landing genérica de §4.1)
6. `zones/` (incluye `lib/zones` y `useMapZones`, y el editor de frontera)
7. `places/` (admin)
8. `place-submission/` (formulario público, usa catálogo de §4.1)
9. `map-explorer/` (ver fase 5)

Para mover: `git mv` para conservar historial; luego codemod de imports (tsconfig `paths`). Verificar con `tsc` y con un grep de imports que apunten a la carpeta vieja.

### Fase 5 — Mapa

Sigue la fase 2 de la auditoría original, con esta forma:

1. `shared/map/MapCanvas.tsx` (D12) y `clientOnly()` (D11).
2. `features/zones/geo/` (D13, D14, D15, D29) con tests.
3. Un store de mapa con zona, pack y **una** intención de cámara (`fitZone`, `flyToUser`, `flyToPlace`) y un solo efecto que la ejecuta (la auditoría original describe los 5 lugares que hoy mueven la cámara).
4. `useIsMobile` ya está desde fase 2 (D25).
5. Quitar los overlays a mano (D19).
6. Usar el catálogo de la API para iconos y orden (§4.1).

### Fase 6 — Partir los archivos grandes

Orden por tamaño y por riesgo: `PlaceCreatePage` → `PlaceEditModal` (con D21), `CsvUploadPanel`, `TaxonomyPage`, `PlacesManagementPage`, `CountryDetailPage`, `DynamicFormRenderer` (D22), `Header`. Cada archivo: extraer subcomponentes y hooks, sin cambiar props visibles. Meta: ninguno > 300 líneas.

### Fase 7 — Valores de la API (§4.2)

Requiere cambios en el backend (campos nuevos). Coordinar antes:

| Campo | Lo consume |
|---|---|
| `pack.isDefault` | `DEFAULT_PACK_ID` en 3 archivos y `packId: 1` del formulario |
| `zone.analyticsKey` | `analytics/zones.ts` |
| `category.sectionType` | `categories.ts` |

Después de esto, quitar `map_zones.json` (decisión de producto de la auditoría original).

### Fase 8 — Tema y estilo

- Reemplazar hex por tokens (D26) con búsqueda y reemplazo guiado por archivo.
- `globals.css`: 130 `!important` → eliminar los que sobren (la mayoría deben ser conflictos de Mantine resueltos con `classNames`).
- Regla nueva: sin `style={{}}` con colores; sin hex fuera de `shared/theme`. Biome/ESLint custom o revisión en PR.

---

## 8. Reglas para que no vuelva a pasar

1. **Nada se crea en `shared/` sin dos usos.** Si solo se usa en un dominio, va en ese dominio.
2. **Ningún feature importa internos de otro**: solo su `index.ts`.
3. **Los datos de negocio no se escriben en código**: si cambian por ciudad, país o contenido, van a la API.
4. **Un hook por fuente de datos**: las páginas no llaman a `api` ni a `getToken` directamente.
5. **Tamaños:** componente > 300 líneas o hook > 150 se revisa en PR.
6. **Sin copias con sufijo** (`-backup`, `-old`, `Content` y `Modal` gemelos): git guarda el historial.
7. **Knip en CI** para detectar archivos, exports y dependencias sin uso.

---

## 9. Métricas para medir el avance

| Métrica | Hoy | Meta |
|---|---|---|
| Archivos > 300 líneas (componentes) | 14 | 0 |
| `getToken()` en páginas | 74 | 0 (solo en `shared/api`) |
| `setLoading` a mano | 26 archivos | 0 |
| `notifications.show` directos | 127 | 0 (solo `shared/notify`) |
| Colores hex fuera del tema | >300 usos | 0 |
| Copias de `MAP_STYLE` | 6 | 1 |
| Implementaciones de móvil | 8 | 1 |
| Métodos de `api` sin uso | 4 | 0 |
| Archivos sin importadores | 26 | 0 |
| Tests | 11 | cobertura de zonas, API, formulario y catálogo |
| Valores fijos de ciudad o pack en código | 9 (§4) | 0 (salvo `shared/config`) |

---

## 10. Riesgos y orden de ataque

| Riesgo | Mitigación |
|---|---|
| El mapa es el área con más bugs (23 de 35 commits recientes son fixes, según la auditoría original) | Fase 0 con tests de zonas antes de tocar `LocationMap` |
| Mover archivos rompe imports sin avisar | `tsc` en cada PR; codemod; `git mv` |
| Cambiar la API de cliente (D2) rompe todas las páginas a la vez | Fase 3 con reexport temporal; migrar página por página |
| Un campo nuevo del backend (§4.2) bloquea el front | El front usa un valor por defecto mientras el backend no lo tenga, y registra el aviso |
| Quitar `map_zones.json` deja el mapa vacío si la API falla | Mostrar estado de error explícito antes de quitarlo |
| El formulario público cambia de catálogo (`availableForUpload`) y deja de mostrar opciones que hoy aparecen | Revisar con producto qué subcategorías están marcadas antes de activar el filtro |

**Orden recomendado:** fase 0 → fase 1 → fase 2 (D2, D3, D4 primero) → fase 4 (dominios pequeños) → fase 5 (mapa) → fase 6 → fase 7 (con backend) → fase 8.

---

## 11. Método y límites

- Estructura y duplicados: recorrido de archivos, hash de contenido normalizado (duplicados exactos), búsqueda de nombres y patrones, conteo de usos con `grep`/AST.
- Código muerto: recorrido de imports desde `src/app` con la API de TypeScript; confirmado con búsqueda de nombres. Knip no estaba instalado.
- Los conteos de líneas, usos y archivos son del estado actual del repo; los números de la sección 9 son la línea base.
- No se revisó el contrato del backend en detalle; los campos de §4.2 son propuestas que hay que confirmar.
- No se midió rendimiento ni bundle; las decisiones de §5.2 sobre el estilo de Mapbox son de producto.
