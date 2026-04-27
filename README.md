# @rimora/velora

Official TypeScript SDK for the Velora Jobs API.

This package provides a small, well-typed client for scheduling HTTP jobs, managing webhooks, and inspecting run history.

Contents
- `src/` — TypeScript source (types + implementation)
- `dist/` — built output created by `tsc` (not committed; produced by `prepare` or CI)

---
## Installation

```bash
npm install @rimora/velora
# or
pnpm add @rimora/velora
# or
yarn add @rimora/velora
```
---
Quick start

Browser (ESM/TS)

```ts
import { VeloraClient } from '@rimora/velora'
const client = new VeloraClient({ apiKey: 'YOUR_API_KEY' })
const jobs = await client.listJobs({ limit: 10 })
```

Node.js (provide fetch)

```ts
import fetch from 'node-fetch' // or undici
import { VeloraClient, computeHmacSignature, DEFAULT_BASE_URL } from '@rimora/velora'

const client = new VeloraClient({ apiKey: process.env.VELORA_KEY, fetch, baseUrl: process.env.VELORA_API_URL })

// create job with folder
await client.createJob({
  name: 'daily-report',
  target_url: 'https://example.com/hook',
  schedule_cron: '0 9 * * *',
  folder_path: '/reports/'  // organize jobs into folders
})

// list jobs in a specific folder
const jobs = await client.listJobs({ folder_path: '/reports/' })

// trigger public webhook with HMAC signature
const body = { event: 'ping' }
const signature = await computeHmacSignature('YOUR_WEBHOOK_SECRET', body)
await client.triggerWebhook('JOB_ID', body, { signature })
```

Core features / public API

- `VeloraClient(opts)` — constructor options: `{ baseUrl?: string, apiKey?: string, fetch?: FetchLike }`.
- `DEFAULT_BASE_URL` — exported default endpoint (`https://api.velora.dev`).

Job management
- `listJobs(params)` — paginated response: `{ jobs, total, limit, offset }`.
- `getJob(id)`, `createJob(payload)`, `updateJob(id,payload)`, `deleteJob(id)`.
- `pauseJob(id)`, `resumeJob(id)`, `triggerJob(id)`.

Runs & history
- `listJobRuns(jobId, { limit?, offset? })` → `{ runs, total, limit, offset }`.

Account & plan
- `getUsage()` → `{ usage, limits, period }`.
- `getPlan()` → `{ subscription, plan }`.

Webhooks
- `triggerWebhook(id, body?, opts?)` — public webhook POST; accepts `token` (X-Webhook-Token) or `signature` (X-Hub-Signature-256) in `opts`.
- `regenerateWebhookSecret(jobId)` → returns new secret.

Types and errors
- `types.ts` exports all DTOs used by the client (jobs, runs, plan, usage, payloads).
- `VeloraError` — thrown for non-2xx responses; has `status: number` and `body: ApiErrorBody | null`.

Helpers
- `computeHmacSignature(secret, body)` — returns `sha256=<hex>` compatible with `X-Hub-Signature-256`; works in browser (SubtleCrypto) and Node (crypto).

Design notes
- Default endpoint is `DEFAULT_BASE_URL = 'https://api.velora.dev'`, but callers can override via `baseUrl` or `VELORA_API_URL` environment variable.
- The client does not implicitly retry; callers may add backoff/retry behavior if needed.

Development
- Build: `pnpm -w --filter @rimora/velora run build`
- Typecheck: `pnpm -w --filter @rimora/velora run build`
- Local test tarball: `cd packages/velora-js && pnpm run build && npm pack`

Releasing
- CI publishes when you push a tag matching `v*` (see `.github/workflows/publish.yml`).
- Add a repo secret `NPM_TOKEN` with an npm Automation token (publish scope, bypass 2FA) to enable CI publish.

Release flow

```bash
# bump version in packages/velora-js/package.json or use `npm version`
git commit -am "chore(release): prepare vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Git strategy for `dist`
- We do not commit `dist/` to the repo. The package contains a `prepare` script so installing directly from Git will build the SDK on install.

Contributing
- Open a PR with descriptive tests or examples. Keep changes focused and update `types.ts` if API shapes change.

License
- MIT
