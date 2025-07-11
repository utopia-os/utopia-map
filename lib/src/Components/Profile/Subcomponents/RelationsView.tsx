import { useItems } from '#components/Map/hooks/useItems'

import type { Item } from '#types/Item'

interface Props {
  item: Item
  relation: string
}

export const RelationsView = ({ item, relation }: Props) => {
  const items = useItems()

  if (!item.relations) return

  const relationsOfRightType = item.relations.filter((r) => r.type === relation)

  const relatedItems = items.filter((i) => relationsOfRightType.some((r) => r.id === i.id))

  const hasRelatedItems = relatedItems.length > 0

  return (
    <div>
      <h2>{relation}</h2>
      {hasRelatedItems ? (
        <ul>
          {relatedItems.map((relatedItem) => (
            <li key={relatedItem.id}>
              <a href={`/item/${relatedItem.id}`}>{relatedItem.name}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No related items found.</p>
      )}
    </div>
  )
}
