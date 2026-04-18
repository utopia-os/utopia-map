/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  useCallback,
  useReducer,
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react'
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
  const pendingLoadsRef = useRef<number>(0)
  const loadingToastRef = useRef<ReturnType<typeof toast.loading> | null>(null)

  const startLoadingToast = (): void => {
    pendingLoadsRef.current++
    loadingToastRef.current ??= toast.loading('Loading data ...')
  }

  const resolveLoadingToast = (): void => {
    pendingLoadsRef.current--
    if (pendingLoadsRef.current === 0 && loadingToastRef.current) {
      toast.update(loadingToastRef.current, {
        render: 'Data loaded',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      loadingToastRef.current = null
      setallItemsLoaded(true)
    }
  }

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
    if (!layersRef.current.some((l) => l.name === layer.name)) {
      layersRef.current.push(layer)
    }

    startLoadingToast()

    try {
      const result = await layer.api!.getItems()
      result.forEach((item) => {
        dispatch({ type: 'ADD', item: { ...item, layer } })
      })
    } catch (error: unknown) {
      if (error instanceof Error || typeof error === 'string') {
        const msg = error instanceof Error ? error.message : error
        toast.error(`Failed to load ${layer.name}: ${msg}`)
      } else {
        throw error
      }
    } finally {
      resolveLoadingToast()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setItemsData = useCallback((layer: LayerProps) => {
    addLayer(layer)
    layer.data?.forEach((item) => {
      dispatch({ type: 'ADD', item: { ...item, layer } })
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

    const apiLayers = layersRef.current.filter((l) => l.api)
    if (apiLayers.length === 0) {
      setallItemsLoaded(true)
      return
    }

    startLoadingToast()

    try {
      await Promise.all(
        apiLayers.map(async (layer) => {
          const result = await layer.api!.getItems()
          result.forEach((item) => {
            dispatch({ type: 'ADD', item: { ...item, layer } })
          })
        }),
      )
    } catch (error: unknown) {
      if (error instanceof Error || typeof error === 'string') {
        const msg = error instanceof Error ? error.message : error
        toast.error(`Failed to load data: ${msg}`)
      } else {
        throw error
      }
    } finally {
      resolveLoadingToast()
    }
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
