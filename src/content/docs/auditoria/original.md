---
title: Auditoría técnica original (front y back)
description: Resumen de los 11 hallazgos de la auditoría de Freddy (5 nov 2026), el orden de trabajo y el PDF completo.
---

Documento completo: [descargar el PDF](/docs/auditoria-original.pdf) (11 páginas, "Gomi — Auditoría técnica front y back", @Freddy).

El documento dice que el problema de fondo son varias fuentes de verdad para el mapa y la creación de lugares, y que hay un riesgo de seguridad en el backend que conviene corregir antes de cualquier refactor.

## Hallazgos (orden de severidad)

| # | Hallazgo | Dónde | Severidad |
|---|---|---|---|
| 1 | Aprobar un change request interpola propiedades como texto en SQL | `back` `place-change-request.service.js:363-375` | Crítica |
| 2 | Las sugerencias del formulario siempre van al pack 1 (Quito) | `front` `collectFormData.ts:35`, `useFormSchema.ts:22` | Alta |
| 3 | El mapa no tiene dueño único del estado de zona ni de la cámara | `ViewMap.tsx`, `LocationMap.tsx` | Alta |
| 4 | El explorador reutiliza el selector de ubicación del formulario y su store | `LocationMap`, `stores/form/location` | Alta |
| 5 | Cero tests en el front y uno en el back | ambos repos | Alta |
| 6 | Minimapa del modal "Zona no disponible" sin props: siempre Quito | `ZoneUnavailableModal.tsx` | Media |
| 7 | Taxonomía quemada en el front (`SUBCATEGORY_MAP`) | `constants/categories.ts` | Media |
| 8 | Landings de Ecuador y México codificadas aunque existe el CMS de países | `[country]/page.tsx:74-79` | Media |
| 9 | Cuatro caminos distintos insertan lugares y siete helpers de auditoría | `back`, servicios | Media |
| 10 | Sincronización de WiFi atada a Quito | `wifi-sync.service.js:3-9` | Media |
| 11 | Código muerto: 26 archivos y el endpoint `/places/banks` | ambos repos | Baja |

## Orden de trabajo propuesto

| Fase | Contenido |
|---|---|
| 0 · Urgente | Parámetros en el UPDATE de aprobación y en `getPlacesForMap`; decidir si editar o borrar requiere sesión; enviar el pack real y validar el polígono |
| 1 · Contexto y red de seguridad | Actualizar `AGENTS.md` y `CLAUDE.md`; skills compartidas; borrar código muerto y agregar Knip; primeros tests |
| 2 · Mapa | Separar `MapExplorer` y `LocationPicker` sobre un `MapCanvas`; store del mapa; módulo de zonas; `useIsMobile`; modales de Mantine |
| 3 · Backend | `placeWriter` único; una consulta de lugares con filtros; `utils/audit.js`; partir archivos grandes; migrar a TypeScript |
| 4 · Admin como fuente de verdad | Taxonomía del pack, zona por defecto, landing genérica, configuración de WiFi por pack |
| 5 · B2B | Responder preguntas de cliente y tenant; diseñar el módulo |

## Preguntas abiertas que dejó

- ¿Quién es un cliente B2B (municipio, empresa, operador turístico) y qué controla?
- ¿El pack es la frontera de cliente (tenant) o hace falta una entidad "organización"?

## Qué encontramos después

Las dos auditorías de esta documentación confirman el documento original y agregan:

- **Confirmado**: los 26 archivos de código muerto, `SUBCATEGORY_MAP`, el pack 1 repetido, los 7 `innerWidth`, los 11 overlays y el `$executeRawUnsafe` del backend local (`place-change-request.service.js:372`).
- **Corregido**: "cero tests en el front" es inexacto (hay 11 pruebas en un archivo). El backend local no tiene ninguna prueba, aunque la auditoría menciona una. Tampoco existe CI en ninguno de los dos repos.
- **Nuevo**: el front llama 59 endpoints que el backend local no tiene. Ver [Discrepancias](/referencia/discrepancias/).
- **Nuevo**: el formulario ignora `availableForUpload`, así que el toggle del admin no le afecta.

Detalle en la [auditoría complementaria](/auditoria/complementaria/) y en el [backend · problemas conocidos](/backend/problemas/).
