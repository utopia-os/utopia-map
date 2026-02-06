-- Selects passwords and emails and creates a script to update user passwords in a database.
-- This is used to port users between instances as directus cannot import user passwords
SELECT CONCAT('UPDATE public.directus_users SET password=''', password, ''' WHERE email=''', email, ''';') FROM public.directus_users;