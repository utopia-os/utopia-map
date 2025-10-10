/* eslint-disable @typescript-eslint/prefer-optional-chain */
import CalendarIcon from '@heroicons/react/24/solid/CalendarDaysIcon'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const StartEndView = ({ item }: { item?: Item }) => {
  return (
    <div className='tw:flex tw:flex-row tw:mb-2.5 tw:mt-2.5 tw:bg-base-200 tw:px-3 tw:py-2.5 tw:rounded-selector tw:w-full'>
      <div className='tw:basis-2/5 tw:flex tw:flex-row tw:items-center tw:font-bold'>
        <CalendarIcon className='tw:h-5 tw:w-5 tw:mr-2' />
        <time dateTime={item && item.start ? item.start.substring(0, 10) : ''}>
          {item && item.start ? new Date(item.start).toLocaleDateString() : ''}
        </time>
      </div>
      <div className='tw:basis-1/5 tw:flex tw:items-center tw:justify-center'>
        <span>-</span>
      </div>
      <div className='tw:basis-2/5 tw:flex tw:flex-row tw:items-center tw:font-bold'>
        <CalendarIcon className='tw:h-5 tw:w-5 tw:mr-2' />
        <time dateTime={item && item.end ? item.end.substring(0, 10) : ''}>
          {item && item.end ? new Date(item.end).toLocaleDateString() : ''}
        </time>
      </div>
    </div>
  )
}
