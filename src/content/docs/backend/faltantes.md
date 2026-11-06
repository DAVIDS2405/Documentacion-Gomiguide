---
title: Backend · qué le falta para lo que pide el front
description: Endpoints que el front ya llama y el backend local no tiene, agrupados por dominio, con lo que hay que construir.
---

El front hace **88** llamadas. **59** no tienen ruta en el backend local. La lista exacta está en [Discrepancias](/referencia/discrepancias/); aquí se agrupa por lo que hay que construir.

## Prioridad 1: lo que rompe la app pública

| Falta | Quién lo pide | Efecto si falta |
|---|---|---|
| `GET /api/v1/countries/:iso/landing` | `app/[locale]/[country]/page.tsx` | Todas las landings de país responden 404 |
| `GET /api/v1/packs` (lista con `boundary`) | mapa, formulario, selector de CSV, páginas de texto | El mapa usa `map_zones.json` y el formulario no tiene opciones de pack |
| `GET /api/v1/packs/:id/card-schema` | `lib/places-api.ts` (`fetchCardSchema`) | Las tarjetas del mapa no tienen campos |

## Prioridad 2: el panel admin

| Dominio | Llamadas que faltan | Pantallas afectadas |
|---|---|---|
| Países | 12 (lista, detalle, crear, editar, estado, bandera, orden, zonas del país, landing) | Admin → Países |
| Zonas | 7 (lista, detalle, crear, editar, estado, portada, borrar) | Admin → Zonas |
| Taxonomía | 15 (categorías y subcategorías: crear, editar, estado, borrar, orden; zonas por categoría) | Admin → Taxonomía; también el selector de categorías del alta de lugares |
| Propiedades y formularios | 18 (definiciones, grupos, configuración por subcategoría, copia, resumen, vista previa del formulario) | Admin → Propiedades |
| CSV | 3 (plantilla, información de plantilla, importación) | Admin → Carga CSV |
| Alta admin de lugar | 1 (`POST /admin/places`) | Admin → Lugares → Nuevo |

El front no solo consume estas rutas: la [arquitectura propuesta](/refactor/plan/) las trata como módulos del backend (`zones`, `taxonomy`, `properties`, `countries`, `csv-import`). Hoy el modelo de datos tampoco tiene tabla de zonas: el front llama "zona" a lo que el backend llama `Pack`.

## Prioridad 3: lo que existe y nadie usa

Estas rutas están en el backend y el front no las llama. Son candidatas a borrar o a conectar:

| Ruta | Comentario |
|---|---|
| `GET /api/v1/places/banks` | Lista de bancos; la auditoría original la marcó como sin uso |
| `POST /api/v1/places/bulk` | Carga masiva por JSON; el front usa CSV en otra ruta |
| `POST /api/v1/place-change-requests` | El front envía a `/places/save`; esta ruta queda sin consumidor |
| `GET /api/v1/admin/feedback` | La encuesta se guarda, pero no hay pantalla para leerla |
| `GET /api/v1/categories/:id`, `GET /api/v1/categories/:id/subcategories` | Sin consumidor |
| `GET /api/v1/countries/:id` | Sin consumidor (el front usa `/countries` y la landing) |
| `GET /api/v1/places/:id` | Sin consumidor en el mapa público |

## Antes de construir: confirmar la versión

Hay que confirmar si el backend desplegado tiene estas rutas. Si existen en otra rama o en otro repositorio, este documento debe apuntar a esa fuente. Si no existen, la app admin no funciona en ningún entorno que use este repositorio.

Comprobación rápida:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$NEXT_PUBLIC_BACKEND_URL/api/v1/admin/zones"
curl -s -o /dev/null -w "%{http_code}\n" "$NEXT_PUBLIC_BACKEND_URL/api/v1/countries/ecu/landing?lang=es"
```

Un `404` confirma la falta.
