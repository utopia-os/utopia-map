/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MapPinIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'
import SVG from 'react-inlinesvg'

import PlusSVG from '#assets/plus.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'
import useWindowDimensions from '#components/Map/hooks/useWindowDimension'

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
  const [hideTooltips, setHideTooltips] = useState(false)

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

  const handleLayerClick = (layer: any) => {
    triggerAction(layer)
    // Verstecke Tooltips auf Mobile nach Layer-Auswahl
    if (isMobile) {
      setHideTooltips(true)
    }
  }

  return (
    <>
      {canAddItems() ? (
        <div className='tw:dropdown tw:dropdown-top tw:dropdown-end tw:dropdown-hover tw:z-500 tw:absolute tw:right-4 tw:bottom-4'>
          <label
            tabIndex={0}
            className='tw:z-500 tw:btn tw:btn-circle tw:btn-lg  tw:shadow tw:bg-base-100'
            onClick={() => {
              if (hideTooltips) {
                setHideTooltips(false)
              }
            }}
            onTouchEnd={() => {
              if (hideTooltips) {
                setHideTooltips(false)
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
                        className={`tw:tooltip tw:tooltip-left ${isMobile && !hideTooltips ? 'tw:tooltip-open' : ''}`}
                        data-tip={layer.menuText}
                        style={
                          {
                            '--tooltip-color': layer.menuColor || '#777',
                            '--tooltip-text-color': '#ffffff',
                          } as React.CSSProperties
                        }
                      >
                        <button
                          tabIndex={0}
                          className='tw:z-500 tw:border-0 tw:p-0 tw:w-10 tw:h-10 tw:cursor-pointer tw:rounded-full tw:mouse tw:drop-shadow-md tw:transition tw:ease-in tw:duration-200 tw:focus:outline-hidden tw:flex tw:items-center tw:justify-center'
                          style={{ backgroundColor: layer.menuColor || '#777' }}
                          onClick={() => handleLayerClick(layer)}
                          onTouchEnd={(e) => {
                            handleLayerClick(layer)
                            e.preventDefault()
                          }}
                        >
                          {layer.markerIcon?.image ? (
                            <img
                              src={appState.assetsApi.url + layer.markerIcon.image}
                              style={{
                                filter: 'invert(100%) brightness(200%)',
                                width: `${(layer.markerIcon.size ?? 18) * 1.3}px`,
                                height: `${(layer.markerIcon.size ?? 18) * 1.3}px`,
                              }}
                            />
                          ) : (
                            <MapPinIcon className='tw:w-6 tw:h-6' style={{ color: '#ffffff' }} />
                          )}
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
