import { useEffect } from 'react'
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

export const RelationsView = ({
  item,
  relation,
  heading,
  direction = 'outgoing',
  hideWhenEmpty = true,
}: Props) => {
  const items = useItems()
  const appState = useAppState()

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
    <div className='tw:my-10 tw:mt-2 tw:px-6'>
      <h2 className='tw:text-lg tw:font-bold'>{heading}</h2>
      {hasRelatedItems ? (
        <ul>
          {relatedItems.map((relatedItem) => (
            <li key={relatedItem.id}>
              <Link to={relatedItem.id} className='tw:flex tw:flex-row'>
                <div>
                  {relatedItem.image ? (
                    <img
                      className='tw:size-10 tw:rounded-full'
                      src={appState.assetsApi.url + '/' + relatedItem.image}
                    />
                  ) : (
                    <div className='tw:size-10 tw:rounded-full tw:bg-gray-200' />
                  )}
                </div>
                <div className='tw:ml-2 tw:flex tw:items-center tw:min-h-[2.5rem]'>
                  <div>{relatedItem.name}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No related items found.</p>
      )}
    </div>
  )
}
