---
"@translaas/client": minor
"@translaas/models": minor
---

Align the JS SDK with the backend **`/sdk/v1/translations`** API and OpenAPI response shapes.

### Breaking changes

- Default translation HTTP routes use **`/sdk/v1/translations`** (e.g. `text`, `group`, `project`, `locales`, `report-missing`, `offline-cache`) instead of legacy **`/api/translations/...`** paths. Point **`baseUrl`** at the API host; override with **`sdkTranslationsPathPrefix`** if you use a custom proxy layout.
- **`getGroupAsync`** / project parsing now matches **`GetGroupTranslationsResponse`** (wrapped **`entries`**, optional context/version fields) and supports **`format=flat-json`** where applicable.
- **`ITranslaasClient`** method signatures and options were updated for **`project`**, SDK query passthrough (**`channel`**, **`v`**, **`includeContext`**), **`defaultProjectId`**, **`defaultSdkQuery`**, and new endpoints (**`reportMissingKeysAsync`**, **`getOfflineCacheZipAsync`**, **`validateApiKeyAsync`**).

### Migration

See the README and **`.docs/CONFIGURATION.md`** for **`TranslaasOptions`**, text **`project`** when keys are not project-scoped, and the validate/offline ZIP helpers under **`/api/v1`** vs **`/sdk/v1`**.
