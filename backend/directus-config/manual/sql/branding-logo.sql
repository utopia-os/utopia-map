DELETE FROM public.directus_files WHERE id = '412c25dc-a3b7-4114-b64b-cac2d6b46db3';

COPY public.directus_files (id, storage, filename_disk, filename_download, title, type, folder, uploaded_by, created_on, modified_by, modified_on, charset, filesize, width, height, duration, embed, description, location, tags, metadata, focal_point_x, focal_point_y, tus_id, tus_data, uploaded_on) FROM stdin;
412c25dc-a3b7-4114-b64b-cac2d6b46db3	local	412c25dc-a3b7-4114-b64b-cac2d6b46db3.svg	utopia-logo.svg	utopia-logo	image/svg+xml	\N	\N	2025-08-12 11:26:36.539+00	\N	2025-08-12 11:27:07.646+00	\N	22906	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-12 11:26:36.555+00
\.

UPDATE public.directus_settings SET project_logo = '412c25dc-a3b7-4114-b64b-cac2d6b46db3';
