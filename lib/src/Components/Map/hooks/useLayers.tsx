import { useCallback, useReducer, createContext, useContext } from 'react'

import type { LayerProps } from '#types/LayerProps'

interface ActionType {
  type: 'ADD LAYER'
  layer: LayerProps
}

type UseItemManagerResult = ReturnType<typeof useLayerManager>

const LayerContext = createContext<UseItemManagerResult>({
  layers: [],
  addLayer: () => {},
})

function useLayerManager(initialLayers: LayerProps[]): {
  layers: LayerProps[]
  addLayer: (layer: LayerProps) => void
} {
  const [layers, dispatch] = useReducer((state: LayerProps[], action: ActionType) => {
    switch (action.type) {
      case 'ADD LAYER':
        // eslint-disable-next-line no-case-declarations
        const exist = state.find((layer) => layer.name === action.layer.name)
        if (!exist) {
          return [...state, action.layer]
        } else return state
      default:
        throw new Error()
    }
  }, initialLayers)

  const addLayer = useCallback((layer: LayerProps) => {
    dispatch({
      type: 'ADD LAYER',
      layer,
    })
  }, [])

  return { layers, addLayer }
}

export const LayersProvider: React.FunctionComponent<{
  initialLayers: LayerProps[]
  children?: React.ReactNode
}> = ({ initialLayers, children }: { initialLayers: LayerProps[]; children?: React.ReactNode }) => (
  <LayerContext.Provider value={useLayerManager(initialLayers)}>{children}</LayerContext.Provider>
)

export const useLayers = (): LayerProps[] => {
  const { layers } = useContext(LayerContext)
  return layers
}

export const useAddLayer = (): UseItemManagerResult['addLayer'] => {
  const { addLayer } = useContext(LayerContext)
  return addLayer
}
