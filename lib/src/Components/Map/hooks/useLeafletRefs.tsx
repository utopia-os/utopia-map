/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useReducer, createContext, useContext } from 'react'

import type { Item } from '#types/Item'
import type { Marker, Popup } from 'leaflet'

interface LeafletRef {
  item: Item
  marker: Marker
  popup: Popup
}

type ActionType =
  | { type: 'ADD_MARKER'; item: Item; marker: Marker }
  | { type: 'ADD_POPUP'; item: Item; popup: Popup }

type UseLeafletRefsManagerResult = ReturnType<typeof useLeafletRefsManager>

const LeafletRefsContext = createContext<UseLeafletRefsManagerResult>({
  leafletRefs: {},
  addMarker: () => {},
  addPopup: () => {},
})

function useLeafletRefsManager(initialLeafletRefs: {}): {
  leafletRefs: Record<string, LeafletRef>
  addMarker: (item: Item, marker: Marker) => void
  addPopup: (item: Item, popup: Popup) => void
} {
  const [leafletRefs, dispatch] = useReducer(
    (state: Record<string, LeafletRef>, action: ActionType) => {
      switch (action.type) {
        case 'ADD_MARKER':
          return {
            ...state,
            [action.item.id]: {
              ...state[action.item.id],
              marker: action.marker,
              item: action.item,
            },
          }
        case 'ADD_POPUP':
          return {
            ...state,
            [action.item.id]: { ...state[action.item.id], popup: action.popup, item: action.item },
          }
        default:
          throw new Error()
      }
    },
    initialLeafletRefs,
  )

  const addMarker = useCallback((item: Item, marker: Marker) => {
    dispatch({
      type: 'ADD_MARKER',
      item,
      marker,
    })
  }, [])

  const addPopup = useCallback((item: Item, popup: Popup) => {
    dispatch({
      type: 'ADD_POPUP',
      item,
      popup,
    })
  }, [])

  return { leafletRefs, addMarker, addPopup }
}

export const LeafletRefsProvider: React.FunctionComponent<{
  initialLeafletRefs: {}
  children?: React.ReactNode
}> = ({ initialLeafletRefs, children }) => (
  <LeafletRefsContext.Provider value={useLeafletRefsManager(initialLeafletRefs)}>
    {children}
  </LeafletRefsContext.Provider>
)

export const useLeafletRefs = (): Record<string, LeafletRef> => {
  const { leafletRefs } = useContext(LeafletRefsContext)
  return leafletRefs
}

export const useAddMarker = (): UseLeafletRefsManagerResult['addMarker'] => {
  const { addMarker } = useContext(LeafletRefsContext)
  return addMarker
}

export const useAddPopup = (): UseLeafletRefsManagerResult['addPopup'] => {
  const { addPopup } = useContext(LeafletRefsContext)
  return addPopup
}
