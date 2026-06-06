#!/bin/sh

# base setup
SCRIPT_PATH=$(realpath $0)
SCRIPT_DIR=$(dirname $SCRIPT_PATH)

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
DIRECTUS_EMAIL="${DIRECTUS_EMAIL:-admin@it4c.dev}"
DIRECTUS_PASSWORD="${DIRECTUS_PASSWORD:-admin123}"

PGPASSWORD="${PGPASSWORD:-'directus'}"
PGUSER="${PGUSER:-'directus'}" 
PGDATABASE="${PGDATABASE:-'directus'}" 

PROJECT_NAME="${PROJECT:-development}"
PROJECT_FOLDER=$SCRIPT_DIR/directus-config/$PROJECT_NAME

echo "Wait for Directus to be ready"
TIMEOUT=180
ELAPSED=0
until curl -fsS "$DIRECTUS_URL/server/health" >/dev/null 2>&1; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "Timeout: Directus not ready after ${TIMEOUT}s" >&2
    exit 1
  fi
  sleep 2
  ELAPSED=$((ELAPSED+2))
done

echo "Push collections"
npx directus-sync@3.5.1 push \
  --dump-path $PROJECT_FOLDER \
  --directus-url $DIRECTUS_URL \
  --directus-email $DIRECTUS_EMAIL \
  --directus-password $DIRECTUS_PASSWORD \
  || exit 1
