# App

## Troubleshooting

Map doesn't load and the Error `You must define the Admin roll in the .env file!` shows in the console.

In order to get the map running you need to define the correct uuid of the admin roll in the `.env` file.

Go to http://localhost:8055 and login with the admin credentials. Navigate to http://localhost:8055/admin/settings/roles and click `Administrator` and copy the UUID from the URL.

Put this UUID in the `.env` as `VITE_DIRECTUS_ADMIN_ROLE=UUID`