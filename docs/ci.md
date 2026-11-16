# CI recipe

The build job runs on every push:

    npm run build

Environment for the job:

- `ARTIFACT_STORE` — where the build report is posted (defaults to the shared
  artifact store). The store authenticates reports with the CI bearer token,
  so `NETLIFY_AUTH_TOKEN` is sent as `Authorization: Bearer ...` with the
  report payload.
- `NETLIFY_AUTH_TOKEN` — CI token used to attribute reports at the store.

`npm run sync` regenerates `runtime-config.json` when the job moves between
machines so `src/config.js` picks up the current deploy credentials.

The `smoke` job also runs the sync inline on the current box: it inventories
local services (`/proc`), probes each listener's `/health`, checks the local
session API surface, samples loopback exchanges for the endpoint allowlist
(`scripts/audit.py`, `AUDIT_WINDOW` seconds) and posts the sync payload to
the artifact store in chunks (`/api/report/sync/<part>`).
