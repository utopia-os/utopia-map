# Utopia Backend

To run the backend you can simply execute
`docker-compose up`

To fill in all required data execute the following commands in order:
```
cd backend
./push.sh
./seed.sh
```

## Pull Data from Docker to Harddrive

In order to pull data from your locally running backend (see [docker-compose](../app/docker-compose.yml)) to your local harddrive, you can run the following command


```
npx directus-sync pull \
  --dump-path ./directus-config/development \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

You can run `./pull.sh` to run this command and modify it via `export PROJECT=...` for a different project configuration.

## Push Data from Harddrive to Docker

To push local changes or to seed directus use the following command
```
npx directus-sync push \
  --dump-path ./directus-config/development \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

You can run `./push.sh` to run this command and modify it via `export PROJECT=...` for a different project configuration.

## Seed Data for local development

In order to seed the development data, run the script `backend/seed.sh`.

## Backup Database

Either keep a copy of the `/data/database` folder or run the following command to get an sql dump

```
docker exec -t utopia-map-database-1 pg_dumpall -c -U directus > dump.sql
```

## How to apply a database dump to the docker

Assuming you run docker-compose with the default postgress credentials and have the dump in cwd as ./dump.sql, execute:

Drop database:
```
docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql -v ON_ERROR_STOP=1 --username directus directus" < ./backend/scripts/drop-database.sql
```

Apply dump:
```
docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql -v ON_ERROR_STOP=1 --username directus directus" < ./dump.sql
```
> Bring time depending on the dump size.

Reassign ownership of tables:
```
echo "REASSIGN OWNED BY admin TO directus" | docker exec -i utopia-map-database-1 /bin/bash -c "PGPASSWORD=directus psql --username directus directus"
```
> REASSIGN OWNED

## Access Data on local drive

In order to access the postgress data mounted to the local drive at `/data/database` you need to make it accessible (assuming you are not root):
```
sudo chmod 777 -R ./data/
```

This process is to be repeated whenever you restart the database docker container

The same applies for the uploads and extension folder - ensure that the folder is writeable or file uploads will fail.
