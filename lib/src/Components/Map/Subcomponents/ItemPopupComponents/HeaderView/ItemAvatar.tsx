/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { QrCodeIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'

interface ItemAvatarProps {
  item: Item
  big?: boolean
  extraLarge?: boolean
  showQrButton?: boolean
  onQrClick?: () => void
}

export function ItemAvatar({
  item,
  big = false,
  extraLarge = false,
  showQrButton = false,
  onQrClick,
}: ItemAvatarProps) {
  const appState = useAppState()
  const [imageLoaded, setImageLoaded] = useState(false)

  const imageSize = extraLarge ? 320 : 160
  const avatar =
    (item.image &&
      appState.assetsApi.url + item.image + `?width=${imageSize}&height=${imageSize}`) ??
    item.image_external

  const hasAvatar = !!avatar

  // If no avatar but QR button should be shown, show only the QR button
  if (!hasAvatar && showQrButton) {
    return (
      <button onClick={onQrClick} className='tw:btn tw:btn-lg tw:p-3 tw:mr-2' title='QR-Code'>
        <QrCodeIcon className='tw:h-6 tw:w-6' />
      </button>
    )
  }

  if (!hasAvatar) return null

  const avatarSize = extraLarge ? 'tw:w-32' : big ? 'tw:w-16' : 'tw:w-10'

  return (
    <div className='tw:avatar tw:relative'>
      <div
        className={`${avatarSize} tw:inline tw:items-center tw:justify-center tw:overflow-visible`}
      >
        <img
          className='tw:w-full tw:h-full tw:object-cover tw:rounded-full tw:border-white'
          src={avatar}
          alt={(item.name ?? '') + ' logo'}
          onLoad={() => {
            setImageLoaded(true)
          }}
          onError={() => {
            setImageLoaded(false)
          }}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {!imageLoaded && <div className='tw:w-full tw:h-full tw:bg-gray-200 tw:rounded-full' />}
      </div>
      {showQrButton && (
        <button
          onClick={onQrClick}
          className='tw:btn tw:p-1 tw:btn-sm tw:absolute tw:bottom-[-6px] tw:right-[-6px]'
          title='QR-Code'
        >
          <QrCodeIcon className='tw:h-5 tw:w-5' />
        </button>
      )}
    </div>
  )
}
