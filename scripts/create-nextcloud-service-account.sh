#!/usr/bin/env sh
set -eu

: "${ENV_FILE:=.env}"
if [ -f "$ENV_FILE" ]; then
  set -a
  . "./$ENV_FILE"
  set +a
fi

: "${NEXTCLOUD_SERVICE_USER:?Set NEXTCLOUD_SERVICE_USER in .env}"
: "${NEXTCLOUD_SERVICE_PASSWORD:?Set NEXTCLOUD_SERVICE_PASSWORD in .env}"

# Run after the first Nextcloud boot. The command is idempotent for local setup:
# an existing account is left unchanged.
docker compose exec -T --user 33 nextcloud php occ user:info "$NEXTCLOUD_SERVICE_USER" >/dev/null 2>&1 || \
  docker compose exec -T --user 33 -e OC_PASS="$NEXTCLOUD_SERVICE_PASSWORD" nextcloud php occ user:add \
    --password-from-env \
    --display-name="SeVR API service" \
    "$NEXTCLOUD_SERVICE_USER"
