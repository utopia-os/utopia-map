import { get } from 'radash'
import { Link } from 'react-router-dom'

import { useGetItemColor } from '#components/Map/hooks/useItemColor'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const PopupButton = ({
  url,
  parameterField,
  text,
  item,
  target,
}: {
  url: string
  parameterField?: string
  text: string
  item?: Item
  target?: string
}) => {
  const params = new URLSearchParams(window.location.search)
  const getItemColor = useGetItemColor()
  const parameter = parameterField ? get(item, parameterField) : undefined
  const itemId = typeof parameter === 'string' ? parameter : (item?.id ?? '')

  return (
    <Link to={`${url}/${itemId}?${params}`} target={target ?? '_self'}>
      <button
        style={{
          backgroundColor: getItemColor(item),
        }}
        className='tw:btn tw:text-white tw:btn-sm tw:float-right tw:mt-1'
      >
        {text}
      </button>
    </Link>
  )
}
