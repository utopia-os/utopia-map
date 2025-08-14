# Utopia Backend

To run the backend you can simply execute
`docker-compose up`

## Pull Data from Docker to Harddrive
In order to pull data from your locally running backend (see [docker-compose](../app/docker-compose.yml)) to your local harddrive, you can run the following command


```
npx directus-sync pull \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

## Push Data from Harddrive to Docker
To push local changes or to seed directus use the following command
```
npx directus-sync push \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

## Seed Data for local development
Seed the development data via:
```
npx directus-sync seed push \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

## Seed Data - find differences
In order so see what changes would appear when seeding, you can execute:
```
npx directus-sync seed diff \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

## Manual Seed

In order to seed files and additional data not covered by `directus-sync` run the script `backend/directus-config/manual/seed.sh`.

## Backup Database
Either keep a copy of the `/data/database` folder or run the following command to get an sql dump

```
docker exec -t utopia-map-database-1 pg_dumpall -c -U directus > dump.sql
```

## How to apply a database dump to the docker

Assuming you run docker-compose with the default postgress credentials and have the dump in cwd as ./dump.sql, execute:

Find current schema name:
```
echo "SELECT CURRENT_SCHEMA, CURRENT_SCHEMA();" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"
``` 
> current_schema | current_schema 
> ----------------+----------------
> public         | public
> (1 row)

Drop schemata (loses all data):
```
echo "DROP SCHEMA public CASCADE;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"

echo "DROP SCHEMA tiger CASCADE;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"

echo "DROP SCHEMA tiger_data CASCADE;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"

echo "DROP SCHEMA topology CASCADE;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"
``` 
> drop cascades to table ...
> ...
> DROP SCHEMA

Create the public schema again:
```
echo "CREATE SCHEMA public;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"
```

Verify schemata:
```
echo "select schema_name from information_schema.schemata;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus"
```

Verify database is empty:
```
echo "\dt" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus directus"
```
> Did not find any relations.

Create admin role & grant it:
```
echo "CREATE ROLE admin;" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus directus"
```

Apply dump:
```
docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql -v ON_ERROR_STOP=1 --username directus directus" < ./dump.sql
```
> Bring time depending on the dump size.

Reassign ownership of tables:
```
echo "REASSIGN OWNED BY admin TO directus" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus directus
```
> REASSIGN OWNED

## Access Data on local drive

In order to access the postgress data mounted to the local drive at `/data/database` you need to make it accessible (assuming you are not root):
```
sudo chmod 777 -R ./data/
```

This process is to be repeated whenever you restart the database docker container

The same applies for the uploads and extension folder - ensure that the folder is writeable or file uploads will fail.
