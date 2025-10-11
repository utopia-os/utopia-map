/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import SVG from 'react-inlinesvg'

import PlusSVG from '#assets/plus.svg'
import { useAppState } from '#components/AppShell/hooks/useAppState'
import { useLayers } from '#components/Map/hooks/useLayers'
import { useHasUserPermission } from '#components/Map/hooks/usePermissions'

export default function AddButton({
  triggerAction,
}: {
  triggerAction: React.Dispatch<React.SetStateAction<any>>
}) {
  const layers = useLayers()
  const hasUserPermission = useHasUserPermission()
  const appState = useAppState()

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
        <div className='tw:dropdown tw:dropdown-top tw:dropdown-end tw:dropdown-hover tw:z-500 tw:absolute tw:right-4 tw:bottom-4'>
          <label
            tabIndex={0}
            className='tw:z-500 tw:btn tw:btn-circle tw:btn-lg  tw:shadow tw:bg-base-100'
          >
            <SVG src={PlusSVG} className='tw:h-5 tw:w-5' />
          </label>
          <ul
            tabIndex={0}
            className='tw:dropdown-content tw:list-none tw:rounded tw:bg-base-100 tw:w-62 tw:p-0 tw:overflow-hidden'
          >
            {layers.map(
              (layer) =>
                layer.api?.createItem &&
                hasUserPermission(layer.api.collectionName!, 'create', undefined, layer) &&
                layer.listed && (
                  <li key={layer.name}>
                    <a
                      className='tw:cursor-pointer'
                      onClick={() => {
                        triggerAction(layer)
                      }}
                      onTouchEnd={(e) => {
                        triggerAction(layer)
                        e.preventDefault()
                      }}
                    >
                      <div className='tw:flex tw:flex-row tw:hover:bg-base-200 tw:p-2'>
                        <button
                          tabIndex={0}
                          className='tw:z-500 tw:border-0 tw:p-0 tw:w-9 tw:h-9 tw:cursor-pointer tw:rounded-selector tw:mouse tw:drop-shadow-md tw:transition tw:ease-in tw:duration-200 tw:focus:outline-hidden tw:flex tw:items-center tw:justify-center'
                          style={{ backgroundColor: layer.menuColor || '#777' }}
                        >
                          <img
                            src={appState.assetsApi.url + layer.markerIcon.image}
                            style={{
                              filter: 'invert(100%) brightness(200%)',
                              width: `${(layer.markerIcon.size ?? 18) * 1.3}px`,
                            }}
                          />
                        </button>
                        <div className='tw:ml-2 tw:flex tw:flex-col'>
                          <p className='tw:font-bold tw:text-current tw:pt-2.5'>{layer.menuText}</p>
                        </div>
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
