/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  const [isOpen, setIsOpen] = useState(false)

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

  return (
    <>
      {canAddItems() ? (
        <div
          className={`tw:dropdown tw:dropdown-top tw:dropdown-end ${!isMobile ? 'tw:dropdown-hover' : ''} tw:z-500 tw:absolute tw:right-4 tw:bottom-4 ${isOpen ? 'tw:dropdown-open' : ''}`}
        >
          <label
            tabIndex={0}
            className='tw:z-500 tw:btn tw:btn-circle tw:btn-lg  tw:shadow tw:bg-base-100'
            onClick={() => {
              if (isMobile) {
                setIsOpen(!isOpen)
              }
            }}
          >
            <SVG src={PlusSVG} className='tw:h-5 tw:w-5' />
          </label>
          <ul tabIndex={0} className='tw:dropdown-content tw:pr-1 tw:list-none'>
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
                          className='tw:z-500 tw:border-0 tw:p-0 tw:mb-3 tw:w-10 tw:h-10 tw:cursor-pointer tw:rounded-full tw:mouse tw:drop-shadow-md tw:transition tw:ease-in tw:duration-200 tw:focus:outline-hidden tw:flex tw:items-center tw:justify-center'
                          style={{ backgroundColor: layer.menuColor || '#777' }}
                          onClick={() => {
                            triggerAction(layer)
                            setIsOpen(false)
                          }}
                          onTouchEnd={(e) => {
                            triggerAction(layer)
                            setIsOpen(false)
                            e.preventDefault()
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
