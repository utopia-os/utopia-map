import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'

interface SelectPositionToastProps {
  selectNewItemPosition: Item | LayerProps | null
  setSelectNewItemPosition: React.Dispatch<React.SetStateAction<Item | LayerProps | null>>
}

export const SelectPositionToast = ({
  selectNewItemPosition,
  setSelectNewItemPosition,
}: SelectPositionToastProps) => {
  const toastIdRef = useRef<string | number | null>(null)

  // Escape-Key Listener
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectNewItemPosition) {
        toast.dismiss('select-position-toast')
        toastIdRef.current = null
        setSelectNewItemPosition(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectNewItemPosition, setSelectNewItemPosition])

  useEffect(() => {
    if (selectNewItemPosition && !toastIdRef.current) {
      let message = ''
      if ('layer' in selectNewItemPosition) {
        message = `Select the new position of ${selectNewItemPosition.name} on the map!`
      } else if ('markerIcon' in selectNewItemPosition) {
        message = 'Select the position on the map!'
      }

      const CloseButton = () => (
        <button
          onClick={() => {
            toast.dismiss('select-position-toast')
            toastIdRef.current = null
            setSelectNewItemPosition(null)
          }}
          className='tw:btn tw:btn-sm tw:btn-ghost tw:btn-circle tw:absolute tw:top-0 tw:right-0'
        >
          ✕
        </button>
      )

      toastIdRef.current = toast(
        <div>
          {message}
          <CloseButton />
        </div>,
        {
          toastId: 'select-position-toast',
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
        },
      )
    }

    if (!selectNewItemPosition && toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }, [selectNewItemPosition, setSelectNewItemPosition])

  return null
}
