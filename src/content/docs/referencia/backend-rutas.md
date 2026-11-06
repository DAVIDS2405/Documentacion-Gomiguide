---
title: Rutas del backend
description: Endpoints Express del backend local, con su auth y el archivo que los define.
---

> Página generada por `scripts/generate-reference.cjs`. No editar a mano.

Total: **40** rutas. Las que el front no llama: **8**.

| Método | Ruta | Auth | Handler | Archivo | ¿Lo usa el front? |
|---|---|---|---|---|---|
| GET | `/api/v1` | público | `` | `src/routes/v1/index.js` | no |
| GET | `/api/v1/admin` | público | `` | `src/routes/v1/admin/index.js` | no |
| GET | `/api/v1/admin/feedback` | admin | `feedbackController.list` | `src/routes/v1/admin/feedback.routes.js` | no |
| GET | `/api/v1/admin/place-change-requests` | admin | `placeChangeRequestController.list` | `src/routes/v1/admin/place-change-requests.routes.js` | sí |
| GET | `/api/v1/admin/place-change-requests/:id` | admin | `placeChangeRequestController.getById` | `src/routes/v1/admin/place-change-requests.routes.js` | sí |
| PATCH | `/api/v1/admin/place-change-requests/:id/approve` | admin | `placeChangeRequestController.approve` | `src/routes/v1/admin/place-change-requests.routes.js` | sí |
| PATCH | `/api/v1/admin/place-change-requests/:id/reject` | admin | `placeChangeRequestController.reject` | `src/routes/v1/admin/place-change-requests.routes.js` | sí |
| GET | `/api/v1/admin/places` | admin | `adminPlacesController.list` | `src/routes/v1/admin/places.routes.js` | sí |
| DELETE | `/api/v1/admin/places/:id` | admin | `adminPlacesController.delete` | `src/routes/v1/admin/places.routes.js` | sí |
| GET | `/api/v1/admin/places/:id` | admin | `adminPlacesController.getById` | `src/routes/v1/admin/places.routes.js` | sí |
| PATCH | `/api/v1/admin/places/:id` | admin | `adminPlacesController.update` | `src/routes/v1/admin/places.routes.js` | sí |
| DELETE | `/api/v1/admin/places/:id/image` | admin | `adminPlacesController.deleteImage` | `src/routes/v1/admin/places.routes.js` | sí |
| POST | `/api/v1/admin/places/:id/image` | admin | `adminPlacesController.uploadImage` | `src/routes/v1/admin/places.routes.js` | sí |
| PATCH | `/api/v1/admin/places/:id/status` | admin | `adminPlacesController.updateStatus` | `src/routes/v1/admin/places.routes.js` | sí |
| GET | `/api/v1/admin/places/stats` | admin | `adminPlacesController.getStats` | `src/routes/v1/admin/places.routes.js` | sí |
| POST | `/api/v1/admin/sync/wifi` | admin | `wifiSyncController.triggerSync` | `src/routes/v1/admin/sync.routes.js` | sí |
| GET | `/api/v1/admin/sync/wifi/status` | admin | `wifiSyncController.getStatus` | `src/routes/v1/admin/sync.routes.js` | sí |
| GET | `/api/v1/admin/users` | admin | `userController.list` | `src/routes/v1/admin/users.routes.js` | sí |
| POST | `/api/v1/admin/users` | admin | `userController.create` | `src/routes/v1/admin/users.routes.js` | sí |
| DELETE | `/api/v1/admin/users/:id` | admin | `userController.delete` | `src/routes/v1/admin/users.routes.js` | sí |
| GET | `/api/v1/admin/users/:id` | admin | `userController.getById` | `src/routes/v1/admin/users.routes.js` | sí |
| PATCH | `/api/v1/admin/users/:id/role` | admin | `userController.updateRole` | `src/routes/v1/admin/users.routes.js` | sí |
| PATCH | `/api/v1/admin/users/:id/status` | admin | `userController.updateStatus` | `src/routes/v1/admin/users.routes.js` | sí |
| GET | `/api/v1/admin/users/roles` | admin | `userController.getRoles` | `src/routes/v1/admin/users.routes.js` | sí |
| GET | `/api/v1/categories` | público | `categoryController.getAll` | `src/routes/v1/categories.routes.js` | sí |
| GET | `/api/v1/categories/:id` | público | `categoryController.getById` | `src/routes/v1/categories.routes.js` | no |
| GET | `/api/v1/categories/:id/subcategories` | público | `categoryController.getSubcategories` | `src/routes/v1/categories.routes.js` | no |
| GET | `/api/v1/countries` | público | `countryController.getAll` | `src/routes/v1/countries.routes.js` | sí |
| GET | `/api/v1/countries/:id` | público | `countryController.getById` | `src/routes/v1/countries.routes.js` | no |
| POST | `/api/v1/feedback` | público | `feedbackController.create` | `src/routes/v1/feedback.routes.js` | sí |
| GET | `/api/v1/me` | usuario | `authController.getMe` | `src/routes/v1/auth.routes.js` | sí |
| GET | `/api/v1/packs/:packId/catalog` | público | `packController.getCatalog` | `src/routes/v1/packs.routes.js` | sí |
| GET | `/api/v1/packs/:packId/subcategories/:subcategoryId/form-schema` | público | `packController.getFormSchema` | `src/routes/v1/packs.routes.js` | sí |
| POST | `/api/v1/place-change-requests` | público | `placeChangeRequestController.create` | `src/routes/v1/place-change-requests.routes.js` | no |
| GET | `/api/v1/places` | público | `placeController.getPlaces` | `src/routes/v1/places.routes.js` | sí |
| GET | `/api/v1/places/:id` | público | `placeController.getPlaceById` | `src/routes/v1/places.routes.js` | no |
| GET | `/api/v1/places/banks` | público | `placeController.getBanks` | `src/routes/v1/places.routes.js` | no |
| POST | `/api/v1/places/bulk` | público | `placeController.bulkSavePlaces` | `src/routes/v1/places.routes.js` | no |
| POST | `/api/v1/places/save` | público | `placeController.savePlace` | `src/routes/v1/places.routes.js` | sí |
| GET | `/health` | público | `inline` | `src/app.js` | no |
