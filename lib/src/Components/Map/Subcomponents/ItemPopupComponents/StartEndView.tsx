/* eslint-disable @typescript-eslint/prefer-optional-chain */
import CalendarIcon from '@heroicons/react/24/solid/CalendarDaysIcon'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const StartEndView = ({ item }: { item?: Item }) => {
  return (
    <div className='tw:flex tw:flex-row tw:mb-4 tw:mt-4'>
      <div className='tw:basis-2/5 tw:flex tw:flex-row'>
        <CalendarIcon className='tw:h-4 tw:w-4 tw:mr-2' />
        <time
          className='tw:align-middle'
          dateTime={item && item.start ? item.start.substring(0, 10) : ''}
        >
          {item && item.start ? new Date(item.start).toLocaleDateString() : ''}
        </time>
      </div>
      <div className='tw:basis-1/5 tw:place-content-center'>
        <span>-</span>
      </div>
      <div className='tw:basis-2/5 tw:flex tw:flex-row'>
        <CalendarIcon className='tw:h-4 tw:w-4 tw:mr-2' />
        <time
          className='tw:align-middle'
          dateTime={item && item.end ? item.end.substring(0, 10) : ''}
        >
          {item && item.end ? new Date(item.end).toLocaleDateString() : ''}
        </time>
      </div>
    </div>
  )
}
