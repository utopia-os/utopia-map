UPDATE public.directus_permissions
  SET presets = jsonb_set(presets::jsonb,'{role}', to_jsonb((SELECT id FROM public.directus_roles WHERE name = 'Registrated')), true)
  WHERE policy = (SELECT id FROM public.directus_policies WHERE name = '$t:public_label')
  AND collection = 'directus_users'
  AND action = 'create';