import { Link } from 'react-router-dom'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useItems } from '#components/Map/hooks/useItems'

import type { Item } from '#types/Item'

interface Props {
  item: Item
  relation: string
  heading: string
  direction?: 'outgoing' | 'ingoing' | 'bidirectional'
  hideWhenEmpty?: boolean
}

function RelationCard({ item }: { item: Item }) {
  const appState = useAppState()
  const avatar = item.image ? appState.assetsApi.url + item.image : null

  return (
    <Link
      to={item.id}
      className='tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:bg-base-200'
    >
      {avatar && (
        <div className='tw:avatar'>
          <div className='tw:w-12 tw:rounded-full'>
            <img src={avatar} alt={item.name ?? ''} />
          </div>
        </div>
      )}
      <div className='tw:flex-1 tw:min-w-0'>
        <div className='tw:font-bold tw:text-lg tw:truncate tw:text-base-content'>{item.name}</div>
      </div>
    </Link>
  )
}

export const RelationsView = ({
  item,
  relation,
  heading,
  direction = 'outgoing',
  hideWhenEmpty = true,
}: Props) => {
  const items = useItems()

  if (!item.relations) return

  const relationsOfRightType = item.relations.filter((r) => r.type === relation)

  const relatedItems = (() => {
    const outgoingItems = items.filter((i) =>
      relationsOfRightType.some((r) => r.related_items_id === i.id),
    )

    const ingoingItems = items.filter((i) =>
      i.relations?.some((r) => r.type === relation && r.related_items_id === item.id),
    )

    switch (direction) {
      case 'outgoing':
        return outgoingItems
      case 'ingoing':
        return ingoingItems
      case 'bidirectional': {
        // Combine both arrays and remove duplicates
        const allItems = [...outgoingItems, ...ingoingItems]
        return allItems.filter(
          (item, index, self) => index === self.findIndex((i) => i.id === item.id),
        )
      }
      default:
        return outgoingItems
    }
  })()

  const hasRelatedItems = relatedItems.length > 0

  if (hideWhenEmpty && !hasRelatedItems) {
    return null
  }

  return (
    <div className='tw:my-4 tw:px-6'>
      <h2 className='tw:text-xl tw:font-bold tw:mb-3'>{heading}</h2>
      {hasRelatedItems ? (
        <div className='tw:grid tw:grid-cols-1 tw:@sm:grid-cols-2 tw:@lg:grid-cols-3 tw:gap-2'>
          {relatedItems.map((relatedItem) => (
            <RelationCard key={relatedItem.id} item={relatedItem} />
          ))}
        </div>
      ) : (
        <p className='tw:text-base-content/70'>No related items found.</p>
      )}
    </div>
  )
}
