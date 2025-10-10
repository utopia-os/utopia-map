import EllipsisVerticalIcon from '@heroicons/react/16/solid/EllipsisVerticalIcon'
import PencilIcon from '@heroicons/react/24/solid/PencilIcon'
import TrashIcon from '@heroicons/react/24/solid/TrashIcon'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import TargetDotSVG from '#assets/targetDot.svg'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'

interface EditMenuProps {
  item: Item
  api?: ItemsApi<unknown>
  editCallback?: (e: React.MouseEvent) => void
  deleteCallback?: (e: React.MouseEvent) => void
  setPositionCallback?: () => void
  loading?: boolean
  hideMenu?: boolean
  big?: boolean
  onDeleteModalOpen: () => void
}

export function EditMenu({
  item,
  api,
  editCallback,
  deleteCallback,
  setPositionCallback,
  loading = false,
  hideMenu = false,
  big = false,
  onDeleteModalOpen,
}: EditMenuProps) {
  const hasUserPermission = useHasUserPermission()
  const navigate = useNavigate()

  const params = new URLSearchParams(window.location.search)

  const handleDeleteClick = (event: React.MouseEvent<HTMLElement>) => {
    onDeleteModalOpen()
    event.stopPropagation()
  }

  if (hideMenu) return null

  const hasDeletePermission =
    api?.deleteItem && api.collectionName && hasUserPermission(api.collectionName, 'delete', item)
  const hasUpdatePermission =
    api?.updateItem && api.collectionName && hasUserPermission(api.collectionName, 'update', item)

  if (!hasDeletePermission && !hasUpdatePermission) return null

  return (
    <div onClick={(e) => e.stopPropagation()} className={`${big ? 'tw:mt-5' : 'tw:mt-1'}`}>
      <div className='tw:dropdown tw:dropdown-bottom tw:dropdown-center'>
        <label tabIndex={0} className='tw:btn tw:btn-ghost tw:px-2.5'>
          <EllipsisVerticalIcon className='tw:h-5 tw:w-5' />
        </label>
        <ul
          tabIndex={0}
          className='tw:dropdown-content tw:menu tw:p-2 tw:shadow tw:bg-base-100 tw:rounded-box tw:z-1000'
        >
          {hasUpdatePermission && editCallback && (
            <li>
              <a
                className='tw:text-base-content! tw:tooltip tw:tooltip-top tw:cursor-pointer'
                data-tip='Edit'
                onClick={(e) =>
                  item.layer?.customEditLink
                    ? navigate(
                        `${item.layer.customEditLink}${item.layer.customEditParameter ? `/${item.id}${params.toString() ? '?' + params.toString() : ''}` : ''}`,
                      )
                    : editCallback(e)
                }
              >
                <PencilIcon className='tw:h-5 tw:w-5' />
              </a>
            </li>
          )}
          {hasUpdatePermission && setPositionCallback && (
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
          {hasDeletePermission && deleteCallback && (
            <li>
              <a
                className='tw:text-error! tw:tooltip tw:tooltip-top tw:cursor-pointer'
                data-tip='Delete'
                onClick={handleDeleteClick}
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
    </div>
  )
}
