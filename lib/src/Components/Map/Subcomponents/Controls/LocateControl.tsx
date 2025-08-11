import { control } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'
import { useMap, useMapEvents } from 'react-leaflet'

import TargetSVG from '#assets/target.svg'

// eslint-disable-next-line import/no-unassigned-import
import 'leaflet.locatecontrol'

// Type definitions for leaflet.locatecontrol
declare module 'leaflet' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace control {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function locate(options?: object): any
  }
}

/**
 * React wrapper for leaflet.locatecontrol that provides user geolocation functionality
 * @category Map Controls
 */
export const LocateControl = (): JSX.Element => {
  const map = useMap()

  // Prevent React 18 StrictMode from calling useEffect twice
  const init = useRef(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
  const [lc, setLc] = useState<any>(null)
  const [active, setActive] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    if (!init.current) {
      setLc(control.locate().addTo(map))
      init.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useMapEvents({
    locationfound: () => {
      setLoading(false)
      setActive(true)
    },
    locationerror: () => {
      setLoading(false)
      setActive(false)
    },
  })

  const handleLocateClick = (): void => {
    if (!lc) return

    if (active) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      lc.stop()
      setActive(false)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      lc.start()
      setLoading(true)
    }
  }

  return (
    <div className='tw:card tw:flex-none tw:h-12 tw:w-12 tw:bg-base-100 tw:shadow-xl tw:items-center tw:justify-center tw:hover:bg-slate-300 tw:hover:cursor-pointer tw:transition-all tw:duration-300 tw:ml-2'>
      <div
        className='tw:card-body tw:card tw:p-2 tw:h-10 tw:w-10'
        onClick={handleLocateClick}
        role='button'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleLocateClick()
          }
        }}
        aria-label={active ? 'Stop location tracking' : 'Start location tracking'}
      >
        {loading ? (
          <span className='tw:loading tw:loading-spinner tw:loading-md tw:mt-1' />
        ) : (
          <SVG
            src={TargetSVG}
            className='tw:mt-1 tw:p-[1px]'
            style={{ fill: active ? '#fc8702' : 'currentColor' }}
          />
        )}
      </div>
    </div>
  )
}
