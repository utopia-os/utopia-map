import { useEffect } from 'react'

import { useItems } from '#components/Map/hooks/useItems'

import type { Item } from '#types/Item'
import { Link } from 'react-router-dom'

interface Props {
  item: Item
  relation: string
}

export const RelationsView = ({ item, relation }: Props) => {
  const items = useItems()

  useEffect(() => {
    console.log(relatedItems)
  }, [])

  if (!item.relations) return

  const relationsOfRightType = item.relations.filter((r) => r.type === relation)

  const relatedItems = items.filter((i) =>
    relationsOfRightType.some((r) => r.related_items_id === i.id),
  )

  const hasRelatedItems = relatedItems.length > 0

  return (
    <div className='tw:my-10 tw:mt-2 tw:px-6'>
      <h2 className='tw:text-lg tw:font-bold'>{relation}</h2>
      {hasRelatedItems ? (
        <ul>
          {relatedItems.map((relatedItem) => (
            <li key={relatedItem.id}>
              <Link to={`/item/${relatedItem.id}`}>{relatedItem.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No related items found.</p>
      )}
    </div>
  )
}
