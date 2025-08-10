In order to pull data from your locally running backend (see [docker-compose](../app/docker-compose.yml)) to your local harddrive, you can run the following command

```
npx directus-sync pull \
  --directus-url http://localhost:8055 \
  --directus-email admin@it4c.dev \
  --directus-password admin123
```

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

## Access Data on local drive

In order to access the postgress data mounted to the local drive at `/data/database` you need to make it accessible (assuming you are not root):
```
sudo chmod 777 -R ./data/
```

This process is to be repeated whenever you restart the database docker container
