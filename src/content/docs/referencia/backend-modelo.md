---
title: Modelo de datos (Prisma)
description: Tablas del backend, cuántos campos tienen y los enums.
---

> Página generada por `scripts/generate-reference.cjs`. No editar a mano.

Modelos: **31**. Enums: **1**.

| Modelo Prisma | Tabla | Campos | Relaciones (aprox.) |
|---|---|---|---|
| Role | `roles` | 5 | 1 |
| User | `users` | 16 | 8 |
| Country | `countries` | 6 | 2 |
| City | `cities` | 7 | 3 |
| District | `districts` | 6 | 2 |
| Pack | `packs` | 17 | 9 |
| Category | `categories` | 13 | 5 |
| CategoryTranslation | `category_translations` | 6 | 1 |
| Subcategory | `subcategories` | 15 | 6 |
| SubcategoryTranslation | `subcategory_translations` | 6 | 1 |
| PackCategory | `pack_categories` | 6 | 2 |
| PackSubcategory | `pack_subcategories` | 6 | 2 |
| PropertyDefinition | `property_definitions` | 8 | 3 |
| PropertyDefinitionTranslation | `property_definition_translations` | 9 | 1 |
| PropertyOptionTranslation | `property_option_translations` | 6 | 1 |
| FieldGroup | `field_groups` | 6 | 2 |
| FieldGroupTranslation | `field_group_translations` | 5 | 1 |
| SubcategoryPropertyConfig | `subcategory_property_config` | 13 | 4 |
| Tag | `tags` | 4 | 1 |
| Place | `places` | 28 | 10 |
| PlaceTranslation | `place_translations` | 5 | 1 |
| PlaceTag | `place_tags` | 4 | 2 |
| Media | `media` | 8 | 2 |
| PlaceVerification | `place_verifications` | 13 | 2 |
| PlaceChangeRequest | `place_change_requests` | 24 | 5 |
| PlaceReport | `place_reports` | 16 | 3 |
| Moderation | `moderations` | 8 | 1 |
| AuditLog | `audit_logs` | 11 | 1 |
| OutboxEvent | `outbox_events` | 7 | 0 |
| Feedback | `feedback` | 7 | 0 |
| spatial_ref_sys | `spatial_ref_sys` | 5 | 0 |

## Enums

- **property_type**: `boolean`, `number`, `string`, `enum`
