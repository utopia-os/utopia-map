import { useState } from 'react'
import SVG from 'react-inlinesvg'

import LayerSVG from '#assets/layer.svg'
import { useIsLayerVisible, useToggleVisibleLayer } from '#components/Map/hooks/useFilter'
import { useLayers } from '#components/Map/hooks/useLayers'

export function LayerControl({ expandLayerControl = false }: { expandLayerControl: boolean }) {
  const [open, setOpen] = useState(expandLayerControl)

  const layers = useLayers()

  const isLayerVisible = useIsLayerVisible()
  const toggleVisibleLayer = useToggleVisibleLayer()

  return (
    <div className='tw:card tw:bg-base-100 tw:shadow-xl tw:mt-2 tw:w-fit'>
      {open ? (
        <div className='tw:card-body tw:pr-4 tw:min-w-[8rem] tw:p-2 tw:transition-all tw:w-fit tw:duration-300'>
          <label
            className='tw:btn tw:btn-sm tw:rounded-2xl tw:btn-circle tw:btn-ghost tw:hover:bg-transparent tw:absolute tw:right-0 tw:top-0 tw:text-gray-600'
            onClick={() => {
              setOpen(false)
            }}
          >
            <p className='tw:text-center '>✕</p>
          </label>
          <ul className='tw:flex-row'>
            {layers.map(
              (layer) =>
                layer.listed && (
                  <li key={layer.name}>
                    <label
                      htmlFor={layer.name}
                      className='tw:label tw:justify-normal tw:pt-1 tw:pb-1 tw:text-base-content'
                    >
                      <input
                        id={layer.name}
                        onChange={() => {
                          toggleVisibleLayer(layer)
                        }}
                        type='checkbox'
                        className='tw:checkbox tw:checkbox-xs tw:checkbox-success tw:text-white'
                        checked={isLayerVisible(layer)}
                        style={{ backgroundColor: layer.menuColor, borderColor: layer.menuColor }}
                      />
                      <span className='tw:text-sm tw:label-text tw:mx-2 tw:cursor-pointer'>
                        {layer.name}
                      </span>
                    </label>
                  </li>
                ),
            )}
          </ul>
        </div>
      ) : (
        <div
          className='tw:card-body tw:hover:bg-slate-300 tw:card tw:p-2 tw:h-10 tw:w-10 tw:transition-all tw:duration-300 tw:hover:cursor-pointer'
          onClick={() => {
            setOpen(true)
          }}
        >
          <SVG src={LayerSVG} />
        </div>
      )}
    </div>
  )
}
