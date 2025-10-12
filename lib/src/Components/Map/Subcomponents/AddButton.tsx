/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DomEvent } from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import SVG from 'react-inlinesvg'

import PlusSVG from '#assets/plus.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import useWindowDimensions from '#components/Map/hooks/useWindowDimension'

import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react'

export default function AddButton({
  triggerAction,
}: {
  triggerAction: React.Dispatch<React.SetStateAction<any>>
}) {
  const layers = useLayers()
  const hasUserPermission = useHasUserPermission()
  const appState = useAppState()
  const { width } = useWindowDimensions()
  const isMobile = width < 768
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    DomEvent.disableClickPropagation(container)
    DomEvent.disableScrollPropagation(container)

    const stopPointerPropagation = (event: PointerEvent) => {
      event.stopPropagation()
    }

    DomEvent.on(container, 'pointerdown pointerup pointermove', stopPointerPropagation)

    return () => {
      DomEvent.off(container, 'pointerdown pointerup pointermove', stopPointerPropagation)
    }
  }, [])

  const canAddItems = () => {
    let canAdd = false
    layers.map((layer) => {
      if (
        layer.api?.createItem &&
        hasUserPermission(layer.api.collectionName!, 'create', undefined, layer) &&
        layer.listed
      )
        canAdd = true
      return null
    })
    return canAdd
  }

  const stopPropagation = (
    event: ReactMouseEvent<HTMLElement> | ReactTouchEvent<HTMLElement>,
  ): void => {
    event.preventDefault()
    event.stopPropagation()
    if (
      'nativeEvent' in event &&
      typeof event.nativeEvent.stopImmediatePropagation === 'function'
    ) {
      event.nativeEvent.stopImmediatePropagation()
    }
  }

  const handleLayerSelect = (
    event: ReactMouseEvent<HTMLButtonElement> | ReactTouchEvent<HTMLButtonElement>,
    layer: (typeof layers)[number],
  ) => {
    stopPropagation(event)
    triggerAction(layer)
    setIsOpen(false)
  }

  return (
    <>
      {canAddItems() ? (
        <div
          ref={containerRef}
          className={`tw:dropdown tw:dropdown-top tw:dropdown-end ${!isMobile ? 'tw:dropdown-hover' : ''} tw:z-500 tw:absolute tw:right-4 tw:bottom-4 ${isOpen ? 'tw:dropdown-open' : ''}`}
        >
          <label
            tabIndex={0}
            className='tw:z-500 tw:btn tw:btn-circle tw:btn-lg  tw:shadow tw:bg-base-100'
            onMouseDown={(event) => {
              stopPropagation(event)
            }}
            onMouseUp={(event) => {
              stopPropagation(event)
            }}
            onClick={(event) => {
              stopPropagation(event)
              if (isMobile) {
                setIsOpen(!isOpen)
              }
            }}
            onTouchStart={(event) => {
              stopPropagation(event)
            }}
            onTouchEnd={(event) => {
              stopPropagation(event)
              if (isMobile) {
                setIsOpen(!isOpen)
              }
            }}
          >
            <SVG src={PlusSVG} className='tw:h-5 tw:w-5' />
          </label>
          <ul
            tabIndex={0}
            className='tw:dropdown-content tw:pr-1 tw:list-none tw:space-y-3 tw:pb-3'
          >
            {layers.map(
              (layer) =>
                layer.api?.createItem &&
                hasUserPermission(layer.api.collectionName!, 'create', undefined, layer) &&
                layer.listed && (
                  <li key={layer.name}>
                    <a>
                      <div
                        className={`tw:tooltip tw:tooltip-left ${isMobile ? 'tw:tooltip-open' : ''}`}
                        data-tip={layer.menuText}
                      >
                        <button
                          tabIndex={0}
                          className='tw:z-500 tw:border-0 tw:p-0 tw:w-10 tw:h-10 tw:cursor-pointer tw:rounded-full tw:mouse tw:drop-shadow-md tw:transition tw:ease-in tw:duration-200 tw:focus:outline-hidden tw:flex tw:items-center tw:justify-center'
                          style={{ backgroundColor: layer.menuColor || '#777' }}
                          onMouseDown={(event) => {
                            stopPropagation(event)
                          }}
                          onMouseUp={(event) => {
                            stopPropagation(event)
                          }}
                          onClick={(event) => {
                            handleLayerSelect(event, layer)
                          }}
                          onTouchStart={(event) => {
                            stopPropagation(event)
                          }}
                          onTouchEnd={(event) => {
                            handleLayerSelect(event, layer)
                          }}
                        >
                          <img
                            src={appState.assetsApi.url + layer.markerIcon.image}
                            style={{
                              filter: 'invert(100%) brightness(200%)',
                              width: `${(layer.markerIcon.size ?? 18) * 1.3}px`,
                            }}
                          />
                        </button>
                      </div>
                    </a>
                  </li>
                ),
            )}
          </ul>
        </div>
      ) : (
        ''
      )}
    </>
  )
}
