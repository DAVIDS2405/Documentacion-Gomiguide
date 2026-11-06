---
title: Dónde está cada cosa
description: Mapa de archivos del frontend por tema. Para encontrar rápido qué archivo tocar.
---

Rutas relativas a `src/`. Las tablas describen el estado **actual**; la propuesta de carpetas por dominio está en el [plan de refactorización](/refactor/plan/).

## Mapa (explorador público)

| Qué | Dónde |
|---|---|
| Página de servidor (prefetch y `?zone=`) | `app/[locale]/map/page.tsx` |
| Pantalla | `views/MapPage/MapPage.tsx`, `views/MapPage/sections/ViewMap.tsx` |
| Mapa, cámara, pines, popups | `views/MapPage/sections/LocationMap/LocationMap.tsx`, `components/`, `hooks/` |
| Tarjetas y su esquema | `views/MapPage/sections/LocationMap/CardSchemaContext.tsx`, `utils/cardRows.ts` (con test) |
| Zona fuera de rango | `views/MapPage/sections/LocationMap/components/ZoneUnavailableModal.tsx` |
| Sidebar y categorías | `views/MapPage/sections/SideBar/` (`hooks/useSubcategories.ts`, `utils/sidebarStorage.ts`) |
| Controles del mapa | `views/MapPage/sections/MapControls.tsx` |
| Encuesta de satisfacción | `views/MapPage/sections/FeedbackModal/` |
| Constantes de categorías (alias y orden) | `views/MapPage/constants/categories.ts` |
| Lugares (datos) | `hooks/usePlaces.ts`, `lib/places-api.ts` |
| Zonas (datos y respaldo) | `hooks/useMapZones.ts`, `lib/zones/zones.ts`, `lib/map_zones.json` |
| Geocodificación y calles | `hooks/useReverseGeocode.ts`, `hooks/useNearbyStreets.ts`, `lib/map.ts` |
| Ubicación del usuario | `hooks/useCurrentLocation.ts`, `views/MapPage/sections/LocationMap/hooks/useLiveLocation.ts` |

## Formulario público

| Qué | Dónde |
|---|---|
| Página | `app/[locale]/form/page.tsx` → `views/FormPage/FormPage.tsx` |
| Pasos | `views/FormPage/sections/components/Step0UserInfo.tsx`, `Step1PlaceInfo.tsx`, `Step2Confirmation.tsx`, `FormFooter.tsx` |
| Hooks de envío y validación | `views/FormPage/sections/hooks/useFormSubmission.tsx`, `useFormValidation.ts` |
| Esquema dinámico | `hooks/useFormSchema.ts` |
| Renderizado por `uiType` | `components/form/DynamicFormRenderer.tsx` (y `DynamicPlaceForm.tsx`) |
| Estado (Zustand) | `stores/form/dynamicFields.ts`, `stores/form/inital.ts`, `stores/form/location/location.ts` |
| Ubicación en el formulario | `views/FormPage/sections/LocationSection.tsx` (usa `LocationMap`) |
| Armar el envío | `lib/form/collectFormData.ts` |
| Imágenes | `lib/fileToBase64.ts`, `lib/imageCompression.ts` |

## Países y landings

| Qué | Dónde |
|---|---|
| Decisión de vista | `app/[locale]/[country]/page.tsx` |
| Selector de países | `views/PreHomePage/` (`sections/CountriesSection.tsx`) |
| Próximamente | `views/ComingSoonPage/` |
| Ecuador / México (copy fijo) | `views/EcuadorPage/`, `views/MexicoPage/` |
| Estado del país seleccionado | `stores/data/countryStore.ts` (persistido) |
| Utilidades de países | `lib/getCountries.ts` (nombres por idioma), `lib/countryMetada.ts` (solo tipos) |

## Admin

| Qué | Dónde |
|---|---|
| Rutas | `app/[locale]/admin/**/page.tsx` |
| Layout y guarda | `app/[locale]/admin/layout.tsx` (+ `src/proxy.ts`) |
| Sesión y rol | `hooks/useAuth.ts` (`isAdmin = role === "admin"`) |
| Cabecera y menú | `components/admin/AdminHeader.tsx`, `AdminSidebar.tsx` |
| Lugares | `views/Admin/PlacesListPage.tsx`, `PlacesManagementPage.tsx`, `PlaceDetailPage.tsx`, `Places/PlaceCreatePage.tsx` |
| Edición y mapas de lugares | `components/admin/PlaceEditModal.tsx`, `PlaceMapModal.tsx`, `StaticMap.tsx`, `InteractiveMapContent.tsx`, `Places/components/PlacePickerMap*.tsx` |
| Zonas | `views/Admin/Zones/` (lista, detalle, creación, editor de frontera `ZoneBoundaryEditor*`) |
| Países | `views/Admin/Countries/` (lista, detalle, creación, `LandingFields.tsx`) |
| Taxonomía | `views/Admin/Taxonomy/` |
| Propiedades y formularios | `views/Admin/Properties/` (definiciones, grupos, configuración, vista previa) |
| Usuarios | `views/Admin/UsersListPage.tsx`, `components/admin/CreateUserModal.tsx` |
| CSV | `views/Admin/CsvUploadPage.tsx`, `components/admin/CsvUploadPanel.tsx` |
| WiFi | `views/Admin/WifiSyncPage.tsx`, `components/admin/WifiSyncPanel.tsx` |
| Login y recuperación | `views/Admin/LoginPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` |
| Confirmaciones y badges | `components/admin/ConfirmModal.tsx`, `StatusBadge.tsx`, `Countries/components/SelectorStatusBadge.tsx` |

## Cliente de API y tipos

| Qué | Dónde |
|---|---|
| Cliente central (85 métodos, token como parámetro) | `lib/api.ts` (1.620 líneas) |
| Cliente del mapa | `lib/places-api.ts` |
| URL base | `process.env.NEXT_PUBLIC_BACKEND_URL` en `lib/api.ts`, `lib/places-api.ts`, `hooks/useSubcategories.ts` |
| Tipos | `lib/api.ts` (la mayoría), `lib/places-api.ts`, `types/index.ts`, `types/map.ts`, `views/MapPage/sections/SideBar/types/` |
| Constante de taxonomía fija | `lib/api.ts` → `SUBCATEGORY_MAP` |

## Autenticación

| Qué | Dónde |
|---|---|
| Servidor (con secreto) | `src/stack.ts` (importa `server-only`) |
| Cliente | `lib/stack-auth.ts`, `app/[locale]/providers.tsx` |
| Manejador de Stack | `app/handler/[...stack]/page.tsx` |
| Token para llamadas | `useAuth().getToken()` → `Authorization: Bearer` en `apiRequest` |

## Diseño, idioma y analítica

| Qué | Dónde |
|---|---|
| Tema Mantine | `theme/index.ts` |
| Estilos globales | `app/globals.css` |
| Fuentes | `lib/fonts.ts` |
| Mensajes | `messages/en.json`, `messages/es.json`, `i18n/routing.ts`, `i18n/request.ts` |
| Layout raíz | `app/layout.tsx`, `app/[locale]/layout.tsx` (metadatos, GA, Vercel Analytics) |
| Cabecera y pie | `components/layout/Header.tsx`, `Footer.tsx` |
| Analítica | `lib/analytics/` (`mixpanel.ts`, `events.ts`, `session.ts`, `utm.ts`, `AnalyticsProvider.tsx`) |
| Donación | `components/ui/Buttons/DonationButton.tsx` (Ko-fi) |

## Código sin uso

La lista completa (26 archivos) está en la [auditoría complementaria](/auditoria/complementaria/) y en el [plan de refactorización](/refactor/plan/#3-código-muerto-borrar).
