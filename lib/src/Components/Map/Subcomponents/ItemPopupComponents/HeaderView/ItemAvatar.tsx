import { useState } from 'react'

import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'

interface ItemAvatarProps {
  item: Item
  big?: boolean
}

export function ItemAvatar({ item, big = false }: ItemAvatarProps) {
  const appState = useAppState()
  const [imageLoaded, setImageLoaded] = useState(false)

  const avatar =
    (item.image && appState.assetsApi.url + item.image + '?width=160&heigth=160') ??
    item.image_external

  if (!avatar) return null

  return (
    <div className='tw:avatar'>
      <div
        className={`${
          big ? 'tw:w-16' : 'tw:w-10'
        } tw:inline tw:items-center tw:justify-center tw:overflow-visible`}
      >
        <img
          className='tw:w-full tw:h-full tw:object-cover tw:rounded-full tw:border-white'
          src={avatar}
          alt={item.name + ' logo'}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {!imageLoaded && <div className='tw:w-full tw:h-full tw:bg-gray-200 tw:rounded-full' />}
      </div>
    </div>
  )
}
