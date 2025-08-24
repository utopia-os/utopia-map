/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { get } from 'radash'
import { Link } from 'react-router-dom'

import { useGetItemTags } from '#components/Map/hooks/useTags'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const PopupButton = ({
  url,
  parameterField,
  text,
  item,
}: {
  url: string
  parameterField?: string
  text: string
  item?: Item
}) => {
  const params = new URLSearchParams(window.location.search)
  const getItemTags = useGetItemTags()
  const parameter = get(item, parameterField ?? 'id')

  return (
    <Link to={`${url}/${parameter || item?.id}?${params}`} target='_parent'>
      <button
        style={{
          backgroundColor: `${item?.color ?? (item && (getItemTags(item) && getItemTags(item)[0] && getItemTags(item)[0].color ? getItemTags(item)[0].color : (item?.layer?.markerDefaultColor ?? '#000')))}`,
        }}
        className='tw:btn tw:text-white tw:btn-sm tw:float-right tw:mt-1'
      >
        {text}
      </button>
    </Link>
  )
}
