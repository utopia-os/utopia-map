-- Layer: Event (static: 5d12f356-349a-4463-a57c-5fc54eede6ba)
-- Flow: Ocean Nomads Create Event
UPDATE public.directus_operations
SET options = jsonb_set(options::jsonb,'{payload,layer}', to_jsonb((SELECT id FROM layers WHERE name = 'Events')), true)
WHERE options->'payload'->>'layer' = '5d12f356-349a-4463-a57c-5fc54eede6ba'; -- 2x

-- Layer: Nomads Base (static: a546f94b-8928-4d0b-b3ca-39bd109abd34)
-- Flow: Ocean Nomads: Create Nomad
-- Flow: Ocean Nomads: Update Nomad
-- Flow: Ocean Nomads: Delete Nomad
UPDATE public.directus_operations
SET options = jsonb_set(options::jsonb,'{payload,layer}', to_jsonb((SELECT id FROM layers WHERE name = 'Nomads Base')), true)
WHERE options->'payload'->>'layer' = 'a546f94b-8928-4d0b-b3ca-39bd109abd34'; -- 1x

UPDATE public.directus_operations
SET options = jsonb_set(options::jsonb,'{query,filter,_and,0,layer,_eq}', to_jsonb((SELECT id FROM layers WHERE name = 'Nomads Base')), true)
WHERE options->'query'->'filter'->'_and'->0->'layer'->>'_eq' = 'a546f94b-8928-4d0b-b3ca-39bd109abd34'; -- 2x

-- Layer: Nomads Location (static: 1c0a440f-bdf8-43a0-80bc-2d099d69b3ca)
-- Flow: Ocean Nomads: Create Location
-- Flow: Ocean Nomads: Update Nomad
-- Flow: Ocean Nomads: Delete Nomad
UPDATE public.directus_operations
SET options = jsonb_set(options::jsonb,'{query,filter,_and,0,layer,_eq}', to_jsonb((SELECT id FROM layers WHERE name = 'Nomads Location')), true)
WHERE options->'query'->'filter'->'_and'->0->'layer'->>'_eq' = '1c0a440f-bdf8-43a0-80bc-2d099d69b3ca'; -- 2x

UPDATE public.directus_operations
SET options = jsonb_set(options::jsonb,'{filter,$trigger,payload,layer,_eq}', to_jsonb((SELECT id FROM layers WHERE name = 'Nomads Location')), true)
WHERE options->'filter'->'$trigger'->'payload'->'layer'->>'_eq' = '1c0a440f-bdf8-43a0-80bc-2d099d69b3ca'; -- 1x
