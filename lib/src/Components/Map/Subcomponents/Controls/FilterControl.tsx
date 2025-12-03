import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon'
import { useEffect, useState } from 'react'

import {
  useAddVisibleGroupType,
  useIsGroupTypeVisible,
  useToggleVisibleGroupType,
  useVisibleGroupType,
} from '#components/Map/hooks/useFilter'

export function FilterControl() {
  const [open, setOpen] = useState(false)

  const groupTypes = [
    { text: 'Regional Gruppe', value: 'Regional-Gruppe' },
    { text: 'Themen Gruppe', value: 'Themen-Gruppe' },
    { text: 'liebevoll.jetzt', value: 'liebevoll.jetzt' },
  ]

  useEffect(() => {
    groupTypes.map((layer) => {
      addVisibleGroupType(layer.value)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isGroupTypeVisible = useIsGroupTypeVisible()
  const toggleVisibleGroupType = useToggleVisibleGroupType()
  const addVisibleGroupType = useAddVisibleGroupType()
  const visibleGroupTypes = useVisibleGroupType()

  return (
    <div className='tw:card tw:bg-base-100 tw:shadow-xl tw:mt-2 tw:w-fit'>
      {open ? (
        <div className='tw:card-body tw:pr-4 tw:min-w-[8rem] tw:p-2 tw:w-fit tw:transition-all tw:duration-300'>
          <label
            className='tw:btn tw:btn-sm tw:rounded-2xl tw:btn-circle tw:btn-ghost tw:hover:bg-transparent tw:absolute tw:right-0 tw:top-0 tw:text-gray-600'
            onClick={() => {
              setOpen(false)
            }}
          >
            <p className='tw:text-center '>✕</p>
          </label>
          <ul className='tw:flex-row'>
            {groupTypes.map((groupType) => (
              <li key={groupType.value}>
                <label
                  htmlFor={groupType.value}
                  className='tw:label tw:justify-normal tw:pt-1 tw:pb-1'
                >
                  <input
                    id={groupType.value}
                    onChange={() => {
                      toggleVisibleGroupType(groupType.value)
                    }}
                    type='checkbox'
                    className='tw:checkbox tw:checkbox-xs tw:checkbox-success'
                    checked={isGroupTypeVisible(groupType.value)}
                  />
                  <span className='tw:text-sm tw:label-text tw:mx-2 tw:cursor-pointer'>
                    {groupType.text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className='tw:indicator'>
          {visibleGroupTypes.length < groupTypes.length && (
            <span className='tw:indicator-item tw:badge tw:badge-success tw:h-4 tw:p-2 tw:translate-x-1/3 tw:-translate-y-1/3 tw:border-0'></span>
          )}
          <div
            className='tw:card-body tw:hover:bg-slate-300 tw:card tw:p-2 tw:h-10 tw:w-10 tw:transition-all tw:duration-300 tw:hover:cursor-pointer'
            onClick={() => {
              setOpen(true)
            }}
          >
            <FunnelIcon className='size-6 tw:stroke-[2.5]' />
          </div>
        </div>
      )}
    </div>
  )
}
