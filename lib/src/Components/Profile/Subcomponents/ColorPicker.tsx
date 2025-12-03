/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useCallback, useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'

import useClickOutside from '#components/Profile/hooks/useClickOutside'

// eslint-disable-next-line react/prop-types
export const ColorPicker = ({ color, onChange, className }) => {
  const popover = useRef<HTMLDivElement>(null)
  const [isOpen, toggle] = useState(false)

  const close = useCallback(() => {
    toggle(false)
  }, [])
  useClickOutside(popover, close)

  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Füge dem Color-Picker explizit Event-Listener hinzu
    const colorPickerElement = colorPickerRef.current
    if (colorPickerElement) {
      const enablePropagation = (event) => {
        // Verhindere, dass Leaflet die Propagation stoppt
        event.stopPropagation = () => {}
      }

      // Event-Listener für den Color-Picker
      ;['click', 'dblclick', 'mousedown', 'touchstart'].forEach((eventType) => {
        colorPickerElement.addEventListener(eventType, enablePropagation, true)
      })
    }
  }, [])

  return (
    <div ref={colorPickerRef} className={`picker ${className}`}>
      <div
        className='swatch'
        style={{ backgroundColor: color }}
        onClick={() => {
          toggle(true)
        }}
      />

      {isOpen && (
        <div className='popover tw:z-10000' ref={popover}>
          <HexColorPicker
            color={color}
            onChange={onChange}
            onClick={() => {
              toggle(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
