/* eslint-disable import/default */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from 'date-fns'
import React, { useState } from 'react'
import { MapOverlayPage } from 'utopia-ui'

export const Calendar = () => {
  const today = startOfToday()
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const colStartClasses = [
    '',
    'col-start-2',
    'col-start-3',
    'col-start-4',
    'col-start-5',
    'col-start-6',
    'col-start-7',
  ]

  const [currMonth, setCurrMonth] = useState(() => format(today, 'MMM-yyyy'))
  const firstDayOfMonth = parse(currMonth, 'MMM-yyyy', new Date())

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(firstDayOfMonth),
    end: endOfWeek(endOfMonth(firstDayOfMonth)),
  })

  const getPrevMonth = (event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault()
    const firstDayOfPrevMonth = add(firstDayOfMonth, { months: -1 })
    setCurrMonth(format(firstDayOfPrevMonth, 'MMM-yyyy'))
  }

  const getNextMonth = (event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault()
    const firstDayOfNextMonth = add(firstDayOfMonth, { months: 1 })
    setCurrMonth(format(firstDayOfNextMonth, 'MMM-yyyy'))
  }

  return (
    <MapOverlayPage
      backdrop
      className='tw-max-h-[calc(100dvh-96px)] tw-h-fit md:tw-w-[calc(50%-32px)] tw-w-[calc(100%-32px)] max-w-lg'
    >
      <div className='flex items-center justify-between'>
        <p className='font-semibold text-xl'>{format(firstDayOfMonth, 'MMMM yyyy')}</p>
        <div className='flex items-center justify-evenly gap-6 sm:gap-12'>
          <ChevronLeftIcon className='w-6 h-6 cursor-pointer' onClick={getPrevMonth} />
          <ChevronRightIcon className='w-6 h-6 cursor-pointer' onClick={getNextMonth} />
        </div>
      </div>
      <hr className='my-6' />
      <div className='grid grid-cols-7 gap-6 sm:gap-12 place-items-center'>
        {days.map((day, idx) => {
          return (
            <div key={idx} className='font-semibold'>
              {capitalizeFirstLetter(day)}
            </div>
          )
        })}
      </div>
      <div className='grid grid-cols-7 gap-4 sm:gap-12 mt-8 place-items-center'>
        {daysInMonth.map((day, idx) => {
          return (
            <div key={idx} className={colStartClasses[getDay(day)]}>
              <p
                className={`cursor-pointer flex items-center justify-center font-semibold h-8 w-8 rounded-full  hover:text-white ${
                  isSameMonth(day, today) ? 'text-current' : 'text-gray-500'
                } ${!isToday(day) && 'hover:bg-primary-content'} ${
                  isToday(day) && 'bg-primary !text-white'
                }`}
              >
                {format(day, 'd')}
              </p>
            </div>
          )
        })}
      </div>
    </MapOverlayPage>
  )
}

const capitalizeFirstLetter = (string: string) => {
  return string
}
