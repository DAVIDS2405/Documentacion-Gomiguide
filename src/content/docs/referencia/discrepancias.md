---
title: Discrepancias front ↔ backend
description: Llamadas del front que el backend local no expone y rutas del backend que nadie llama.
---

> Página generada por `scripts/generate-reference.cjs`. No editar a mano.

El front hace **88** llamadas; **59** no tienen ruta en el backend local (`gomiguide-backend`).

## Dominio `properties` (18)

| Función | HTTP | Ruta |
|---|---|---|
| `copyPropertyConfigs` | POST | `/api/v1/admin/properties/configs/copy` |
| `createFieldGroup` | POST | `/api/v1/admin/properties/groups` |
| `createPropertyConfig` | POST | `/api/v1/admin/properties/configs` |
| `createPropertyDefinition` | POST | `/api/v1/admin/properties/definitions` |
| `deleteFieldGroup` | DELETE | `/api/v1/admin/properties/groups/:id` |
| `deletePropertyConfig` | DELETE | `/api/v1/admin/properties/configs/:id` |
| `deletePropertyDefinition` | DELETE | `/api/v1/admin/properties/definitions/:id` |
| `getAdminFormSchema` | GET | `/api/v1/admin/properties/form-schema` |
| `getFieldGroups` | GET | `/api/v1/admin/properties/groups` |
| `getPropertyConfigs` | GET | `/api/v1/admin/properties/configs` |
| `getPropertyConfigsSummary` | GET | `/api/v1/admin/properties/configs/summary` |
| `getPropertyDefinition` | GET | `/api/v1/admin/properties/definitions/:id` |
| `getPropertyDefinitions` | GET | `/api/v1/admin/properties/definitions` |
| `reorderFieldGroups` | PATCH | `/api/v1/admin/properties/groups/reorder` |
| `reorderPropertyConfigs` | PATCH | `/api/v1/admin/properties/configs/reorder` |
| `updateFieldGroup` | PATCH | `/api/v1/admin/properties/groups/:id` |
| `updatePropertyConfig` | PATCH | `/api/v1/admin/properties/configs/:id` |
| `updatePropertyDefinition` | PATCH | `/api/v1/admin/properties/definitions/:id` |

## Dominio `taxonomy` (15)

| Función | HTTP | Ruta |
|---|---|---|
| `createTaxonomyCategory` | POST | `/api/v1/admin/taxonomy/categories` |
| `createTaxonomySubcategory` | POST | `/api/v1/admin/taxonomy/subcategories` |
| `deleteTaxonomyCategory` | DELETE | `/api/v1/admin/taxonomy/categories/:id` |
| `deleteTaxonomySubcategory` | DELETE | `/api/v1/admin/taxonomy/subcategories/:id` |
| `getTaxonomyAdmin` | GET | `/api/v1/admin/taxonomy` |
| `getTaxonomyCategoryZones` | GET | `/api/v1/admin/taxonomy/categories/:id/zones` |
| `getTaxonomySubcategoryZones` | GET | `/api/v1/admin/taxonomy/subcategories/:id/zones` |
| `reorderTaxonomyCategories` | PATCH | `/api/v1/admin/taxonomy/categories/reorder` |
| `reorderTaxonomySubcategories` | PATCH | `/api/v1/admin/taxonomy/subcategories/reorder` |
| `setTaxonomyCategoryZones` | PUT | `/api/v1/admin/taxonomy/categories/:id/zones` |
| `setTaxonomySubcategoryZones` | PUT | `/api/v1/admin/taxonomy/subcategories/:id/zones` |
| `updateTaxonomyCategory` | PATCH | `/api/v1/admin/taxonomy/categories/:id` |
| `updateTaxonomyCategoryStatus` | PATCH | `/api/v1/admin/taxonomy/categories/:id/status` |
| `updateTaxonomySubcategory` | PATCH | `/api/v1/admin/taxonomy/subcategories/:id` |
| `updateTaxonomySubcategoryStatus` | PATCH | `/api/v1/admin/taxonomy/subcategories/:id/status` |

## Dominio `countries` (13)

| Función | HTTP | Ruta |
|---|---|---|
| `createCountry` | POST | `/api/v1/admin/countries` |
| `createCountryZone` | POST | `/api/v1/admin/countries/:id/zones` |
| `deleteCountry` | DELETE | `/api/v1/admin/countries/:id` |
| `deleteCountryLanding` | DELETE | `/api/v1/admin/countries/:id/landings/:id` |
| `getCountriesAdmin` | GET | `/api/v1/admin/countries` |
| `getCountryAdmin` | GET | `/api/v1/admin/countries/:id` |
| `getPublicCountryLanding` | GET | `/api/v1/countries/:iso/landing` |
| `reorderCountries` | PATCH | `/api/v1/admin/countries/reorder` |
| `updateCountry` | PATCH | `/api/v1/admin/countries/:id` |
| `updateCountryStatus` | PATCH | `/api/v1/admin/countries/:id/status` |
| `updateCountryZoneStatus` | PATCH | `/api/v1/admin/countries/:id/zones/:packId/status` |
| `uploadCountryFlag` | POST | `/api/v1/admin/countries/:id/flag` |
| `upsertCountryLanding` | PUT | `/api/v1/admin/countries/:id/landings/:id` |

## Dominio `zones` (7)

| Función | HTTP | Ruta |
|---|---|---|
| `createZone` | POST | `/api/v1/admin/zones` |
| `deleteZone` | DELETE | `/api/v1/admin/zones/:id` |
| `getZoneAdmin` | GET | `/api/v1/admin/zones/:id` |
| `getZonesAdmin` | GET | `/api/v1/admin/zones` |
| `updateZone` | PATCH | `/api/v1/admin/zones/:id` |
| `updateZoneStatus` | PATCH | `/api/v1/admin/zones/:id/status` |
| `uploadZoneCover` | POST | `/api/v1/admin/zones/:id/cover` |

## Dominio `places` (4)

| Función | HTTP | Ruta |
|---|---|---|
| `createPlaceAdmin` | POST | `/api/v1/admin/places` |
| `downloadCsvTemplate` | GET | `/api/v1/admin/places/csv-template` |
| `getCsvTemplateInfo` | GET | `/api/v1/admin/places/csv-template-info` |
| `importCsv` | POST | `/api/v1/admin/places/csv-import` |

## Dominio `packs` (2)

| Función | HTTP | Ruta |
|---|---|---|
| `fetchCardSchema` | GET | `/api/v1/packs/:packId/card-schema` |
| `getPacks` | GET | `/api/v1/packs` |

## Rutas del backend sin consumidor en el front

| HTTP | Ruta |
|---|---|
| GET | `/api/v1/admin/feedback` |
| GET | `/api/v1/categories/:id` |
| GET | `/api/v1/categories/:id/subcategories` |
| GET | `/api/v1/countries/:id` |
| POST | `/api/v1/place-change-requests` |
| GET | `/api/v1/places/:id` |
| GET | `/api/v1/places/banks` |
| POST | `/api/v1/places/bulk` |
