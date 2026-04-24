#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: qa-browser.sh <command> [args...]" >&2
  exit 2
fi

CMD="$1"
shift || true

case "$CMD" in
  open|goto|go-back|go-forward|reload|click|dblclick|fill|type|press|hover|drag|select|check|uncheck|tab-new|tab-list|tab-select|tab-close|snapshot|screenshot|tracing-start|tracing-stop|console|network|resize|close|close-all)
    ;;
  *)
    echo "Blocked command in safe mode: $CMD" >&2
    exit 10
    ;;
esac

APPROVED_REGEX='^(https?://localhost|https?://127\.0\.0\.1|https?://.*staging|https?://.*preview|https?://.*qa)'

if [ "$CMD" = "open" ] || [ "$CMD" = "goto" ] || [ "$CMD" = "tab-new" ]; then
  if [ "$#" -ge 1 ]; then
    URL="$1"
    if [[ "$URL" =~ ^https?:// ]] && [[ ! "$URL" =~ $APPROVED_REGEX ]]; then
      echo "Blocked unapproved URL in safe mode: $URL" >&2
      exit 11
    fi
  fi
fi

if command -v playwright-cli >/dev/null 2>&1; then
  exec playwright-cli "$CMD" "$@"
else
  exec npx playwright-cli "$CMD" "$@"
fi
