/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/* eslint-disable @typescript-eslint/no-misused-promises */
import { useCallback, useReducer, createContext, useContext, useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

import { useAuth } from '#components/Auth/useAuth'

import { useAddLayer } from './useLayers'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'

type ActionType =
  | { type: 'ADD'; item: Item }
  | { type: 'UPDATE'; item: Item }
  | { type: 'REMOVE'; item: Item }
  | { type: 'RESET'; layer: LayerProps }
  | { type: 'CLEAR_ALL' }

type UseItemManagerResult = ReturnType<typeof useItemsManager>

const ItemContext = createContext<UseItemManagerResult>({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
  resetItems: () => {},
  setItemsApi: () => {},
  setItemsData: () => {},
  allItemsLoaded: false,
})

function useItemsManager(initialItems: Item[]): {
  items: Item[]
  addItem: (item: Item) => void
  updateItem: (item: Item) => void
  removeItem: (item: Item) => void
  resetItems: (layer: LayerProps) => void
  setItemsApi: (layer: LayerProps) => void
  setItemsData: (layer: LayerProps) => void
  allItemsLoaded: boolean
} {
  const addLayer = useAddLayer()
  const { user } = useAuth()

  const [allItemsLoaded, setallItemsLoaded] = useState<boolean>(false)
  const layersRef = useRef<LayerProps[]>([])

  const [items, dispatch] = useReducer((state: Item[], action: ActionType) => {
    switch (action.type) {
      case 'ADD':
        // eslint-disable-next-line no-case-declarations
        const exist = state.find((item) => item.id === action.item.id)
        if (!exist) {
          return [...state, action.item]
        } else return state
      case 'UPDATE':
        return state.map((item) => {
          if (item.id === action.item.id) {
            return action.item
          }
          return item
        })
      case 'REMOVE':
        return state.filter((item) => item !== action.item)
      case 'RESET':
        return state.filter((item) => item.layer?.name !== action.layer.name)
      case 'CLEAR_ALL':
        return []
      default:
        throw new Error()
    }
  }, initialItems)

  const setItemsApi = useCallback(async (layer: LayerProps) => {
    addLayer(layer)
    layersRef.current.push(layer)
    const result = await toast.promise(layer.api!.getItems(), {
      pending: `loading ${layer.name} ...`,
      success: `${layer.name} loaded`,
      error: {
        render({ data }) {
          return `${data}`
        },
      },
    })
    result.map((item) => {
      dispatch({ type: 'ADD', item: { ...item, layer } })
      return null
    })
    setallItemsLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setItemsData = useCallback((layer: LayerProps) => {
    addLayer(layer)
    layer.data?.map((item) => {
      dispatch({ type: 'ADD', item: { ...item, layer } })
      return null
    })
    setallItemsLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const reloadAllItems = useCallback(async () => {
    dispatch({ type: 'CLEAR_ALL' })
    setallItemsLoaded(false)

    for (const layer of layersRef.current) {
      if (layer.api) {
        try {
          const result = await layer.api.getItems()
          result.map((item) => {
            dispatch({ type: 'ADD', item: { ...item, layer } })
            return null
          })
        } catch (error) {
          console.error(`Failed to reload items for layer ${layer.name}:`, error)
        }
      }
    }

    setallItemsLoaded(true)
  }, [])

  useEffect(() => {
    if (layersRef.current.length > 0) {
      void reloadAllItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return {
    items,
    updateItem,
    addItem,
    removeItem,
    resetItems,
    setItemsApi,
    setItemsData,
    allItemsLoaded,
  }
}

export const ItemsProvider: React.FunctionComponent<{
  initialItems: Item[]
  children?: React.ReactNode
}> = ({ initialItems, children }) => (
  <ItemContext.Provider value={useItemsManager(initialItems)}>{children}</ItemContext.Provider>
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

export const useAllItemsLoaded = (): UseItemManagerResult['allItemsLoaded'] => {
  const { allItemsLoaded } = useContext(ItemContext)
  return allItemsLoaded
}
