---
title: APIs que usa el front
description: Cada llamada del front al backend, con su estado en el backend local.
---

> Página generada por `scripts/generate-reference.cjs`. No editar a mano.

Total: **88** llamadas. Existen en el backend local: **29**. No existen: **59**.

| Función del front | HTTP | Ruta | Auth | En backend local | Pantallas (ruta) | Archivo |
|---|---|---|---|---|---|---|
| `copyPropertyConfigs` | POST | `/api/v1/admin/properties/configs/copy` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/CopyConfigsModal.tsx |
| `createCountry` | POST | `/api/v1/admin/countries` | Bearer (admin) | ❌ no | /{locale}/admin/countries/new | src/views/Admin/Countries/CountryCreatePage.tsx |
| `createCountryZone` | POST | `/api/v1/admin/countries/:id/zones` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id] | src/views/Admin/Countries/components/NewZoneModal.tsx |
| `createFieldGroup` | POST | `/api/v1/admin/properties/groups` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/FieldGroupFormModal.tsx |
| `createPlaceAdmin` | POST | `/api/v1/admin/places` | Bearer (admin) | ❌ no | /{locale}/admin/places-management/new | src/views/Admin/Places/PlaceCreatePage.tsx |
| `createPropertyConfig` | POST | `/api/v1/admin/properties/configs` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/ConfigFormModal.tsx |
| `createPropertyDefinition` | POST | `/api/v1/admin/properties/definitions` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/DefinitionFormModal.tsx |
| `createTaxonomyCategory` | POST | `/api/v1/admin/taxonomy/categories` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/components/CategoryFormModal.tsx |
| `createTaxonomySubcategory` | POST | `/api/v1/admin/taxonomy/subcategories` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/components/SubcategoryFormModal.tsx |
| `createZone` | POST | `/api/v1/admin/zones` | Bearer (admin) | ❌ no | /{locale}/admin/zones/new | src/views/Admin/Zones/ZoneCreatePage.tsx |
| `deleteCountry` | DELETE | `/api/v1/admin/countries/:id` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id] | src/views/Admin/Countries/CountryDetailPage.tsx |
| `deleteCountryLanding` | DELETE | `/api/v1/admin/countries/:id/landings/:id` | Bearer (admin) | ❌ no | — | — |
| `deleteFieldGroup` | DELETE | `/api/v1/admin/properties/groups/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/GroupsTab.tsx |
| `deletePropertyConfig` | DELETE | `/api/v1/admin/properties/configs/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/FormsTab.tsx |
| `deletePropertyDefinition` | DELETE | `/api/v1/admin/properties/definitions/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/CatalogTab.tsx |
| `deleteTaxonomyCategory` | DELETE | `/api/v1/admin/taxonomy/categories/:id` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `deleteTaxonomySubcategory` | DELETE | `/api/v1/admin/taxonomy/subcategories/:id` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `deleteZone` | DELETE | `/api/v1/admin/zones/:id` | Bearer (admin) | ❌ no | /{locale}/admin/zones/[id] | src/views/Admin/Zones/ZoneDetailPage.tsx |
| `downloadCsvTemplate` | GET | `/api/v1/admin/places/csv-template` | público | ❌ no | /{locale}/admin/csv-upload | src/components/admin/CsvUploadPanel.tsx |
| `fetchCardSchema` | GET | `/api/v1/packs/:packId/card-schema` | público | ❌ no | /{locale}/form, /{locale}/map | src/lib/places-api.ts |
| `getAdminFormSchema` | GET | `/api/v1/admin/properties/form-schema` | Bearer (admin) | ❌ no | /{locale}/admin/places-management/new, /{locale}/admin/places-management, /{locale}/admin/properties | src/components/admin/PlaceEditModal.tsx<br>src/views/Admin/Places/PlaceCreatePage.tsx |
| `getCountriesAdmin` | GET | `/api/v1/admin/countries` | Bearer (admin) | ❌ no | /{locale}/admin/countries, /{locale}/admin/places-management/new, /{locale}/admin/zones/new | src/views/Admin/Countries/CountriesListPage.tsx<br>src/views/Admin/Places/PlaceCreatePage.tsx |
| `getCountryAdmin` | GET | `/api/v1/admin/countries/:id` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id] | src/views/Admin/Countries/CountryDetailPage.tsx |
| `getCsvTemplateInfo` | GET | `/api/v1/admin/places/csv-template-info` | Bearer (admin) | ❌ no | /{locale}/admin/csv-upload | src/components/admin/CsvUploadPanel.tsx |
| `getFieldGroups` | GET | `/api/v1/admin/properties/groups` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/PropertiesPage.tsx |
| `getPacks` | GET | `/api/v1/packs` | público | ❌ no | /{locale}/[country]/[zone], /{locale}/[country], /{locale}/admin/csv-upload, /{locale}/forgot-password, /{locale}/form, /{locale}/login, /{locale}/map, /{locale}/privacy-policy, /{locale}/report, /{locale}/reset-password, /{locale}/terms | src/app/[locale]/[country]/[zone]/page.tsx<br>src/app/[locale]/[country]/page.tsx |
| `getPropertyConfigs` | GET | `/api/v1/admin/properties/configs` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/FormsTab.tsx |
| `getPropertyConfigsSummary` | GET | `/api/v1/admin/properties/configs/summary` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/PropertiesPage.tsx |
| `getPropertyDefinition` | GET | `/api/v1/admin/properties/definitions/:id` | Bearer (admin) | ❌ no | — | — |
| `getPropertyDefinitions` | GET | `/api/v1/admin/properties/definitions` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/PropertiesPage.tsx |
| `getPublicCountryLanding` | GET | `/api/v1/countries/:iso/landing` | público | ❌ no | /{locale}/[country] | src/app/[locale]/[country]/page.tsx |
| `getTaxonomyAdmin` | GET | `/api/v1/admin/taxonomy` | Bearer (admin) | ❌ no | /{locale}/admin/places-management/new, /{locale}/admin/places-management, /{locale}/admin/properties, /{locale}/admin/taxonomy | src/views/Admin/Places/PlaceCreatePage.tsx<br>src/views/Admin/PlacesManagementPage.tsx |
| `getTaxonomyCategoryZones` | GET | `/api/v1/admin/taxonomy/categories/:id/zones` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/components/CategoryFormModal.tsx |
| `getTaxonomySubcategoryZones` | GET | `/api/v1/admin/taxonomy/subcategories/:id/zones` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/components/SubcategoryFormModal.tsx |
| `getZoneAdmin` | GET | `/api/v1/admin/zones/:id` | Bearer (admin) | ❌ no | /{locale}/admin/places-management/new, /{locale}/admin/places-management, /{locale}/admin/zones/[id] | src/views/Admin/Places/PlaceCreatePage.tsx<br>src/views/Admin/PlacesManagementPage.tsx |
| `getZonesAdmin` | GET | `/api/v1/admin/zones` | Bearer (admin) | ❌ no | /{locale}/admin/places-management/new, /{locale}/admin/properties, /{locale}/admin/taxonomy, /{locale}/admin/zones | src/views/Admin/Places/PlaceCreatePage.tsx<br>src/views/Admin/Properties/PropertiesPage.tsx |
| `importCsv` | POST | `/api/v1/admin/places/csv-import` | público | ❌ no | /{locale}/admin/csv-upload | src/components/admin/CsvUploadPanel.tsx |
| `reorderCountries` | PATCH | `/api/v1/admin/countries/reorder` | Bearer (admin) | ❌ no | /{locale}/admin/countries | src/views/Admin/Countries/CountriesListPage.tsx |
| `reorderFieldGroups` | PATCH | `/api/v1/admin/properties/groups/reorder` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/GroupsTab.tsx |
| `reorderPropertyConfigs` | PATCH | `/api/v1/admin/properties/configs/reorder` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/FormsTab.tsx |
| `reorderTaxonomyCategories` | PATCH | `/api/v1/admin/taxonomy/categories/reorder` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `reorderTaxonomySubcategories` | PATCH | `/api/v1/admin/taxonomy/subcategories/reorder` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `setTaxonomyCategoryZones` | PUT | `/api/v1/admin/taxonomy/categories/:id/zones` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx<br>src/views/Admin/Taxonomy/components/CategoryFormModal.tsx |
| `setTaxonomySubcategoryZones` | PUT | `/api/v1/admin/taxonomy/subcategories/:id/zones` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx<br>src/views/Admin/Taxonomy/components/SubcategoryFormModal.tsx |
| `updateCountry` | PATCH | `/api/v1/admin/countries/:id` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id] | src/views/Admin/Countries/CountryDetailPage.tsx |
| `updateCountryStatus` | PATCH | `/api/v1/admin/countries/:id/status` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id], /{locale}/admin/countries | src/views/Admin/Countries/CountriesListPage.tsx<br>src/views/Admin/Countries/CountryDetailPage.tsx |
| `updateCountryZoneStatus` | PATCH | `/api/v1/admin/countries/:id/zones/:packId/status` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id] | src/views/Admin/Countries/CountryDetailPage.tsx |
| `updateFieldGroup` | PATCH | `/api/v1/admin/properties/groups/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/FieldGroupFormModal.tsx |
| `updatePropertyConfig` | PATCH | `/api/v1/admin/properties/configs/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/ConfigFormModal.tsx<br>src/views/Admin/Properties/components/FormsTab.tsx |
| `updatePropertyDefinition` | PATCH | `/api/v1/admin/properties/definitions/:id` | Bearer (admin) | ❌ no | /{locale}/admin/properties | src/views/Admin/Properties/components/DefinitionFormModal.tsx |
| `updateTaxonomyCategory` | PATCH | `/api/v1/admin/taxonomy/categories/:id` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/components/CategoryFormModal.tsx |
| `updateTaxonomyCategoryStatus` | PATCH | `/api/v1/admin/taxonomy/categories/:id/status` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `updateTaxonomySubcategory` | PATCH | `/api/v1/admin/taxonomy/subcategories/:id` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx<br>src/views/Admin/Taxonomy/components/SubcategoryFormModal.tsx |
| `updateTaxonomySubcategoryStatus` | PATCH | `/api/v1/admin/taxonomy/subcategories/:id/status` | Bearer (admin) | ❌ no | /{locale}/admin/taxonomy | src/views/Admin/Taxonomy/TaxonomyPage.tsx |
| `updateZone` | PATCH | `/api/v1/admin/zones/:id` | Bearer (admin) | ❌ no | /{locale}/admin/zones/[id] | src/views/Admin/Zones/ZoneDetailPage.tsx |
| `updateZoneStatus` | PATCH | `/api/v1/admin/zones/:id/status` | Bearer (admin) | ❌ no | /{locale}/admin/zones/[id], /{locale}/admin/zones | src/views/Admin/Zones/ZoneDetailPage.tsx<br>src/views/Admin/Zones/ZonesListPage.tsx |
| `uploadCountryFlag` | POST | `/api/v1/admin/countries/:id/flag` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id], /{locale}/admin/countries/new | src/views/Admin/Countries/CountryCreatePage.tsx<br>src/views/Admin/Countries/CountryDetailPage.tsx |
| `uploadZoneCover` | POST | `/api/v1/admin/zones/:id/cover` | Bearer (admin) | ❌ no | /{locale}/admin/zones/[id], /{locale}/admin/zones/new | src/views/Admin/Zones/ZoneCreatePage.tsx<br>src/views/Admin/Zones/ZoneDetailPage.tsx |
| `upsertCountryLanding` | PUT | `/api/v1/admin/countries/:id/landings/:id` | Bearer (admin) | ❌ no | /{locale}/admin/countries/[id], /{locale}/admin/countries/new | src/views/Admin/Countries/CountryCreatePage.tsx<br>src/views/Admin/Countries/CountryDetailPage.tsx |
| `approveRequest` | PATCH | `/api/v1/admin/place-change-requests/:id/approve` | Bearer (admin) | ✅ sí | /{locale}/admin/places/[id], /{locale}/admin/places | src/views/Admin/PlaceDetailPage.tsx<br>src/views/Admin/PlacesListPage.tsx |
| `createUser` | POST | `/api/v1/admin/users` | Bearer (admin) | ✅ sí | /{locale}/admin/users | src/components/admin/CreateUserModal.tsx |
| `deletePlace` | DELETE | `/api/v1/admin/places/:id` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/views/Admin/PlacesManagementPage.tsx |
| `deletePlaceImage` | DELETE | `/api/v1/admin/places/:id/image` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/components/admin/PlaceEditModal.tsx |
| `deleteUser` | DELETE | `/api/v1/admin/users/:id` | Bearer (admin) | ✅ sí | /{locale}/admin/users | src/views/Admin/UsersListPage.tsx |
| `fetchCategories` | GET | `/api/v1/categories` | público | ✅ sí | /{locale}/map | src/views/MapPage/sections/SideBar/hooks/useSubcategories.ts |
| `fetchPlaces` | GET | `/api/v1/places` | público | ✅ sí | /{locale}/form, /{locale}/map | src/lib/places-api.ts |
| `getFormSchema` | GET | `/api/v1/packs/:packId/subcategories/:subcategoryId/form-schema` | público | ✅ sí | /{locale}/form | src/hooks/useFormSchema.ts |
| `getMe` | GET | `/api/v1/me` | Bearer (admin) | ✅ sí | /{locale}/admin/countries/[id], /{locale}/admin/countries/new, /{locale}/admin/countries, /{locale}/admin/csv-upload, /{locale}/admin, /{locale}/admin/places/[id], /{locale}/admin/places, /{locale}/admin/places-management/new, /{locale}/admin/places-management, /{locale}/admin/properties, /{locale}/admin/sync/wifi, /{locale}/admin/taxonomy, /{locale}/admin/users, /{locale}/admin/zones/[id], /{locale}/admin/zones/new, /{locale}/admin/zones | src/hooks/useAuth.ts |
| `getPackCatalog` | GET | `/api/v1/packs/:packId/catalog` | público | ✅ sí | /{locale}/admin/csv-upload | src/components/admin/CsvUploadPanel.tsx |
| `getPlace` | GET | `/api/v1/admin/places/:id` | Bearer (admin) | ✅ sí | — | — |
| `getPlaceRequest` | GET | `/api/v1/admin/place-change-requests/:id` | Bearer (admin) | ✅ sí | /{locale}/admin/places/[id] | src/views/Admin/PlaceDetailPage.tsx |
| `getPlaceRequests` | GET | `/api/v1/admin/place-change-requests` | Bearer (admin) | ✅ sí | /{locale}/admin, /{locale}/admin/places | src/views/Admin/DashboardPage.tsx<br>src/views/Admin/PlacesListPage.tsx |
| `getPlaces` | GET | `/api/v1/admin/places` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/views/Admin/PlacesManagementPage.tsx |
| `getPlacesStats` | GET | `/api/v1/admin/places/stats` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/views/Admin/PlacesManagementPage.tsx |
| `getPublicCountries` | GET | `/api/v1/countries` | público | ✅ sí | /{locale}, /{locale}/pre-home | src/views/PreHomePage/sections/CountriesSection.tsx |
| `getRoles` | GET | `/api/v1/admin/users/roles` | Bearer (admin) | ✅ sí | /{locale}/admin/users | src/components/admin/CreateUserModal.tsx<br>src/views/Admin/UsersListPage.tsx |
| `getUser` | GET | `/api/v1/admin/users/:id` | Bearer (admin) | ✅ sí | — | — |
| `getUsers` | GET | `/api/v1/admin/users` | Bearer (admin) | ✅ sí | /{locale}/admin, /{locale}/admin/users | src/views/Admin/DashboardPage.tsx<br>src/views/Admin/UsersListPage.tsx |
| `getWifiSyncStatus` | GET | `/api/v1/admin/sync/wifi/status` | Bearer (admin) | ✅ sí | /{locale}/admin/sync/wifi | src/components/admin/WifiSyncPanel.tsx |
| `rejectRequest` | PATCH | `/api/v1/admin/place-change-requests/:id/reject` | Bearer (admin) | ✅ sí | /{locale}/admin/places/[id], /{locale}/admin/places | src/views/Admin/PlaceDetailPage.tsx<br>src/views/Admin/PlacesListPage.tsx |
| `submitFeedback` | POST | `/api/v1/feedback` | público | ✅ sí | — | — |
| `submitPlace` | POST | `/api/v1/places/save` | público | ✅ sí | /{locale}/form | src/hooks/useSubmitPlace.ts<br>src/views/FormPage/sections/hooks/useFormSubmission.tsx |
| `triggerWifiSync` | POST | `/api/v1/admin/sync/wifi` | Bearer (admin) | ✅ sí | /{locale}/admin/sync/wifi | src/components/admin/WifiSyncPanel.tsx |
| `updatePlace` | PATCH | `/api/v1/admin/places/:id` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/components/admin/PlaceEditModal.tsx |
| `updatePlaceStatus` | PATCH | `/api/v1/admin/places/:id/status` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/views/Admin/PlacesManagementPage.tsx |
| `updateUserRole` | PATCH | `/api/v1/admin/users/:id/role` | Bearer (admin) | ✅ sí | /{locale}/admin/users | src/views/Admin/UsersListPage.tsx |
| `updateUserStatus` | PATCH | `/api/v1/admin/users/:id/status` | Bearer (admin) | ✅ sí | /{locale}/admin/users | src/views/Admin/UsersListPage.tsx |
| `uploadPlaceImage` | POST | `/api/v1/admin/places/:id/image` | Bearer (admin) | ✅ sí | /{locale}/admin/places-management | src/components/admin/PlaceEditModal.tsx |
