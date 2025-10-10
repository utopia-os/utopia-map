import { MapPinIcon } from '@heroicons/react/24/solid'

import { useGeoDistance } from '#components/Map/hooks/useGeoDistance'
import { useReverseGeocode } from '#components/Map/hooks/useReverseGeocode'

import { useFormatDistance } from './hooks'

import type { Item } from '#types/Item'

interface ItemTitleProps {
  item: Item
  big?: boolean
  truncateSubname?: boolean
  showAddress?: boolean
  hasAvatar?: boolean
}

export function ItemTitle({
  item,
  big = false,
  truncateSubname = true,
  showAddress = true,
  hasAvatar = false,
}: ItemTitleProps) {
  const { distance } = useGeoDistance(item.position ?? undefined)
  const { formatDistance } = useFormatDistance()

  const { address } = useReverseGeocode(
    item.position?.coordinates as [number, number] | undefined,
    showAddress,
    'municipality',
  )

  const title = item.name ?? item.layer?.item_default_name
  const subtitle = item.subname

  return (
    <div className={`${hasAvatar ? 'tw:ml-3' : ''} tw:overflow-hidden tw:flex-1 tw:min-w-0 `}>
      <div
        className={`${big ? 'tw:xl:text-3xl tw:text-2xl' : 'tw:text-xl'} tw:font-bold`}
        title={title}
        data-cy='profile-title'
      >
        {title}
      </div>
      {showAddress && address && (
        <div className='tw:text-sm tw:flex tw:items-center tw:text-gray-500 tw:w-full'>
          <MapPinIcon className='tw:w-4 tw:mr-1 tw:flex-shrink-0' />
          <span title={address} className='tw:truncate'>
            {address}
            {distance && distance >= 0.1 && ` (${formatDistance(distance) ?? ''})`}
          </span>
        </div>
      )}
      {subtitle && !showAddress && (
        <div
          className={`tw:text-sm tw:opacity-50 tw:items-center ${truncateSubname ? 'tw:truncate' : ''}`}
        >
          {subtitle}
        </div>
      )}
    </div>
  )
}
