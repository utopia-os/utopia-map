/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { DomEvent } from 'leaflet'
import { createRef, useEffect } from 'react'

export const Control = ({
  position,
  children,
  zIndex,
  absolute,
  showZoomControl = false,
}: {
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'
  children: React.ReactNode
  zIndex: string
  absolute: boolean
  showZoomControl?: boolean
}) => {
  const controlContainerRef = createRef<HTMLDivElement>()

  useEffect(() => {
    if (controlContainerRef.current !== null) {
      DomEvent.disableClickPropagation(controlContainerRef.current)
      DomEvent.disableScrollPropagation(controlContainerRef.current)
    }
  }, [controlContainerRef])

  // Calculate left position when zoom control is present
  const getLeftPosition = () => {
    if ((position === 'topLeft' || position === 'bottomLeft') && showZoomControl) {
      return 'tw:left-20' // Approximately 5rem (80px) to account for zoom control width
    }
    return position === 'topLeft' || position === 'bottomLeft' ? 'tw:left-4' : ''
  }

  return (
    <div
      ref={controlContainerRef}
      style={{ zIndex }}
      className={`${absolute && 'tw:absolute'} tw:z-999 tw:flex-col ${position === 'topLeft' && `tw:top-4 ${getLeftPosition()}`} ${position === 'bottomLeft' && `tw:bottom-4 ${getLeftPosition()}`} ${position === 'topRight' && 'tw:bottom-4 tw:right-4'} ${position === 'bottomRight' && 'tw:bottom-4 tw:right-4'}`}
    >
      {children}
    </div>
  )
}
