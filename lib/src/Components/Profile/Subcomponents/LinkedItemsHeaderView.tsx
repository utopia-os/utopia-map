/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import EllipsisVerticalIcon from '@heroicons/react/16/solid/EllipsisVerticalIcon'
import LinkSlashIcon from '@heroicons/react/24/outline/LinkSlashIcon'
import { useEffect } from 'react'

import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'

export function LinkedItemsHeaderView({
  item,
  unlinkCallback,
  loading,
  unlinkPermission,
}: {
  item: Item
  unlinkCallback?: any
  loading?: boolean
  unlinkPermission: boolean
}) {
  const appState = useAppState()

  const avatar = item.image ? appState.assetsApi.url + item.image : null
  const title = item.name
  const subtitle = item.subname

  useEffect(() => {}, [item])

  return (
    <>
      <div className='tw:flex tw:flex-row'>
        <div className={'tw:grow tw:max-w-[calc(100%-60px)] }'}>
          <div className='flex items-center'>
            {avatar && (
              <img
                className={'tw:w-10 tw:inline tw:rounded-full'}
                src={avatar}
                alt={item.name ?? '' + ' logo'}
              />
            )}
            <div className={`${avatar ? 'tw:ml-2' : ''} tw:overflow-hidden`}>
              <div className={'tw:text-xl tw:font-semibold tw:truncate'}>{title}</div>
              {subtitle && (
                <div className='tw:text-xs tw:truncate  tw:text-gray-500 '>{subtitle}</div>
              )}
            </div>
          </div>
        </div>
        <div className='tw:col-span-1' onClick={(e) => e.stopPropagation()}>
          {unlinkPermission && (
            <div className='tw:dropdown tw:dropdown-bottom'>
              <label
                tabIndex={0}
                className=' tw:btn tw:m-1 tw:leading-3 tw:border-none tw:min-h-0 tw:h-6'
              >
                <EllipsisVerticalIcon className='tw:h-5 tw:w-5' />
              </label>
              <ul
                tabIndex={0}
                className='tw:dropdown-content tw:menu tw:p-2 tw:shadow tw:bg-base-100 tw:rounded-box tw:z-1000'
              >
                {true && (
                  <li>
                    <a
                      className='tw:cursor-pointer tw:text-error!'
                      onClick={() => unlinkCallback(item.id)}
                    >
                      {loading ? (
                        <span className='tw:loading tw:loading-spinner tw:loading-sm'></span>
                      ) : (
                        <LinkSlashIcon className='tw:h-5 tw:w-5 tw:stroke-3' />
                      )}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
