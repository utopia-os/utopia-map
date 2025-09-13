/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import EllipsisVerticalIcon from '@heroicons/react/16/solid/EllipsisVerticalIcon'
import { MapPinIcon, ShareIcon } from '@heroicons/react/24/solid'
import PencilIcon from '@heroicons/react/24/solid/PencilIcon'
import TrashIcon from '@heroicons/react/24/solid/TrashIcon'
import { useState } from 'react'
import { LuNavigation } from 'react-icons/lu'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import ChevronSVG from '#assets/chevron.svg'
import ClipboardSVG from '#assets/share/clipboard.svg'
import FacebookSVG from '#assets/share/facebook.svg'
import LinkedinSVG from '#assets/share/linkedin.svg'
import TelegramSVG from '#assets/share/telegram.svg'
import TwitterSVG from '#assets/share/twitter.svg'
import WhatsappSVG from '#assets/share/whatsapp.svg'
import XingSVG from '#assets/share/xing.svg'
import TargetDotSVG from '#assets/targetDot.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useGeoDistance } from '#components/Map/hooks/useGeoDistance'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import { useReverseGeocode } from '#components/Map/hooks/useReverseGeocode'
import { useGetItemTags } from '#components/Map/hooks/useTags'
import DialogModal from '#components/Templates/DialogModal'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'

export function HeaderView({
  item,
  api,
  editCallback,
  deleteCallback,
  setPositionCallback,
  loading,
  hideMenu = false,
  big = false,
  truncateSubname = true,
  hideSubname = false,
  showAddress = true,
}: {
  item?: Item
  api?: ItemsApi<any>
  editCallback?: any
  deleteCallback?: any
  setPositionCallback?: any
  loading?: boolean
  hideMenu?: boolean
  big?: boolean
  hideSubname?: boolean
  truncateSubname?: boolean
  showAddress?: boolean
}) {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  const hasUserPermission = useHasUserPermission()
  const navigate = useNavigate()
  const appState = useAppState()
  const getItemTags = useGetItemTags()
  const [imageLoaded, setImageLoaded] = useState(false)
  const { distance } = useGeoDistance(item?.position ?? undefined)

  const avatar =
    (item?.image && appState.assetsApi.url + item.image + '?width=160&heigth=160') ||
    item?.image_external
  const title = item?.name ?? item?.layer?.item_default_name
  const subtitle = item?.subname

  const { address } = useReverseGeocode(
    item?.position?.coordinates as [number, number] | undefined,
    showAddress,
  )

  const params = new URLSearchParams(window.location.search)

  const formatDistance = (dist: number | null): string | null => {
    if (!dist) return null
    return dist < 10 ? `${dist.toFixed(1)} km` : `${Math.round(dist)} km`
  }

  const platformConfigs = {
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

  const shareUrl = window.location.href
  const shareTitle = item?.name ?? 'Utopia Map Item'

  const copyLink = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success('Link copied to clipboard')
        return null
      })
      .catch(() => {
        toast.error('Error copying link')
      })
  }

  const getShareUrl = (platform: keyof typeof platformConfigs) => {
    const config = platformConfigs[platform]
    return config.shareUrl
      .replace('{url}', encodeURIComponent(shareUrl))
      .replace('{title}', encodeURIComponent(shareTitle))
  }

  const coordinates = item?.position?.coordinates
  const latitude = coordinates?.[1]
  const longitude = coordinates?.[0]

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )

  const getNavigationUrl = () => {
    if (!coordinates || !latitude || !longitude) return ''

    // Try geo: link first (works on most mobile devices)
    if (isMobile) {
      return `geo:${latitude},${longitude}`
    }

    // Fallback to web-based maps
    if (isIOS) {
      return `https://maps.apple.com/?daddr=${latitude},${longitude}`
    } else {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    }
  }

  const openDeleteModal = async (event: React.MouseEvent<HTMLElement>) => {
    setModalOpen(true)
    event.stopPropagation()
  }
  if (!item) return null
  return (
    <>
      <div className='tw:flex tw:flex-row'>
        <div className={'tw:grow tw:flex tw:flex-1 tw:min-w-0'}>
          <div className='tw:flex tw:flex-1 tw:min-w-0 tw:items-center'>
            {avatar && (
              <div className='tw:avatar'>
                <div
                  className={`${
                    big ? 'tw:w-16' : 'tw:w-10'
                  } tw:inline tw:items-center tw:justify-center tw:overflow-visible`}
                >
                  <img
                    className={
                      'tw:w-full tw:h-full tw:object-cover tw:rounded-full tw:border-white'
                    }
                    src={avatar}
                    alt={item.name + ' logo'}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(false)}
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                  />
                  {!imageLoaded && (
                    <div className='tw:w-full tw:h-full tw:bg-gray-200 tw:rounded-full' />
                  )}
                </div>
              </div>
            )}
            <div className={`${avatar ? 'tw:ml-3' : ''} tw:overflow-hidden tw:flex-1 tw:min-w-0 `}>
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
                  </span>
                </div>
              )}
              {subtitle && !showAddress && (
                <div
                  className={`tw:text-sm tw:opacity-50 tw:items-center ${truncateSubname && 'tw:truncate'}`}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className={`${big ? 'tw:mt-5' : 'tw:mt-1'}`}>
          {(api?.deleteItem || item.layer?.api?.updateItem) &&
            (hasUserPermission(api?.collectionName!, 'delete', item) ||
              hasUserPermission(api?.collectionName!, 'update', item)) &&
            !hideMenu && (
              <div className='tw:dropdown tw:dropdown-bottom tw:dropdown-center'>
                <label tabIndex={0} className='tw:btn tw:px-3'>
                  <EllipsisVerticalIcon className='tw:h-4 tw:w-4' />
                </label>
                <ul
                  tabIndex={0}
                  className='tw:dropdown-content tw:menu tw:p-2 tw:shadow tw:bg-base-100 tw:rounded-box tw:z-1000'
                >
                  {api?.updateItem &&
                    hasUserPermission(api.collectionName!, 'update', item) &&
                    editCallback && (
                      <li>
                        <a
                          className='tw:text-base-content! tw:tooltip tw:tooltip-top tw:cursor-pointer'
                          data-tip='Edit'
                          onClick={(e) =>
                            item.layer?.customEditLink
                              ? navigate(
                                  `${item.layer.customEditLink}${item.layer.customEditParameter ? `/${item.id}${params && '?' + params}` : ''} `,
                                )
                              : editCallback(e)
                          }
                        >
                          <PencilIcon className='tw:h-5 tw:w-5' />
                        </a>
                      </li>
                    )}
                  {api?.updateItem &&
                    hasUserPermission(api.collectionName!, 'update', item) &&
                    setPositionCallback && (
                      <li>
                        <a
                          className='tw:text-base-content! tw:tooltip tw:tooltip-top tw:cursor-pointer'
                          data-tip='Set position'
                          onClick={setPositionCallback}
                        >
                          <SVG src={TargetDotSVG} className='tw:w-5 tw:h-5' />
                        </a>
                      </li>
                    )}
                  {api?.deleteItem &&
                    hasUserPermission(api.collectionName!, 'delete', item) &&
                    deleteCallback && (
                      <li>
                        <a
                          className='tw:text-error! tw:tooltip tw:tooltip-top tw:cursor-pointer'
                          data-tip='Delete'
                          onClick={openDeleteModal}
                        >
                          {loading ? (
                            <span className='tw:loading tw:loading-spinner tw:loading-sm'></span>
                          ) : (
                            <TrashIcon className='tw:h-5 tw:w-5' />
                          )}
                        </a>
                      </li>
                    )}
                </ul>
              </div>
            )}
        </div>
      </div>
      {big && (
        <div className='tw:flex tw:row tw:mt-2 '>
          <div className='tw:w-16 tw:text-center tw:font-bold tw:text-primary  '>
            {' '}
            {formatDistance(distance) && (
              <span
                style={{
                  color: `${item?.color ?? (item && (getItemTags(item) && getItemTags(item)[0] && getItemTags(item)[0].color ? getItemTags(item)[0].color : (item?.layer?.markerDefaultColor ?? '#000')))}`,
                }}
              >
                {formatDistance(distance)}
              </span>
            )}
          </div>
          <div className='tw:grow'></div>
          <div className=''>
            <button
              style={{
                backgroundColor: `${item?.color ?? (item && (getItemTags(item) && getItemTags(item)[0] && getItemTags(item)[0].color ? getItemTags(item)[0].color : (item?.layer?.markerDefaultColor ?? '#000')))}`,
              }}
              className='tw:btn tw:text-white tw:mr-2 '
            >
              {item.layer?.itemType.cta_button_label ?? 'Follow'}
            </button>
            {item?.position?.coordinates ? (
              <a
                href={getNavigationUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='tw:btn tw:mr-2 tw:px-3 tw:no-underline hover:tw:no-underline'
                style={{ color: 'inherit' }}
                title={`Navigate with ${isMobile ? 'default navigation app' : isIOS ? 'Apple Maps' : 'Google Maps'}`}
              >
                <LuNavigation className='tw:h-4 tw:w-4' />
              </a>
            ) : (
              <div className='tw:btn tw:mr-2 tw:px-3 tw:btn-disabled'>
                <LuNavigation className='tw:h-4 tw:w-4' />
              </div>
            )}
            <div className='tw:dropdown tw:dropdown-end'>
              <div tabIndex={0} role='button' className='tw:btn tw:px-3'>
                <ShareIcon className='tw:w-4 tw:h-4' />
              </div>
              <ul
                tabIndex={0}
                className='tw:dropdown-content tw:menu tw:bg-base-100 tw:rounded-box tw:z-[1] tw:p-2 tw:shadow-sm'
              >
                <li>
                  <a onClick={copyLink} className='tw:flex tw:items-center tw:gap-3'>
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
                      href={getShareUrl(platform as keyof typeof platformConfigs)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='tw:flex tw:items-center tw:gap-3'
                    >
                      <div
                        className='tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center'
                        style={{ backgroundColor: config.bgColor }}
                      >
                        {config.icon}
                      </div>
                      {config.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <DialogModal
        isOpened={modalOpen}
        title='Are you sure?'
        showCloseButton={false}
        onClose={() => setModalOpen(false)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <span>
            Do you want to delete <b>{item.name}</b>?
          </span>
          <div className='tw:grid'>
            <div className='tw:flex tw:justify-between'>
              <label
                className='tw:btn tw:mt-4 tw:btn-error'
                onClick={(e) => {
                  deleteCallback(e)
                  setModalOpen(false)
                }}
              >
                Yes
              </label>
              <label className='tw:btn tw:mt-4' onClick={() => setModalOpen(false)}>
                No
              </label>
            </div>
          </div>
        </div>
      </DialogModal>
    </>
  )
}
