# Documentacion-Gomiguide

# GomiGuide · documentación técnica

Sitio de documentación con Astro + Starlight. Cubre frontend, backend, auditorías y plan de refactorización.

## Comandos

```bash
pnpm install
pnpm dev                                   # http://localhost:4321
pnpm build                                 # genera dist/
FRONT=/ruta/gomiguide-frontend BACK=/ruta/gomiguide-backend pnpm gen   # regenera las páginas (generado)
pnpm sync                                  # copia auditorías y plan desde DOCS_SRC (por defecto ~/Downloads)
```

## Qué es generado y qué es a mano

| Ruta | Origen |
|---|---|
| `src/content/docs/referencia/*.md` | Generado por `scripts/generate-reference.cjs` desde el código del front y del back. No editar. |
| `src/content/docs/auditoria/complementaria.md`, `refactor/plan.md` | Copia de los documentos de `DOCS_SRC`. Editar el original y ejecutar `pnpm sync`. |
| `src/content/docs/front/*`, `backend/*`, `auditoria/original.md`, `index.md` | Escritos a mano. |
| `public/docs/auditoria-original.pdf` | Copia del PDF original. |

## Limitaciones del generador

- Reconoce llamadas `apiRequest(...)` y `fetch(...)` con plantillas simples. Una ruta construida de forma muy dinámica puede salir mal; revisar `front-apis.md` tras cambios grandes en `src/lib/api.ts`.
- Las rutas del backend salen de `router.get|post|put|patch|delete("…")` con sus prefijos de montaje. Rutas montadas con variables o funciones no se detectan.
- El modelo de datos se lee con expresiones regulares sobre `schema.prisma`.
