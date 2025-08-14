#!/bin/sh

# base setup
SCRIPT_PATH=$(realpath $0)
SCRIPT_DIR=$(dirname $SCRIPT_PATH)
ROOT_DIR=$SCRIPT_DIR/../../..

DATA_DIR=$ROOT_DIR/data
DATA_UPLOADS_DIR=$DATA_DIR/uploads

SEED_FILES_DIR=$SCRIPT_DIR/files
SEED_SQL_DIR=$SCRIPT_DIR/sql

# copy files
cp $SEED_FILES_DIR/* $DATA_UPLOADS_DIR/

# apply database updates
for filename in $SEED_SQL_DIR/*.sql; do
  docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql -v ON_ERROR_STOP=1 --username directus directus" < $filename
done