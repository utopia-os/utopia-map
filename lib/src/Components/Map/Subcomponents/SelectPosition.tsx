import { DomEvent } from 'leaflet'
import { useEffect, useRef } from 'react'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'

export const SelectPosition = ({
  setSelectNewItemPosition,
  selectNewItemPosition,
}: {
  setSelectNewItemPosition: React.Dispatch<React.SetStateAction<Item | LayerProps | null>>
  selectNewItemPosition?: Item | LayerProps | null
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      DomEvent.disableClickPropagation(containerRef.current)
      DomEvent.disableScrollPropagation(containerRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className='tw:animate-pulseGrow tw:button tw:z-1000 tw:absolute tw:right-5 tw:top-4 tw:drop-shadow-md'
    >
      <label
        className='tw:btn tw:btn-sm tw:rounded-2xl tw:btn-circle tw:btn-ghost tw:hover:bg-transparent tw:absolute tw:right-0 tw:top-0 tw:text-gray-600'
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setSelectNewItemPosition(null)
        }}
      >
        <p className='tw:text-center '>✕</p>
      </label>
      <div className='tw:alert tw:bg-base-100 tw:text-base-content'>
        <div>
          {selectNewItemPosition && 'layer' in selectNewItemPosition && (
            <span className='tw:text-lg'>
              Select new position of <b>{selectNewItemPosition.name}</b> on the map!
            </span>
          )}
          {selectNewItemPosition && 'markerIcon' in selectNewItemPosition && (
            <span className='tw:text-lg'>Select position on the map!</span>
          )}
        </div>
      </div>
    </div>
  )
}
