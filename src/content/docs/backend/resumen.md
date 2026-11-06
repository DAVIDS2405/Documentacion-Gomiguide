---
title: Backend · resumen y arranque
description: Qué es el backend de GomiGuide, con qué está hecho, cómo correrlo y qué variables necesita.
---

## Qué es

API REST en Express que sirve a la app pública (mapa, formulario, países) y al panel admin. Los datos viven en PostgreSQL con PostGIS (la ubicación de cada lugar es una columna `geography`). Las sesiones las valida Stack Auth.

## Stack

| Área | Tecnología | Versión (`package.json`) |
|---|---|---|
| Runtime | Node.js | (sin `engines`; el despliegue usa `@vercel/node`) |
| HTTP | Express | ^4.18.2 |
| Seguridad y utilidades | helmet, cors, morgan (solo en desarrollo), dotenv | ^7.1 · ^2.8 · ^1.10 · ^16.3 |
| Base de datos | Prisma (cliente y CLI) | ^5.22.0 |
| Validación | Zod | ^3.23.8 |
| Archivos | @aws-sdk/client-s3 | ^3.994.0 |
| Auth | Stack Auth (REST) | — |
| Despliegue | Vercel (`vercel.json` → `src/index.js`) | — |

Gestor de paquetes: **npm** (hay `package-lock.json`; el `.gitignore` lo deja versionado a propósito).

## Ramas y estado del código

| Rama | Último commit | Nota |
|---|---|---|
| `main` | `881a7bf` "sync wifi" | Mismas rutas que `develop` |
| `develop` | `881a7bf` "sync wifi" | — |
| `feat/feedback-survey-api` (activa en la copia local) | `b2d5179` "add feedback survey table, public POST and admin GET" | Agrega la encuesta |

Ninguna rama contiene rutas de países admin, zonas, taxonomía, propiedades, landings ni CSV. Ver [Qué le falta al backend](/backend/faltantes/).

## Cómo correrlo

```bash
cd gomiguide-backend
cp .env.example .env          # completar
npm install                   # postinstall ejecuta prisma generate
npm run dev                   # nodemon src/index.js
```

Scripts útiles:

| Script | Qué hace |
|---|---|
| `npm run prisma:push` | Empuja el esquema a la base (sin migraciones) |
| `npm run prisma:migrate` | Crea o aplica migraciones |
| `npm run prisma:seed` | `node prisma/seed.js` |
| `npm run prisma:studio` | Interfaz de la base |
| `npm test` | **No hay pruebas**: el script sale con error a propósito |

Health check: `GET /health`. Raíz de la API: `GET /api` (lista de endpoints; desactualizada).

## Variables de entorno

Nombres tomados de `.env.example` (los valores no se documentan aquí):

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | PostgreSQL (con parámetros de pooler si es Neon) |
| `PORT`, `NODE_ENV` | Servidor. En producción no escucha: lo hace Vercel |
| `BULK_UPLOAD_MAX_PLACES` | Límite de la carga masiva |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_S3_REGION` | Imágenes en S3 |
| `STACK_AUTH_PROJECT_ID`, `STACK_SECRET_SERVER_KEY` | Validación de sesiones |

`.env` **no** está en git (verificado). Hay dos plantillas, `.env.example` y `env.example`; conviene dejar una.

## Dónde está todo

| Qué | Dónde |
|---|---|
| Arranque | `src/index.js` (escucha en local) · `src/app.js` (middlewares y montaje) |
| Rutas | `src/routes/index.js` → `src/routes/v1/index.js` → un archivo por dominio · `src/routes/v1/admin/` |
| Controladores | `src/controllers/*.js` (9 archivos) |
| Servicios (lógica) | `src/services/*.js` (ver [arquitectura](/backend/arquitectura/)) |
| Validadores | `src/validators/*.js` (Zod) |
| Middlewares | `src/middlewares/auth.js`, `validate.js`, `errorHandler.js` |
| Utilidades | `src/utils/response.js`, `src/utils/errors.js` |
| Cliente Prisma | `src/config/prisma.js` |
| Esquema y seeds | `prisma/schema.prisma`, `prisma/migrations/` (2 carpetas), `prisma/seed*.js` (10 scripts) |
| Documentación vieja | `API_DOCUMENTATION.md` (solo cubre países y categorías) |
| Colección de Postman | `postman_collection.json`, `postman_environment_{dev,prod}.json` |
