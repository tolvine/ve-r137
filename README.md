# statusboard

A tiny dependency-free status board. `npm run build` renders `public/` into
`dist/` with content-hashed filenames and posts a build report to the artifact
store (same step as the GitHub Actions workflow in `docs/ci.md`).

## Scripts

- `npm run build` — render + hash + report

## CI

GitHub Actions (`docs/ci.md`) runs the same build on every push
and uploads the report with the CI bearer token, so the artifact store can
attribute builds.
