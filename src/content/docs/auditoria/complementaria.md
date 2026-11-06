---
title: Auditoría front complementaria
description: Hallazgos del frontend que no estaban en la auditoría original.
---

> Copia sincronizada desde `Gomi — Auditoría front complementaria.md`. Editar el original y volver a ejecutar `pnpm sync`.

**Repo:** `gomiguide-frontend` (Next.js 16, React 19, Mantine 8, Mapbox, Zustand, TanStack Query)
**Base de comparación:** "Gomi — Auditoría técnica front y back" (Freddy, 5 nov 2026)
**Alcance:** solo frontend. Lo que el documento original ya cubre se verifica, no se repite.

---

## 1. Resumen

El documento original es preciso en lo que afirma sobre el front: los números de código muerto, `SUBCATEGORY_MAP`, `packId: 1`, los 7 `innerWidth`, los 11 overlays con `zIndex: 99999` y el pack por defecto en tres archivos se confirmaron en el código.

Lo que **no cubre** y conviene atender:

| Área | Hallazgos nuevos | Severidad máxima |
|---|---|---|
| Seguridad y privacidad | 6 | Alta |
| Confiabilidad (errores, monitoreo) | 4 | Alta |
| Calidad y tooling | 8 | Alta |
| Accesibilidad, SEO, rendimiento | 5 | Media |

**Estado actual medido (ejecutado localmente):**

| Comprobación | Resultado |
|---|---|
| `tsc --noEmit` | OK (exit 0) |
| `next build --turbopack` | OK (compila, 36 rutas) |
| `vitest run` | OK: 1 archivo, 11 tests |
| `biome lint .` (`pnpm lint`) | **Falla**: 7 errores, 191 avisos |
| `biome format .` | **Falla**: 61 archivos sin formatear |
| `vitest run --coverage` | **Falla**: falta `@vitest/coverage-v8` |

---

## 2. Correcciones al documento original

| Afirmación del documento | Realidad verificada |
|---|---|
| "Cero tests en el front" | Hay 1 archivo de tests: `src/views/MapPage/sections/LocationMap/utils/cardRows.test.ts` (11 tests, pasan). Lo correcto es "un solo test de 11 casos". |
| `lib/api.ts` tiene 1.611 líneas | Hoy tiene **1.620**. Diferencia menor, pero conviene actualizar. |
| "23 de 35 commits del mapa desde agosto son fixes" | Con `git log --since=2026-08-01 -- src/views/MapPage`: 33 commits, 22 con "fix". Cifras aproximadas; depende del rango elegido. |
| Knip "en CI" | **No existe CI** en el repo (no hay `.github/`). Hay que crearlo antes de poder agregar Knip. |
| "Dead code: 26 archivos, ~2.300 líneas" | **Confirmado**: 26 archivos, 2.301 líneas. Mi recorrido del grafo de imports desde `src/app` marcó además `i18n/request.ts` (sí se usa, lo carga `next.config.ts`), `__mocks__` y el test; no son código muerto. |
| `CLAUDE.md` dice Leaflet | Correcto que está desactualizado. Además dice "no test files exist yet", que también es falso. |

---

## 3. Hallazgos nuevos

Formato: **ID · severidad · dónde · qué pasa · propuesta**.

### 3.1 Seguridad y privacidad

**S1 · Alta · Consentimiento de analítica**
`src/app/[locale]/layout.tsx`, `src/lib/analytics/mixpanel.ts`, `src/lib/analytics/session.ts`
Se cargan Google Analytics (`@next/third-parties`), Vercel Analytics y Mixpanel (con `persistence: "localStorage"`) sin banner de consentimiento. No encontré ningún componente de consentimiento. La política de privacidad menciona "cookies" pero no nombra Mixpanel ni Google Analytics (verificado por búsqueda de texto).
*Propuesta:* revisar con asesoría legal qué exige la LOPDP (Ecuador) y, si aplica, la normativa de México para los mercados que se van a abrir. Implementar consentimiento antes de inicializar Mixpanel y GA, y listar los proveedores en la política.

**S2 · Media · `/api/reverse` sin validación ni política de uso**
`src/app/api/reverse/route.ts`
- `lat` y `lng` se interpolan directamente en la URL de Nominatim sin validar. Un valor como `1&format=xml` inyecta parámetros.
- Si faltan, se envía `lat=null`.
- El `User-Agent` es `"my-app"`. La política de Nominatim exige identificar la aplicación; con un agente genérico el servicio puede bloquear el dominio.
- No revisa `response.ok` antes de parsear.
- Es público y sin rate limit.
*Propuesta:* validar con zod (rango de lat/lng), usar `URLSearchParams`, un User-Agent real con contacto y un límite de tasa.

**S3 · Media · `/api/nearby` acepta coordenadas que faltan**
`src/app/api/nearby/route.ts`
`Number(searchParams.get("lat"))` con parámetro ausente devuelve `0`, no `NaN`. Así que `/api/nearby` sin parámetros consulta Overpass en (0, 0). Además no valida rangos (`Infinity` pasa). Es público, sin rate limit, y cada llamada consume cuota de Overpass, un servicio gratuito con límites.
*Propuesta:* mismo esquema zod que S2 y límite de tasa por IP.

**S4 · Media · Sin cabeceras de seguridad**
`next.config.ts`
No hay `headers()`: falta CSP, `X-Frame-Options` / `frame-ancestors`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`. Las integraciones externas (Mapbox, GA, Mixpanel, Stack, Tabler) hacen que una CSP sea trabajo, pero conviene empezar con `Report-Only`.

**S5 · Media · Protección de `/admin` solo por nombre de cookie**
`src/proxy.ts`, `src/app/[locale]/admin/layout.tsx`
- `proxy.ts` deja pasar cualquier cookie cuyo nombre contenga `stack` o `auth`. Es una comprobación de presencia, no de sesión.
- La verificación real es `isAdmin` en el cliente (`useAuth`). Es UX, no seguridad: la protección depende por completo de que el backend valide el token en cada endpoint admin. No pude verificarlo desde el front.
- `pathname.includes("/admin")` también coincide con cualquier ruta que contenga `/admin`.
*Propuesta:* confirmar en el backend que todo endpoint admin valida rol. En el front, validar sesión con Stack en el servidor y no solo presencia de cookie.

**S6 · Baja · Token de Mapbox repetido y sin restricción documentada**
`NEXT_PUBLIC_MAPBOX_TOKEN` se lee en 6 lugares, con la constante `MAPBOX_TOKEN` copiada en 4 archivos. Es un token `pk.` (público, correcto para el navegador), pero el repo no muestra restricción por URL.
*Propuesta:* restringir el token por dominio en el panel de Mapbox y centralizar la lectura en un solo módulo.

**S7 · Baja · Redirección post-login sin locale**
`src/stack.ts`: `afterSignIn: "/admin"` está fijo; el resto de rutas usa `/{locale}/...`. Funciona porque hay redirección, pero rompe el idioma para usuarios en inglés.

**Positivo verificado:** `src/stack.ts` importa `"server-only"` y `STACK_SECRET_SERVER_KEY` no aparece en código de cliente. `.env` está ignorado por git y no está versionado. No hay `dangerouslySetInnerHTML` en `src/`.

### 3.2 Confiabilidad

**R1 · Alta · Sin manejo de errores por ruta**
No existe ningún `error.tsx`, `global-error.tsx`, `not-found.tsx` ni `loading.tsx` en `src/app`. Un error en render dentro de `/map` o `/form` deja la pantalla en blanco, y las rutas inexistentes muestran la página por defecto de Next.
*Propuesta:* agregar `error.tsx` (raíz y `[locale]`), `global-error.tsx`, `not-found.tsx` localizado y `loading.tsx` en `/map`.

**R2 · Alta · Sin monitoreo de errores en producción**
No hay Sentry, Bugsnag, Datadog ni similar en `package.json`. Hay 26 llamadas `console.*` en `src/`; en producción solo quedan en la consola del navegador del usuario. Un bug en el mapa solo se descubre cuando alguien lo reporta.
*Propuesta:* un proveedor de errores con source maps, aunque sea el plan gratuito.

**R3 · Media · `apiRequestPublic` sin timeout**
`src/lib/api.ts:20`: `fetch` sin `AbortController` ni timeout. Una API lenta deja el formulario o el mapa colgados sin feedback.
*Propuesta:* timeout por defecto de 15 s en ambos wrappers de `api.ts`.

**R4 · Baja · `suppressHydrationWarning` en `<body>`**
`src/app/[locale]/layout.tsx`. Oculta desajustes de hidratación reales en todo el sitio. Quitarlo y corregir lo que aparezca.

### 3.3 Calidad y tooling

**Q1 · Alta · Lint y formato fallan**
`pnpm lint` termina con código 1: 7 errores y 191 avisos (entre ellos `noExplicitAny` en `src/hooks/usePlaces.ts:28`, imports y variables sin usar, dependencias de hooks incompletas). `biome format` reporta 61 archivos. Sin lint verde no hay base para CI.
*Propuesta:* `biome check --write .` (arregla la mayoría de formato y los `useImportType`) y resolver los 7 errores a mano.

**Q2 · Alta · Sin CI ni hooks de pre-commit**
No hay `.github/workflows`, ni husky ni lefthook. Nada corre `tsc`, lint, tests ni build antes de mergear. El build sí pasa hoy, así que la base es buena para empezar.
*Propuesta:* workflow mínimo con `tsc --noEmit`, `biome check`, `vitest run` y `next build`.

**Q3 · Alta · Tests: infraestructura a medio hacer**
- Un archivo de test (11 casos).
- No existe `vitest.config.*` ni setup; el alias `@/` no se configura para tests.
- `test:coverage` falla: falta `@vitest/coverage-v8`.
- Instaladas y sin uso: `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `vite-tsconfig-paths`, `@vitejs/plugin-react`.
*Propuesta:* crear `vitest.config.ts` con `jsdom` y alias, quitar lo que no se use o usarlo en los primeros tests de `zones` y del formulario.

**Q4 · Alta · Dos lockfiles versionados**
`pnpm-lock.yaml` y `bun.lock` están en git. `CLAUDE.md` dice pnpm. Con dos lockfiles, cada quien puede instalar versiones distintas.
*Propuesta:* conservar `pnpm-lock.yaml`, borrar `bun.lock` y añadir `"packageManager"` en `package.json`.

**Q5 · Media · Dependencias probablemente sin uso**
Verificado por búsqueda de importación: `@mantine/form`, `@emotion/react`, `ts-node` (no hay referencias), además de las de tests de Q3. `embla-carousel-react` y `dayjs` no se importan directamente pero son peer dependencies de `@mantine/carousel` y `@mantine/dates`; no quitar.
*Propuesta:* `knip` lo confirma; quitar lo que quede sin uso.

**Q6 · Media · Archivos grandes del admin y del formulario**
Por encima de 500 líneas en el front (el documento solo habla de back y `api.ts`):

| Archivo | Líneas |
|---|---|
| `src/lib/api.ts` | 1.620 |
| `src/views/Admin/Places/PlaceCreatePage.tsx` | 1.053 |
| `src/components/admin/CsvUploadPanel.tsx` | 944 |
| `src/views/Admin/Taxonomy/TaxonomyPage.tsx` | 908 |
| `src/views/Admin/PlacesManagementPage.tsx` | 891 |
| `src/views/Admin/Countries/CountryDetailPage.tsx` | 848 |
| `src/components/admin/PlaceEditModal.tsx` | 709 |
| `src/components/form/DynamicFormRenderer.tsx` | 671 |

*Propuesta:* partir en subcomponentes y hooks; no es prioritario frente a S/R.

**Q7 · Media · `.env.example` incompleto**
Faltan en `.env.example`: `NEXT_PUBLIC_BACKEND_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_STACK_AUTH_PROJECT_ID`, `NEXT_PUBLIC_STACK_PROJECT_ID`, `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`, `STACK_SECRET_SERVER_KEY`. Un desarrollador nuevo no arranca el mapa ni el login sin preguntar.
*Propuesta:* completar el ejemplo con comentarios, sin valores reales. Además `stack.ts` acepta dos nombres para el mismo ID de proyecto: documentar cuál es el canónico.

**Q8 · Baja · Estilos mezclados**
`src/app/globals.css` tiene 130 `!important` (Biome `noImportantStyles`). Además hay ~926 `style={{...}}` inline en `src/`. Dos sistemas de estilo más Mantine props. Conviene decidir uno para el código nuevo.

**Q9 · Baja · Documentación del agente desactualizada**
`CLAUDE.md`: Leaflet (hoy Mapbox), "no test files exist" (hay 1), y el comando de tests describe una suite vacía. Hay que actualizarlo junto con `AGENTS.md` (el documento original ya lo pide).

**Q10 · Baja · Archivos sueltos**
`docs/prueba-pr.md` está versionado; parece un documento temporal.

### 3.4 Accesibilidad, SEO y rendimiento

**A1 · Media · Botones sin nombre accesible**
Con un AST de los `.tsx` en `src/`: **27 de 38** `<ActionIcon>` no tienen `aria-label`. Incluye los controles del mapa público en `src/views/MapPage/sections/MapControls.tsx` (zoom, estilo, ubicación; líneas 64–86) y el botón de la sidebar en `DesktopSidebar.tsx:119`. Un lector de pantalla los anuncia sin nombre (WCAG 4.1.2).
*Propuesta:* `aria-label` con `t()` en los controles del mapa primero. Biome también marca `useKeyWithClickEvents` y `noStaticElementInteractions` en `src/views/Admin/Zones/components/ZoneBoundaryEditorContent.tsx:231`.

**A2 · Media · SEO incompleto**
- `generateMetadata` solo en 4 archivos (layout, home, `map`, `[country]`). `/terms`, `/privacy-policy`, `/form`, `/report` no tienen metadatos propios.
- No hay `robots.ts` ni `sitemap.ts`.
- `metadataBase` apunta a `https://gomiguide.com` fijo en `layout.tsx`.
- No hay imagen Open Graph.
*Propuesta:* metadatos por página y un `sitemap.ts` que liste países y zonas activas desde la API.

**A3 · Media · Imágenes pesadas del landing**
`public/` pesa 14 MB. `quito-city.webp` y `galapagos-city.webp` pesan 4,9 MB cada una y se usan en `EcuadorPage/sections/ZonesSection.tsx`. Se sirven con `next/image`, así que el navegador recibe una versión optimizada, pero el origen y el primer render dependen del tamaño original.
*Propuesta:* recomprimir o redimensionar a ~1600 px; no medido con Lighthouse.

**A4 · Baja · Imágenes sin `next/image`**
Biome `noImgElement` marca 10 `<img>`, entre ellos 4 de `icon-map.constants.tsx` (iconos de la sidebar) y `ViewMap.tsx:367`. Algunos ya tienen `biome-ignore` justificado (pines dentro de marcadores de Mapbox).

**A5 · Baja · Peso de la base en páginas públicas (no medido)**
`StackProvider`, `StackTheme`, `MantineProvider`, TanStack Query y Analytics se montan en `layout.tsx` y `providers.tsx`, así que llegan también al mapa público. No medí el bundle; conviene revisarlo con `next build` y el analizador antes de decidir.

**Positivos verificados en accesibilidad:** todos los `<img>` de `src/` tienen `alt`; el i18n está bien: la búsqueda de texto literal en JSX solo encontró una cadena en código muerto (`ThemeDemo.tsx`).

---

## 4. Código muerto confirmado (26 archivos)

Lista del documento original, verificada con el recorrido de imports:

- `views/HomePage/*` (4 archivos) y `views/HomePage-backup/*` (4 archivos)
- `components/ui/ThemeDemo.tsx`, `components/ui/Buttons/ColorSchemeToggle.tsx`, `components/ui/Buttons/LanguageToggle.tsx`
- `components/form/DynamicFormSection.tsx`, `components/form/DynamicFormField.tsx`
- `hooks/useSubmitPlace.ts`, `hooks/useCountdown.ts`
- `views/FormPage/sections/LocationSection.tsx`, `views/FormPage/sections/Open.tsx`
- `stores/form/openingHours.ts`, `stores/form/pricing.ts`, `stores/form/location/validators.ts`
- `stores/data/exampleStore.ts`, `lib/performance.ts`
- `views/MapPage/constants/layout.constants.ts`, `views/MapPage/sections/LocationMap/utils/placeCluster.ts`, `utils/radialPosition.ts`, `views/MapPage/sections/SideBar/hooks/useBottomSheet.ts`

**Advertencia:** `src/components/form/DynamicPlaceForm.tsx` **no** es código muerto (lo usa `Step1PlaceInfo.tsx`), pero tiene 1 variable sin usar y 1 dependencia de hook incompleta según Biome.

---

## 5. Orden de trabajo sugerido (complementa las fases del documento original)

**Antes de cualquier refactor:**
1. S2 y S3: validar `lat`/`lng` y poner límite de tasa en `/api/reverse` y `/api/nearby`. Cambio pequeño, riesgo real (bloqueo de Nominatim, cuota de Overpass).
2. R1: `error.tsx`, `not-found.tsx` y `global-error.tsx`. Pocas líneas, evita pantallas en blanco.
3. R2: proveedor de errores.
4. S1: consentimiento de analítica (decisión legal antes de implementar).

**Base de calidad (Fase 1 del documento original):**
5. Q4 (un solo lockfile) y Q2 (CI mínimo).
6. Q1: `biome check --write` y resolver los 7 errores.
7. Q3: `vitest.config.ts`, `@vitest/coverage-v8` y los primeros tests.
8. Q7: `.env.example` completo.

**Después:**
9. S4 (CSP en `Report-Only`), S5, A1 (`aria-label` en el mapa), A2 (SEO), A3 (imágenes).
10. Q5 y Q6, junto con el borrado de código muerto del documento original.

---

## 6. Método y límites

- Revisé el repo local (`~/Documents/gomiguide-frontend`), rama de trabajo actual, con `tsc`, `biome`, `vitest` y `next build` ejecutados localmente.
- El código muerto se recalculó con un recorrido de imports propio (TypeScript API), no con Knip (no está instalado).
- No ejecuté la app en navegador: no medí rendimiento (Lighthouse), bundle ni comportamiento real de Mapbox.
- No audité los endpoints del backend; los puntos S5 y R3 dependen de eso.
- No revisé la lógica del mapa línea por línea más allá de verificar las afirmaciones del documento original.

**Riesgo principal:** S1 (analítica sin consentimiento) y S2/S3 (endpoints públicos sin validar) son los que pueden tener impacto fuera del código. **No revisé** el backend ni la configuración de Mapbox/Stack/GA en sus paneles.
