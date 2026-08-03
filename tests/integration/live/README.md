# Live API integration tests

Optional tests against a real Translaas delivery API. They are **excluded from default PR CI** and skip automatically when `TRANSLAAS_API_KEY` is unset.

## Fixture data

Aligned with [translaas-sdk-examples](https://github.com/Mantelabs/translaas-sdk-examples) (`translaas_sdk_samples_strings.csv`):

| Kind                   | Value                        |
| ---------------------- | ---------------------------- |
| Project                | `translaas-sdk-samples`      |
| Group / entry (simple) | `common` / `welcome.message` |
| Group / entry (plural) | `messages` / `item`          |
| Language               | `en`                         |

## Environment variables

| Variable                    | Required     | Default                       |
| --------------------------- | ------------ | ----------------------------- |
| `TRANSLAAS_API_KEY`         | Yes (to run) | —                             |
| `TRANSLAAS_BASE_URL`        | No           | `https://api.translaas.local` |
| `TRANSLAAS_DEFAULT_PROJECT` | No           | `translaas-sdk-samples`       |

## Local Docker (Windows PowerShell)

```powershell
# From platform/translaas — start core stack and seed translaas-sdk-samples
# See platform/translaas/docs/docker-compose-profiles.md

cd d:\source\Mantelabs\translaas-all\sdk\js
npm ci
npm run build

$env:TRANSLAAS_API_KEY = "your-sdk-api-key"
$env:TRANSLAAS_BASE_URL = "https://api.translaas.local"   # optional
$env:TRANSLAAS_DEFAULT_PROJECT = "translaas-sdk-samples"  # optional

# Local Docker often uses a self-signed TLS cert:
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

npm run test:integration:live
```

Without `TRANSLAAS_API_KEY`, live tests are **skipped** (exit code 0).

## Test matrix

| File                          | Coverage                                             |
| ----------------------------- | ---------------------------------------------------- |
| `get-entry.test.ts`           | `getEntryAsync` — simple + plural                    |
| `get-group.test.ts`           | `getGroupAsync`                                      |
| `get-project.test.ts`         | `getProjectAsync`                                    |
| `get-project-locales.test.ts` | `getProjectLocalesAsync`                             |
| `validate-api-key.test.ts`    | `validateApiKeyAsync`, `TranslaasClient.createAsync` |
| `error-scenarios.test.ts`     | Invalid key, bad URL, timeout                        |
| `service.test.ts`             | `TranslaasService.t()` with explicit language        |

## Mantelabs HTTP 404

When the configured project or fixture data is missing, happy-path tests **soft-skip** with a hint to set `TRANSLAAS_DEFAULT_PROJECT` (default: `translaas-sdk-samples`). Legacy APIs may return empty payloads instead of 404.

## CI

Run manually via **Integration Tests** workflow (`.github/workflows/integration-tests.yml`) after configuring repository secrets `TRANSLAAS_API_KEY` and `TRANSLAAS_BASE_URL`.

Default **CI** workflow continues to run MSW mock tests only (`npm run test:integration`).
