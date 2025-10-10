import SocialShareBar from './SocialShareBar'

import type { Item } from '#types/Item'

export const GroupSubHeaderView = ({
  item,
  shareBaseUrl,
  platforms,
}: {
  item: Item
  shareBaseUrl: string
  platforms?: string[]
}) => (
  <div className='tw:px-6'>
    <div className='tw:float-left tw:mt-2 tw:mb-4 tw:flex tw:items-center'>
      {item.status && (
        <div className='tw:mt-1.5'>
          <span className='tw:text-sm tw:text-current tw:bg-base-300 tw:rounded tw:py-0.5 tw:px-2 tw:inline-flex tw:items-center tw:mr-2'>
            {item.status}
          </span>
        </div>
      )}
      {item.group_type && (
        <div className='tw:mt-1.5'>
          <span className='tw:text-sm tw:text-current tw:bg-base-300 tw:rounded tw:py-1 tw:px-2'>
            {item.group_type}
          </span>
        </div>
      )}
    </div>
    <div>
      <SocialShareBar
        url={
          shareBaseUrl && item.slug
            ? shareBaseUrl + item.slug
            : window.location.protocol + '//' + window.location.host + '/item/' + item.id
        }
        title={item.name ?? ''}
        platforms={platforms}
      />
    </div>
  </div>
)
