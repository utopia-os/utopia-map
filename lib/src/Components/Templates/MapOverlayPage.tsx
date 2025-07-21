import { DomEvent } from 'leaflet'
import { createRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * @category Templates
 */
export function MapOverlayPage({
  children,
  className,
  backdrop,
  card = true,
  showCloseButton = true,
  closeButtonUrl,
}: {
  children: React.ReactNode
  className?: string
  backdrop?: boolean
  card?: boolean
  showCloseButton?: boolean
  closeButtonUrl?: string
}) {
  const closeScreen = () => {
    navigate(closeButtonUrl ?? `/${window.location.search ? window.location.search : ''}`)
  }

  const navigate = useNavigate()

  const overlayRef = createRef<HTMLDivElement>()
  const backdropRef = createRef<HTMLDivElement>()

  useEffect(() => {
    if (overlayRef.current !== null) {
      DomEvent.disableClickPropagation(overlayRef.current)
      DomEvent.disableScrollPropagation(overlayRef.current)
    }
    if (backdropRef.current !== null && backdrop) {
      DomEvent.disableClickPropagation(backdropRef.current)
      DomEvent.disableScrollPropagation(backdropRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayRef, backdropRef])

  return (
    <div className={`tw:absolute tw:h-full tw:w-full tw:m-auto ${backdrop ? 'tw:z-2000' : ''}`}>
      <div
        ref={backdropRef}
        className={`${backdrop ? 'tw:backdrop-brightness-75' : ''} tw:h-full tw:w-full tw:grid tw:place-items-center tw:m-auto`}
      >
        <div
          ref={overlayRef}
          className={`${card ? 'tw:card tw:card-body tw:shadow-xl' : ''} tw:bg-base-100 tw:p-6 ${className ?? ''} ${backdrop ? '' : 'tw:z-2000'} tw:absolute tw:top-0 tw:bottom-0 tw:right-0 tw:left-0 tw:m-auto`}
        >
          {children}
          {showCloseButton && (
            <button
              className='tw:btn tw:btn-sm tw:btn-circle tw:btn-ghost tw:absolute tw:right-2 tw:top-2'
              onClick={() => closeScreen()}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
