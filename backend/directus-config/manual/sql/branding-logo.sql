DELETE FROM public.directus_settings WHERE id = 1; 
DELETE FROM public.directus_files WHERE id = '412c25dc-a3b7-4114-b64b-cac2d6b46db3';

COPY public.directus_files (id, storage, filename_disk, filename_download, title, type, folder, uploaded_by, created_on, modified_by, modified_on, charset, filesize, width, height, duration, embed, description, location, tags, metadata, focal_point_x, focal_point_y, tus_id, tus_data, uploaded_on) FROM stdin;
412c25dc-a3b7-4114-b64b-cac2d6b46db3	local	412c25dc-a3b7-4114-b64b-cac2d6b46db3.svg	utopia-logo.svg	utopia-logo	image/svg+xml	\N	\N	2025-08-12 11:26:36.539+00	\N	2025-08-12 11:27:07.646+00	\N	22906	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-08-12 11:26:36.555+00
\.

COPY public.directus_settings (id, project_name, project_url, project_color, project_logo, public_foreground, public_background, public_note, auth_login_attempts, auth_password_policy, storage_asset_transform, storage_asset_presets, custom_css, storage_default_folder, basemaps, mapbox_key, module_bar, project_descriptor, default_language, custom_aspect_ratios, public_favicon, default_appearance, default_theme_light, theme_light_overrides, default_theme_dark, theme_dark_overrides, report_error_url, report_bug_url, report_feature_url, public_registration, public_registration_verify_email, public_registration_role, public_registration_email_filter, visual_editor_urls) FROM stdin;
1	Utopia Map	\N	#99C1F1	412c25dc-a3b7-4114-b64b-cac2d6b46db3	\N	\N	\N	25	\N	all	\N	\N	\N	\N	\N	[{"type":"module","id":"content","enabled":true},{"type":"module","id":"visual","enabled":false},{"type":"module","id":"users","enabled":true},{"type":"module","id":"files","enabled":true},{"type":"module","id":"insights","enabled":false},{"type":"module","id":"settings","enabled":true,"locked":true}]	collaborative Mapping	en-US	\N	\N	auto	\N	\N	\N	\N	\N	\N	\N	f	t	\N	\N	\N
\.
