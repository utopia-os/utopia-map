import { FaPlus } from 'react-icons/fa6'

import { useMyProfile } from '#components/Map/hooks/useMyProfile'
import { useGetItemTags } from '#components/Map/hooks/useTags'

import type { Item } from '#types/Item'

interface ConnectionStatusProps {
  item: Item
}

export function ConnectionStatus({ item }: ConnectionStatusProps) {
  const myProfile = useMyProfile()
  const getItemTags = useGetItemTags()

  if (myProfile.myProfile?.id === item.id) {
    return null
  }

  const isConnected = item.relations?.some(
    (r) =>
      r.type === item.layer?.itemType.cta_relation &&
      r.related_items_id === myProfile.myProfile?.id,
  )

  if (!item.layer?.itemType.show_cta_button) {
    return null
  }

  if (isConnected) {
    return <p className='tw:flex tw:items-center tw:mr-2'>✅ Connected</p>
  }

  const tags = getItemTags(item)
  return (
    <button
      style={{
        backgroundColor:
          item.color ?? (tags[0]?.color ? tags[0].color : item.layer.markerDefaultColor || '#000'),
      }}
      className='tw:btn tw:text-white tw:mr-2 tw:tooltip tw:tooltip-top '
      data-tip={'Connect'}
    >
      <FaPlus className='tw:w-5' /> Connect
    </button>
  )
}
