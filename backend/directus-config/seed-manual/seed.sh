#!/bin/sh

# base setup
SCRIPT_PATH=$(realpath $0)
SCRIPT_DIR=$(dirname $SCRIPT_PATH)

SEED_SQL_DIR=$SCRIPT_DIR/sql

# apply database updates
for filename in $SEED_SQL_DIR/*.sql; do
  docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql -v ON_ERROR_STOP=1 --username directus directus" < $filename
done