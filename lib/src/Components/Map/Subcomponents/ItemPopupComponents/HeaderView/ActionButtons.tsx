import { QrCodeIcon, ShareIcon } from '@heroicons/react/24/solid'
import { LuNavigation } from 'react-icons/lu'

import ChevronSVG from '#assets/chevron.svg'
import ClipboardSVG from '#assets/share/clipboard.svg'
import FacebookSVG from '#assets/share/facebook.svg'
import LinkedinSVG from '#assets/share/linkedin.svg'
import TelegramSVG from '#assets/share/telegram.svg'
import TwitterSVG from '#assets/share/twitter.svg'
import WhatsappSVG from '#assets/share/whatsapp.svg'
import XingSVG from '#assets/share/xing.svg'
import { useMyProfile } from '#components/Map/hooks/useMyProfile'

import { useNavigationUrl, useShareLogic } from './hooks'

import type { Item } from '#types/Item'
import type { PlatformConfig, SharePlatformConfigs } from './types'

interface ActionButtonsProps {
  item: Item
  onQrModalOpen: () => void
}

export function ActionButtons({ item, onQrModalOpen }: ActionButtonsProps) {
  const myProfile = useMyProfile()
  const { getNavigationUrl, isMobile, isIOS } = useNavigationUrl(
    item.position?.coordinates as [number, number] | undefined,
  )
  const { shareUrl, shareTitle, copyLink, getShareUrl } = useShareLogic(item)

  const platformConfigs: SharePlatformConfigs = {
    facebook: {
      shareUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}',
      icon: <img src={FacebookSVG} alt='Facebook' className='tw:w-4 tw:h-4' />,
      label: 'Facebook',
      bgColor: '#3b5998',
    },
    twitter: {
      shareUrl: 'https://twitter.com/intent/tweet?text={title}:%20{url}',
      icon: <img src={TwitterSVG} alt='Twitter' className='tw:w-4 tw:h-4' />,
      label: 'Twitter',
      bgColor: '#55acee',
    },
    linkedin: {
      shareUrl: 'http://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}',
      icon: <img src={LinkedinSVG} alt='Linkedin' className='tw:w-4 tw:h-4' />,
      label: 'LinkedIn',
      bgColor: '#4875b4',
    },
    whatsapp: {
      shareUrl: 'https://api.whatsapp.com/send?text={title}%20{url}',
      icon: <img src={WhatsappSVG} alt='Whatsapp' className='tw:w-4 tw:h-4' />,
      label: 'WhatsApp',
      bgColor: '#25D366',
    },
    telegram: {
      shareUrl: 'https://t.me/share/url?url={url}&text={title}',
      icon: <img src={TelegramSVG} alt='Telegram' className='tw:w-4 tw:h-4' />,
      label: 'Telegram',
      bgColor: '#0088cc',
    },
    xing: {
      shareUrl: 'https://www.xing-share.com/app/user?op=share;sc_p=xing-share;url={url}',
      icon: <img src={XingSVG} alt='Xing' className='tw:w-4 tw:h-4' />,
      label: 'Xing',
      bgColor: '#026466',
    },
  }

  return (
    <>
      {item.position?.coordinates && myProfile.myProfile?.id !== item.id && (
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
      {myProfile.myProfile?.id === item.id && (
        <button
          onClick={onQrModalOpen}
          className='tw:btn tw:mr-2 tw:px-3 tw:tooltip tw:tooltip-top'
          title='QR-Code'
          data-tip='QR Code'
        >
          <QrCodeIcon className='tw:h-4 tw:w-4' />
        </button>
      )}
      {myProfile.myProfile?.id !== item.id && (
        <div className='tw:dropdown tw:dropdown-end'>
          <div
            tabIndex={0}
            role='button'
            className='tw:btn tw:px-3 tw:tooltip tw:tooltip-top'
            data-tip='Share'
          >
            <ShareIcon className='tw:w-4 tw:h-4' />
          </div>
          <ul
            tabIndex={0}
            className='tw:dropdown-content tw:menu tw:bg-base-100 tw:rounded-box tw:z-[1] tw:p-2 tw:shadow-sm'
          >
            <li>
              <a
                onClick={copyLink}
                className='tw:flex tw:items-center tw:gap-3'
                style={{ color: 'inherit' }}
              >
                <div
                  className='tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center'
                  style={{ backgroundColor: '#888' }}
                >
                  <img src={ClipboardSVG} className='tw:w-3 tw:h-3' alt='Copy' />
                </div>
                Copy Link
              </a>
            </li>
            <li>
              <a
                href={`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`}
                className='tw:flex tw:items-center tw:gap-3'
                style={{ color: 'inherit' }}
              >
                <div
                  className='tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-white'
                  style={{ backgroundColor: '#444' }}
                >
                  <img src={ChevronSVG} className='tw:w-3 tw:h-3' alt='Copy' />
                </div>
                Email
              </a>
            </li>
            {Object.entries(platformConfigs).map(([platform, config]) => (
              <li key={platform}>
                <a
                  href={getShareUrl(platform as keyof SharePlatformConfigs, platformConfigs)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='tw:flex tw:items-center tw:gap-3'
                  style={{ color: 'inherit' }}
                >
                  <div
                    className='tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center'
                    style={{ backgroundColor: (config as PlatformConfig).bgColor }}
                  >
                    {(config as PlatformConfig).icon}
                  </div>
                  {(config as PlatformConfig).label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
