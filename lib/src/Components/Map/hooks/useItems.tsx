/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/* eslint-disable @typescript-eslint/no-misused-promises */
import { useCallback, useReducer, createContext, useContext } from 'react'
import { toast } from 'react-toastify'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'

type LayerState = {
  props: LayerProps
  isInitialized: boolean
}[]

interface State {
  layers: LayerState
  items: Item[]
}

type ActionType =
  | { type: 'ADD_LAYER'; layer: LayerProps; items: Item[] }
  | { type: 'ADD'; item: Item }
  | { type: 'UPDATE'; item: Item }
  | { type: 'REMOVE'; item: Item }
  | { type: 'RESET'; layer: LayerProps }

type UseItemManagerResult = ReturnType<typeof useItemsManager>

const ItemContext = createContext<UseItemManagerResult>({
  layers: [],
  items: [],
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
  resetItems: () => {},
  setItemsApi: () => {},
  setItemsData: () => {},
})

function useItemsManager(
  initialItems: Item[],
  initialLayers: LayerState,
): {
  layers: LayerState
  items: Item[]
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  removeItem: (item: Item) => void
  resetItems: (layer: LayerProps) => void
  setItemsApi: (layer: LayerProps) => void
  setItemsData: (layer: LayerProps) => void
} {
  const [{ items, layers }, dispatch] = useReducer(
    (state: State, action: ActionType) => {
      switch (action.type) {
        case 'ADD_LAYER':
          return {
            layers: [
              ...state.layers,
              {
                props: action.layer,
                isInitialized: true,
              },
            ],
            items: [
              ...state.items,
              ...action.items.map((item) => ({ ...item, layer: action.layer })),
            ],
          }
        case 'ADD':
          // eslint-disable-next-line no-case-declarations
          const exist = state.items.find((item) => item.id === action.item.id)
          if (!exist) {
            return {
              ...state,
              items: [...state.items, action.item],
            }
          } else return state
        case 'UPDATE':
          return {
            ...state,
            items: state.items.map((item) => {
              if (item.id === action.item.id) {
                return action.item
              }
              return item
            }),
          }
        case 'REMOVE':
          return {
            ...state,
            items: state.items.filter((item) => item !== action.item),
          }
        case 'RESET':
          return {
            ...state,
            items: state.items.filter((item) => item.layer?.name !== action.layer.name),
          }
        default:
          throw new Error()
      }
    },
    { items: initialItems, layers: initialLayers } as State,
  )

  const setItemsApi = useCallback(async (layer: LayerProps) => {
    const items = await toast.promise(layer.api!.getItems(), {
      pending: `loading ${layer.name} ...`,
      success: `${layer.name} loaded`,
      error: {
        render({ data }) {
          return `${data}`
        },
      },
    })
    dispatch({ type: 'ADD_LAYER', layer, items })
  }, [])

  const setItemsData = useCallback((layer: LayerProps) => {
    if (!layer.data) return
    dispatch({ type: 'ADD_LAYER', layer, items: layer.data })
  }, [])

  const addItem = useCallback(async (item: Item) => {
    dispatch({
      type: 'ADD',
      item,
    })
  }, [])

  const updateItem = useCallback(async (item: Item) => {
    dispatch({
      type: 'UPDATE',
      item,
    })
  }, [])

  const removeItem = useCallback((item: Item) => {
    dispatch({
      type: 'REMOVE',
      item,
    })
  }, [])

  const resetItems = useCallback((layer: LayerProps) => {
    dispatch({
      type: 'RESET',
      layer,
    })
  }, [])

  return {
    items,
    layers,
    updateItem,
    addItem,
    removeItem,
    resetItems,
    setItemsApi,
    setItemsData,
  }
}

export const ItemsProvider: React.FunctionComponent<{
  initialItems: Item[]
  initialLayers: LayerState
  children?: React.ReactNode
}> = ({ initialItems, initialLayers, children }) => (
  <ItemContext.Provider value={useItemsManager(initialItems, initialLayers)}>
    {children}
  </ItemContext.Provider>
)

export const useItems = (): Item[] => {
  const { items } = useContext(ItemContext)
  return items
}

export const useAddItem = (): UseItemManagerResult['addItem'] => {
  const { addItem } = useContext(ItemContext)
  return addItem
}

export const useUpdateItem = (): UseItemManagerResult['updateItem'] => {
  const { updateItem } = useContext(ItemContext)
  return updateItem
}

export const useRemoveItem = (): UseItemManagerResult['removeItem'] => {
  const { removeItem } = useContext(ItemContext)
  return removeItem
}

export const useResetItems = (): UseItemManagerResult['resetItems'] => {
  const { resetItems } = useContext(ItemContext)
  return resetItems
}

export const useSetItemsApi = (): UseItemManagerResult['setItemsApi'] => {
  const { setItemsApi } = useContext(ItemContext)
  return setItemsApi
}

export const useSetItemsData = (): UseItemManagerResult['setItemsData'] => {
  const { setItemsData } = useContext(ItemContext)
  return setItemsData
}

export const useLayers = (): LayerProps[] => {
  const { layers } = useContext(ItemContext)
  return layers.map((layer) => layer.props)
}

export const useLayerState = (): LayerState => {
  const { layers } = useContext(ItemContext)
  return layers
}
