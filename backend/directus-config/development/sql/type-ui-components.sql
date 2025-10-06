-- Type: text+gallery
INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'texts', '1', '7c25fdf6-d5f2-425a-9a2e-03c5297d10bc' , '1', types.id
FROM
  public.types as types
WHERE
  name = 'text+gallery'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'gallery', '2', 'ea97b565-037c-4d0c-bcec-5e38793a6e7f' , '2', types.id
FROM
  public.types as types
WHERE
  name = 'text+gallery'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

-- Type: event
INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'startEnd', '3', '0b5e5f0a-76a4-407f-84ab-2fd718965909' , '1', types.id
FROM
  public.types as types
WHERE
  name = 'event'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'texts', '4', '94f6af1d-77e5-49ed-937b-6b9addc4f8ac' , '2', types.id
FROM
  public.types as types
WHERE
  name = 'event'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'gallery', '5', 'b0c52d6e-b3d2-4e3b-89e2-065be324e27b' , '3', types.id
FROM
  public.types as types
WHERE
  name = 'event'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

-- Type: user:text+gallery
INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'texts', '6', 'c960bbfc-5d98-4f6d-ae44-7a2b63d3359b' , '1', types.id
FROM
  public.types as types
WHERE
  name = 'user:text+gallery'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;

INSERT INTO public."types_profileTemplate" (collection, id, item, sort, types_id)
SELECT
  'gallery', '7', '6d18b616-6f4f-4987-9860-681b88bdc068' , '2', types.id
FROM
  public.types as types
WHERE
  name = 'user:text+gallery'
ON CONFLICT (id) DO UPDATE
  SET collection = excluded.collection,
      item = excluded.item,
      sort = excluded.sort,
      types_id = excluded.types_id;