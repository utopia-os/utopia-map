/* eslint-disable @typescript-eslint/no-unnecessary-condition */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import EnvelopeIcon from '@heroicons/react/24/outline/EnvelopeIcon'
import PhoneIcon from '@heroicons/react/24/outline/PhoneIcon'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useItems } from '#components/Map/hooks/useItems'

import type { Item } from '#types/Item'

export const ContactInfoView = ({ item, heading }: { item: Item; heading: string }) => {
  const appState = useAppState()
  const [profileOwner, setProfileOwner] = useState<Item>()
  const items = useItems()

  useEffect(() => {
    setProfileOwner(
      items.find((i) => i.user_created?.id === item.user_created?.id && i.layer?.userProfileLayer),
    )
  }, [item, items])

  return (
    <div className='tw:bg-base-200 tw:p-6'>
      <h2 className='tw:text-lg tw:font-semibold'>{heading}</h2>
      <div className='tw:mt-4 tw:flex tw:items-center'>
        {profileOwner?.image && (
          <ConditionalLink url={'/item/' + profileOwner?.id}>
            <div className='tw:mr-5 tw:flex tw:items-center tw:justify-center'>
              <div className='tw:avatar'>
                <div className='tw:w-20 tw:h-20 tw:bg-gray-200 rounded-full tw:flex tw:items-center tw:justify-center overflow-hidden'>
                  <img
                    src={appState.assetsApi.url + profileOwner?.image}
                    alt={profileOwner?.name}
                    className='tw:w-full tw:h-full tw:object-cover'
                  />
                </div>
              </div>
            </div>
          </ConditionalLink>
        )}
        <div className='tw:text-sm tw:grow'>
          <p className='tw:font-semibold'>{profileOwner?.name}</p>
          {item.contact && (
            <p>
              <a
                href={`mailto:${item.contact}`}
                className='tw:mt-2 tw:text-green-500 tw:inline-flex tw:items-center'
              >
                <EnvelopeIcon className='tw:w-4 tw:h-4 tw:mr-1' />
                {item.contact}
              </a>
            </p>
          )}
          {item.telephone && (
            <p>
              <a
                href={`tel:${item.telephone}`}
                className='tw:mt-2 tw:text-green-500 tw:inline-flex tw:items-center tw:whitespace-nowrap'
              >
                <PhoneIcon className='tw:w-4 tw:h-4 tw:mr-1' />
                {item.telephone}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line react/prop-types
const ConditionalLink = ({ url, children }) => {
  const params = new URLSearchParams(window.location.search)

  if (url) {
    return <Link to={url + '?' + params}>{children}</Link>
  }
  return children
}
