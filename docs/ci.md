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

