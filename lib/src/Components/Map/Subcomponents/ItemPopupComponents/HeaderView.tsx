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
import { MapPinIcon, ShareIcon } from '@heroicons/react/24/outline'
import PencilIcon from '@heroicons/react/24/solid/PencilIcon'
import TrashIcon from '@heroicons/react/24/solid/TrashIcon'
import { useState } from 'react'
import { LuNavigation } from 'react-icons/lu'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import TargetDotSVG from '#assets/targetDot.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useGeoDistance } from '#components/Map/hooks/useGeoDistance'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
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
  showAddress = false,
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
  const title = item?.name
  const subtitle = item?.subname

  const [address] = useState<string>('')

  const params = new URLSearchParams(window.location.search)

  const formatDistance = (dist: number | null): string | null => {
    if (!dist) return null
    return dist < 10 ? `${dist.toFixed(1)} km` : `${Math.round(dist)} km`
  }

  const openDeleteModal = async (event: React.MouseEvent<HTMLElement>) => {
    setModalOpen(true)
    event.stopPropagation()
  }
  if (!item) return null
  return (
    <>
      <div className='tw:flex tw:flex-row'>
        <div className={'tw:grow tw:max-w-[calc(100%-60px)] }'}>
          <div className='tw:flex tw:items-center'>
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
            <div className={`${avatar ? 'tw:ml-3' : ''} tw:overflow-hidden `}>
              <div
                className={`${big ? 'tw:xl:text-3xl tw:text-2xl' : 'tw:text-xl'} tw:font-bold tw:truncate`}
                title={title}
              >
                {title}
              </div>
              {showAddress && address && !hideSubname && (
                <div className={`tw:text-xs  tw:text-gray-500 ${truncateSubname && 'tw:truncate'}`}>
                  {address}
                </div>
              )}
              {subtitle && !hideSubname && (
                <div
                  className={`tw:text-xs tw:opacity-50 tw:inline-flex tw:items-center ${truncateSubname && 'tw:truncate'}`}
                >
                  <MapPinIcon className='tw:w-4 tw:mr-1' /> {subtitle}
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
              <div className='tw:dropdown tw:dropdown-bottom'>
                <label
                  tabIndex={0}
                  className='tw:bg-base-100 tw:btn tw:m-1 tw:leading-3 tw:border-none tw:min-h-0 tw:h-6'
                >
                  <EllipsisVerticalIcon className='tw:h-5 tw:w-5' />
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
                          className='tw:text-base-content! tw:tooltip tw:tooltip-right tw:cursor-pointer'
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
                          className='tw:text-base-content! tw:tooltip tw:tooltip-right tw:cursor-pointer'
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
                          className='tw:text-error! tw:tooltip tw:tooltip-right tw:cursor-pointer'
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
              className='tw:btn tw:text-white tw:btn-sm tw:mr-2 '
            >
              Follow
            </button>
            <div className='tw:btn tw:btn-sm tw:mr-2 tw:px-2'>
              <LuNavigation className='tw:h-4 tw:w-4' />
            </div>
            <div className='tw:btn tw:btn-sm tw:px-2'>
              <ShareIcon className='tw:w-4 tw:h-4' />
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
