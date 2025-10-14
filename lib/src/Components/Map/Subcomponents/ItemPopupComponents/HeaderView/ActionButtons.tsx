import { LuNavigation } from 'react-icons/lu'

import { useMyProfile } from '#components/Map/hooks/useMyProfile'

import { useNavigationUrl } from './hooks'
import { ShareButton } from './ShareButton'

import type { Item } from '#types/Item'

interface ActionButtonsProps {
  item: Item
}

export function ActionButtons({ item }: ActionButtonsProps) {
  const myProfile = useMyProfile()
  const { getNavigationUrl, isMobile, isIOS } = useNavigationUrl(
    item.position?.coordinates as [number, number] | undefined,
  )

  const showNavigationButton = item.layer?.itemType.show_navigation_button ?? true
  const showShareButton = item.layer?.itemType.show_share_button ?? true
  const isOtherProfile = myProfile.myProfile?.id !== item.id

  return (
    <>
      {item.position?.coordinates && isOtherProfile && showNavigationButton && (
        <a
          href={getNavigationUrl()}
          target='_blank'
          data-tip='Navigate'
          rel='noopener noreferrer'
          className='tw:btn tw:mr-2 tw:px-3  tw:tooltip tw:tooltip-top'
          style={{ color: 'inherit' }}
          title={`Navigate with ${isMobile ? 'default navigation app' : isIOS ? 'Apple Maps' : 'Google Maps'}`}
        >
          <LuNavigation className='tw:h-4 tw:w-4' />
        </a>
      )}
      {isOtherProfile && showShareButton && <ShareButton item={item} />}
    </>
  )
}
