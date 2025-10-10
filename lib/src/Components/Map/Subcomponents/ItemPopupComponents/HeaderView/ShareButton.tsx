import { useRef } from 'react'

import { ShareIcon } from '@heroicons/react/24/solid'

import ChevronSVG from '#assets/chevron.svg'
import ClipboardSVG from '#assets/share/clipboard.svg'
import FacebookSVG from '#assets/share/facebook.svg'
import LinkedinSVG from '#assets/share/linkedin.svg'
import TelegramSVG from '#assets/share/telegram.svg'
import TwitterSVG from '#assets/share/twitter.svg'
import WhatsappSVG from '#assets/share/whatsapp.svg'
import XingSVG from '#assets/share/xing.svg'

import { useShareLogic } from './hooks'

import type { Item } from '#types/Item'
import type { PlatformConfig, SharePlatformConfigs } from './types'

interface ShareButtonProps {
  item: Item
  dropdownDirection?: 'up' | 'down'
}

export function ShareButton({ item, dropdownDirection = 'down' }: ShareButtonProps) {
  const { shareUrl, shareTitle, copyLink, getShareUrl } = useShareLogic(item)
  const detailsRef = useRef<HTMLDetailsElement>(null)

  const closeDropdown = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  const handleCopyLink = () => {
    copyLink()
    closeDropdown()
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        })
        closeDropdown()
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error)
      }
    }
  }

  const canUseNativeShare = typeof navigator !== 'undefined' && navigator.share

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

  const dropdownClass = dropdownDirection === 'up' ? 'tw:dropdown-top' : ''

  // If native share is available, render a simple button instead of dropdown
  if (canUseNativeShare) {
    return (
      <button
        onClick={handleNativeShare}
        className='tw:btn tw:px-3 tw:tooltip tw:tooltip-top'
        data-tip='Share'
      >
        <ShareIcon className='tw:w-4 tw:h-4' />
      </button>
    )
  }

  // Otherwise, render the dropdown with manual share options
  return (
    <details ref={detailsRef} className={`tw:dropdown tw:dropdown-end ${dropdownClass}`}>
      <summary className='tw:btn tw:px-3 tw:tooltip tw:tooltip-top' data-tip='Share'>
        <ShareIcon className='tw:w-4 tw:h-4' />
      </summary>
      <ul className='tw:dropdown-content tw:menu tw:bg-base-100 tw:rounded-box tw:z-[1] tw:p-2 tw:shadow-sm'>
        <li>
          <a
            onClick={handleCopyLink}
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
            onClick={closeDropdown}
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
              onClick={closeDropdown}
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
    </details>
  )
}
