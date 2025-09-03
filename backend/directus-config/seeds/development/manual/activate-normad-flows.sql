UPDATE public.directus_flows
SET status = 'active'
WHERE name ~ '(Ocean Nomads: Create Nomad|Ocean Nomads: Update Nomad|Ocean Nomads: Delete Nomad|Ocean Nomads: Create Location|Ocean Nomads: Create Event)';