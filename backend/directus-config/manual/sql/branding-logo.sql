UPDATE public.directus_settings SET project_logo = (SELECT id FROM directus_files WHERE filename_download = 'utopia-logo.svg');
