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