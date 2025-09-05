import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon'

import type { Item } from '#types/Item'

export const RoutingLinksView = ({ item }: { item: Item }) => {
  // Only show if item has position coordinates
  if (!item.position?.coordinates) return null

  const [longitude, latitude] = item.position.coordinates

  const routingServices = [
    {
      name: 'Google Maps',
      url: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      icon: '🗺️',
    },
    {
      name: 'Apple Maps',
      url: `https://maps.apple.com/?daddr=${latitude},${longitude}`,
      icon: '🍎',
    },
    {
      name: 'OpenStreetMap',
      url: `https://www.openstreetmap.org/directions?to=${latitude},${longitude}`,
      icon: '🌍',
    },
  ]

  return (
    <div className='tw:bg-base-200 tw:mb-6 tw:mt-6 tw:p-6'>
      <h2 className='tw:text-lg tw:font-semibold tw:inline-flex tw:items-center'>
        <MapPinIcon className='tw:w-5 tw:h-5 tw:mr-2' />
        Get Directions
      </h2>
      <div className='tw:mt-4 tw:space-y-2'>
        {routingServices.map((service) => (
          <div key={service.name}>
            <a
              href={service.url}
              target='_blank'
              rel='noopener noreferrer'
              className='tw:text-green-500 tw:inline-flex tw:items-center tw:hover:text-green-600 tw:transition-colors'
            >
              <span className='tw:mr-2 tw:text-lg'>{service.icon}</span>
              {service.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
