import { MapPinIcon } from '@heroicons/react/24/solid'

import { useGeoDistance } from '#components/Map/hooks/useGeoDistance'
import { useReverseGeocode } from '#components/Map/hooks/useReverseGeocode'

import { useFormatDistance } from './hooks'

import type { Item } from '#types/Item'

interface ItemSubtitleProps {
  item: Item
  mode?: 'address' | 'custom' | 'none'
  truncate?: boolean
  showDistance?: boolean
}

export function ItemSubtitle({
  item,
  mode = 'address',
  truncate = true,
  showDistance = true,
}: ItemSubtitleProps) {
  const { distance } = useGeoDistance(item.position ?? undefined)
  const { formatDistance } = useFormatDistance()

  // Use item.address from backend if available, otherwise use reverse geocoding
  const shouldReverseGeocode = mode === 'address' && (!item.address || item.address.trim() === '')

  const { address: geocodedAddress } = useReverseGeocode(
    item.position?.coordinates as [number, number] | undefined,
    shouldReverseGeocode,
    'municipality',
  )

  const address = item.address && item.address.trim() !== '' ? item.address : geocodedAddress
  const subtitle = item.subname

  if (mode === 'address' && address) {
    return (
      <div className='tw:text-sm tw:flex tw:items-center tw:text-gray-500 tw:w-full'>
        <MapPinIcon className='tw:w-4 tw:mr-1 tw:flex-shrink-0' />
        <span title={address} className={truncate ? 'tw:truncate' : ''}>
          {address}
          {showDistance && distance && distance >= 0.1
            ? ` (${formatDistance(distance) ?? ''})`
            : ''}
        </span>
      </div>
    )
  }

  if (mode === 'custom' && subtitle) {
    return (
      <div className={`tw:text-sm tw:opacity-50 tw:items-center ${truncate ? 'tw:truncate' : ''}`}>
        {subtitle}
      </div>
    )
  }

  return null
}
