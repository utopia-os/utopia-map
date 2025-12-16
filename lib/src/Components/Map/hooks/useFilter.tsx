/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable no-case-declarations */
import { useCallback, useReducer, createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLayers } from './useLayers'
import useWindowDimensions from './useWindowDimension'

import type { LayerProps } from '#types/LayerProps'
import type { Tag } from '#types/Tag'

type ActionType =
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'REMOVE_TAG'; name: string }
  | { type: 'RESET_TAGS' }
  | { type: 'TOGGLE_LAYER'; layer: LayerProps }
  | { type: 'ADD_LAYER'; layer: LayerProps }
  | { type: 'RESET_LAYERS' }
  | { type: 'TOGGLE_GROUP_TYPE'; groupType: string }
  | { type: 'ADD_GROUP_TYPE'; groupType: string }
  | { type: 'RESET_GROUP_TYPE' }

type UseFilterManagerResult = ReturnType<typeof useFilterManager>

const FilterContext = createContext<UseFilterManagerResult>({
  filterTags: [],
  searchPhrase: '',
  visibleLayers: [],
  visibleGroupTypes: [],
  addFilterTag: () => {},
  removeFilterTag: () => {},
  resetFilterTags: () => {},
  setSearchPhrase: () => {},
  addVisibleLayer: () => {},
  toggleVisibleLayer: () => {},
  resetVisibleLayers: () => {},
  isLayerVisible: () => true,
  addVisibleGroupType: () => {},
  toggleVisibleGroupType: () => {},
  isGroupTypeVisible: () => true,
})

function useFilterManager(initialTags: Tag[]): {
  filterTags: Tag[]
  searchPhrase: string
  visibleLayers: LayerProps[]
  visibleGroupTypes: string[]

  addFilterTag: (tag: Tag) => void
  removeFilterTag: (name: string) => void
  resetFilterTags: () => void
  setSearchPhrase: (phrase: string) => void
  addVisibleLayer: (layer: LayerProps) => void
  toggleVisibleLayer: (layer: LayerProps) => void
  resetVisibleLayers: () => void
  isLayerVisible: (layer: LayerProps) => boolean
  addVisibleGroupType: (groupType: string) => void
  toggleVisibleGroupType: (groupType: string) => void
  isGroupTypeVisible: (groupType: string) => boolean
} {
  const [filterTags, dispatchTags] = useReducer((state: Tag[], action: ActionType) => {
    switch (action.type) {
      case 'ADD_TAG':
        const exist = state.find((tag) => tag.id === action.tag.id)
        if (!exist) {
          return [...state, action.tag]
        } else return state
      case 'REMOVE_TAG':
        return state.filter(({ name }) => name !== action.name)
      case 'RESET_TAGS':
        return initialTags
      default:
        throw new Error()
    }
  }, initialTags)

  const initialLayers = useLayers()
  const navigate = useNavigate()
  const windowDimensions = useWindowDimensions()

  const [visibleLayers, dispatchLayers] = useReducer((state: LayerProps[], action: ActionType) => {
    switch (action.type) {
      case 'ADD_LAYER':
        const exist1 = state.find((layer) => layer.name === action.layer.name)
        if (!exist1) {
          return [...state, action.layer]
        } else return state
      case 'TOGGLE_LAYER':
        const exist2 = state.some((layer) => layer.name === action.layer.name)
        if (exist2) return state.filter(({ name }) => name !== action.layer.name)
        else return [...state, action.layer]
      case 'RESET_LAYERS':
        return initialLayers
      default:
        throw new Error()
    }
  }, initialLayers)

  const allLayers = useLayers()

  useEffect(() => {
    if (allLayers.length === 0) return

    const visibleNames = visibleLayers.map((l) => l.name)
    const allNames = allLayers.map((l) => l.name)
    const params = new URLSearchParams(location.search)

    const allVisible =
      visibleNames.length === allNames.length &&
      visibleNames.every((name) => allNames.includes(name))

    if (allVisible) {
      params.delete('layers')
    } else {
      params.set('layers', visibleNames.join(','))
    }

    void navigate(`${location.pathname}?${params.toString()}`, { replace: true })
  }, [visibleLayers, allLayers, navigate])

  const [visibleGroupTypes, dispatchGroupTypes] = useReducer(
    (state: string[], action: ActionType) => {
      switch (action.type) {
        case 'ADD_GROUP_TYPE':
          const exist1 = state.find((groupType) => groupType === action.groupType)
          if (!exist1) {
            return [...state, action.groupType]
          } else return state
        case 'TOGGLE_GROUP_TYPE':
          const exist2 = state.some((groupType) => groupType === action.groupType)
          if (exist2) return state.filter((groupType) => groupType !== action.groupType)
          else return [...state, action.groupType]
        case 'RESET_GROUP_TYPE':
          return []
        default:
          throw new Error()
      }
    },
    [],
  )

  const [searchPhrase, searchPhraseSet] = useState<string>('')

  const addFilterTag = useCallback((tag: Tag) => {
    const params = new URLSearchParams(location.search)
    const urlTags = params.get('tags')
    const decodedTags = urlTags ? decodeURIComponent(urlTags) : ''

    if (!decodedTags.includes(tag.name)) {
      params.set('tags', `${urlTags || ''}${urlTags ? ';' : ''}${tag.name}`)
    }
    if (windowDimensions.width < 786 && location.pathname.split('/').length > 2)
      void navigate('/' + `${params ? `?${params}` : ''}`)
    else void navigate(location.pathname + `${params ? `?${params}` : ''}`)

    dispatchTags({
      type: 'ADD_TAG',
      tag,
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const removeFilterTag = useCallback((name: string) => {
    const params = new URLSearchParams(window.location.search)
    const urlTags = params.get('tags')
    let newUrlTags = ''
    const tags = urlTags?.split(';')
    if (tags?.length === 0 && urlTags?.length && urlTags.length > 0) tags[0] = urlTags
    tags?.map((urlTag) => {
      if (!(urlTag.toLocaleLowerCase() === name.toLocaleLowerCase())) {
        newUrlTags = newUrlTags + `${newUrlTags === '' ? urlTag : `;${urlTag}`}`
      }
      return null
    })
    if (newUrlTags !== '') {
      params.set('tags', `${newUrlTags}`)
      void navigate(location.pathname + `${params ? `?${params}` : ''}`)
    } else {
      params.delete('tags')
      void navigate(location.pathname + `${params ? `?${params}` : ''}`)
    }

    dispatchTags({
      type: 'REMOVE_TAG',
      name,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const resetFilterTags = useCallback(() => {
    dispatchTags({
      type: 'RESET_TAGS',
    })
  }, [])

  const addVisibleLayer = (layer: LayerProps) => {
    dispatchLayers({
      type: 'ADD_LAYER',
      layer,
    })
  }

  const toggleVisibleLayer = (layer: LayerProps) => {
    dispatchLayers({
      type: 'TOGGLE_LAYER',
      layer,
    })
  }

  const resetVisibleLayers = useCallback(() => {
    dispatchLayers({
      type: 'RESET_LAYERS',
    })
  }, [])

  const isLayerVisible = useCallback(
    (layer: LayerProps) => {
      return visibleLayers.some((l) => l.name === layer.name)
    },
    [visibleLayers],
  )

  const addVisibleGroupType = (groupType: string) => {
    dispatchGroupTypes({
      type: 'ADD_GROUP_TYPE',
      groupType,
    })
  }

  const toggleVisibleGroupType = (groupType: string) => {
    dispatchGroupTypes({
      type: 'TOGGLE_GROUP_TYPE',
      groupType,
    })
  }

  const isGroupTypeVisible = useCallback(
    (groupType: string) => {
      return visibleGroupTypes.some((gt) => gt === groupType)
    },
    [visibleGroupTypes],
  )

  const setSearchPhrase = useCallback((phrase: string) => {
    searchPhraseSet(phrase)
  }, [])

  return {
    filterTags,
    addFilterTag,
    removeFilterTag,
    resetFilterTags,
    setSearchPhrase,
    searchPhrase,
    visibleLayers,
    toggleVisibleLayer,
    resetVisibleLayers,
    isLayerVisible,
    addVisibleLayer,
    visibleGroupTypes,
    addVisibleGroupType,
    toggleVisibleGroupType,
    isGroupTypeVisible,
  }
}

export const FilterProvider: React.FunctionComponent<{
  initialTags: Tag[]
  children?: React.ReactNode
}> = ({ initialTags, children }) => (
  <FilterContext.Provider value={useFilterManager(initialTags)}>{children}</FilterContext.Provider>
)

export const useFilterTags = (): Tag[] => {
  const { filterTags } = useContext(FilterContext)
  return filterTags
}

export const useAddFilterTag = (): UseFilterManagerResult['addFilterTag'] => {
  const { addFilterTag } = useContext(FilterContext)
  return addFilterTag
}

export const useRemoveFilterTag = (): UseFilterManagerResult['removeFilterTag'] => {
  const { removeFilterTag } = useContext(FilterContext)
  return removeFilterTag
}

export const useResetFilterTags = (): UseFilterManagerResult['resetFilterTags'] => {
  const { resetFilterTags } = useContext(FilterContext)
  return resetFilterTags
}

export const useSearchPhrase = (): UseFilterManagerResult['searchPhrase'] => {
  const { searchPhrase } = useContext(FilterContext)
  return searchPhrase
}

export const useSetSearchPhrase = (): UseFilterManagerResult['setSearchPhrase'] => {
  const { setSearchPhrase } = useContext(FilterContext)
  return setSearchPhrase
}

export const useVisibleLayer = (): UseFilterManagerResult['visibleLayers'] => {
  const { visibleLayers } = useContext(FilterContext)
  return visibleLayers
}

export const useAddVisibleLayer = (): UseFilterManagerResult['addVisibleLayer'] => {
  const { addVisibleLayer } = useContext(FilterContext)
  return addVisibleLayer
}

export const useToggleVisibleLayer = (): UseFilterManagerResult['toggleVisibleLayer'] => {
  const { toggleVisibleLayer } = useContext(FilterContext)
  return toggleVisibleLayer
}

export const useResetVisibleLayers = (): UseFilterManagerResult['resetVisibleLayers'] => {
  const { resetVisibleLayers } = useContext(FilterContext)
  return resetVisibleLayers
}

export const useIsLayerVisible = (): UseFilterManagerResult['isLayerVisible'] => {
  const { isLayerVisible } = useContext(FilterContext)
  return isLayerVisible
}

export const useAddVisibleGroupType = (): UseFilterManagerResult['addVisibleGroupType'] => {
  const { addVisibleGroupType } = useContext(FilterContext)
  return addVisibleGroupType
}

export const useToggleVisibleGroupType = (): UseFilterManagerResult['toggleVisibleGroupType'] => {
  const { toggleVisibleGroupType } = useContext(FilterContext)
  return toggleVisibleGroupType
}

export const useIsGroupTypeVisible = (): UseFilterManagerResult['isGroupTypeVisible'] => {
  const { isGroupTypeVisible } = useContext(FilterContext)
  return isGroupTypeVisible
}

export const useVisibleGroupType = (): UseFilterManagerResult['visibleGroupTypes'] => {
  const { visibleGroupTypes } = useContext(FilterContext)
  return visibleGroupTypes
}
