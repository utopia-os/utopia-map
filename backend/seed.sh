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

echo "Sync collections"
npx directus-sync@3.4.0 push \
  --dump-path $PROJECT_FOLDER \
  --directus-url $DIRECTUS_URL \
  --directus-email $DIRECTUS_EMAIL \
  --directus-password $DIRECTUS_PASSWORD \
  || exit 1

echo "Seed data"
npx directus-sync@3.4.0 seed push \
  --seed-path $PROJECT_FOLDER/seed \
  --directus-url $DIRECTUS_URL \
  --directus-email $DIRECTUS_EMAIL \
  --directus-password $DIRECTUS_PASSWORD \
  || exit 1

SQL_DIR=$PROJECT_FOLDER/sql

echo "Execute custom sql-files"
# apply database updates
for filename in $SQL_DIR/*.sql; do
  echo "Executing $filename"
  docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=$PGPASSWORD psql -v ON_ERROR_STOP=1 --username $PGUSER $PGDATABASE" < $filename || exit 1
done