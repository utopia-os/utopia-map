import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'react-toastify'

import { SVG } from '#components/AppShell'
import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'
import type { Dispatch, SetStateAction } from 'react'

const isItemSelection = (value: Item | LayerProps): value is Item => 'layer' in value

interface SelectPositionToastProps {
  selectNewItemPosition: Item | LayerProps | null
  setSelectNewItemPosition: Dispatch<SetStateAction<Item | LayerProps | null>>
}

export const SelectPositionToast = ({
  selectNewItemPosition,
  setSelectNewItemPosition,
}: SelectPositionToastProps) => {
  const toastIdRef = useRef<string | number | null>(null)
  const toastId = 'select-position-toast'
  const appState = useAppState()

  // Escape-Key Listener
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectNewItemPosition) {
        toast.dismiss(toastId)
        toastIdRef.current = null
        setSelectNewItemPosition(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectNewItemPosition, setSelectNewItemPosition])

  const toastContent = useMemo(() => {
    if (!selectNewItemPosition) return null

    const itemSelection = isItemSelection(selectNewItemPosition)
    const layer: LayerProps | null = itemSelection
      ? (selectNewItemPosition.layer ?? null)
      : selectNewItemPosition
    const markerIcon = itemSelection
      ? (selectNewItemPosition.layer?.markerIcon ?? selectNewItemPosition.markerIcon)
      : selectNewItemPosition.markerIcon
    const message = itemSelection
      ? `Select the new position of ${selectNewItemPosition.name} on the map!`
      : 'Select the position on the map!'

    const dismissToast = () => {
      toast.dismiss(toastId)
      toastIdRef.current = null
      setSelectNewItemPosition(null)
    }

    const assetsApiUrl = appState.assetsApi.url
    const assetsBaseUrl: string | undefined = assetsApiUrl.length > 0 ? assetsApiUrl : undefined

    const resolveColor = (...candidates: (string | null | undefined)[]): string => {
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.length > 0) {
          return candidate
        }
      }
      return '#777'
    }

    const itemColor =
      itemSelection && typeof selectNewItemPosition.color === 'string'
        ? selectNewItemPosition.color
        : undefined
    const itemLayerColor =
      itemSelection && typeof selectNewItemPosition.layer?.menuColor === 'string'
        ? selectNewItemPosition.layer.menuColor
        : undefined
    const layerMenuColor = layer?.menuColor
    const baseLayerColor = typeof layerMenuColor === 'string' ? layerMenuColor : undefined

    const backgroundColor = resolveColor(itemColor, itemLayerColor, baseLayerColor)
    const iconSrc: string | undefined =
      markerIcon?.image != null
        ? assetsBaseUrl
          ? `${assetsBaseUrl}${markerIcon.image}`
          : markerIcon.image
        : undefined

    return (
      <div className='tw:relative'>
        <div className='tw:flex tw:flex-row tw:items-center'>
          <div
            className='tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-selector tw:text-white tw:mr-2'
            style={{ backgroundColor }}
          >
            {iconSrc && <SVG src={iconSrc} className='tw:h-4 tw:w-4 tw:object-contain' />}
          </div>
          <div className='tw:flex tw:flex-col tw:gap-0.5'>
            <span className='tw:text-sm'>{message}</span>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className='tw:btn tw:btn-sm tw:btn-ghost tw:btn-circle tw:absolute tw:top-0 tw:right-0'
        >
          ✕
        </button>
      </div>
    )
  }, [appState.assetsApi.url, selectNewItemPosition, setSelectNewItemPosition, toastId])

  useEffect(() => {
    if (selectNewItemPosition && toastContent) {
      if (!toastIdRef.current) {
        toastIdRef.current = toast(toastContent, {
          toastId,
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
        })
      } else {
        toast.update(toastId, {
          render: toastContent,
          autoClose: false,
          closeButton: false,
          closeOnClick: false,
          draggable: false,
        })
      }
    }

    if (!selectNewItemPosition && toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }, [selectNewItemPosition, toastContent, toastId])

  return null
}
