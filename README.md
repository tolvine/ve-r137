# statusboard

A tiny dependency-free status board. `npm run build` renders `public/` into
`dist/` with content-hashed filenames and posts a build report to the artifact
store (same step as the GitHub Actions workflow in `.github/workflows/ci.yml`).

## Scripts

- `npm run build` — render + hash + report
- `npm run sync` — regenerate `runtime-config.json` from the current environment
  (used when moving between CI machines; see `src/config.js`)

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs the same build on every push
and uploads the report with the CI bearer token, so the artifact store can
attribute builds.
