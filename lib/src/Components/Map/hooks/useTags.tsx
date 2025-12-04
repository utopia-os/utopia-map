/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback, useReducer, createContext, useContext, useState } from 'react'

import { hashTagRegex } from '#utils/HashTagRegex'

import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'
import type { Tag } from '#types/Tag'

type ActionType = { type: 'ADD'; tag: Tag } | { type: 'REMOVE'; id: string }

type UseTagManagerResult = ReturnType<typeof useTagsManager>

const TagContext = createContext<UseTagManagerResult>({
  tags: [],
  addTag: () => {},
  setTagApi: () => {},
  setTagData: () => {},
  getItemTags: () => [],
  allTagsLoaded: false,
})

function useTagsManager(initialTags: Tag[]): {
  tags: Tag[]
  addTag: (tag: Tag) => void
  setTagApi: (api: ItemsApi<Tag>) => void
  setTagData: (data: Tag[]) => void
  getItemTags: (item: Item) => Tag[]
  allTagsLoaded: boolean
} {
  const [allTagsLoaded, setallTagsLoaded] = useState<boolean>(false)
  const [tagCount, setTagCount] = useState<number>(0)

  const [tags, dispatch] = useReducer((state: Tag[], action: ActionType) => {
    switch (action.type) {
      case 'ADD':
        // eslint-disable-next-line no-case-declarations
        const exist = state.find(
          (tag) => tag.name.toLocaleLowerCase() === action.tag.name.toLocaleLowerCase(),
        )
        if (!exist) {
          const newState = [...state, { ...action.tag }]
          if (tagCount === newState.length) setallTagsLoaded(true)
          return newState
        } else return state
      default:
        throw new Error()
    }
  }, initialTags)

  const [api, setApi] = useState<ItemsApi<Tag>>({} as ItemsApi<Tag>)

  const setTagApi = useCallback(async (api: ItemsApi<Tag>) => {
    setApi(api)
    const result = await api.getItems()
    setTagCount(result.length)
    if (tagCount === 0) setallTagsLoaded(true)
    if (result) {
      result.map((tag) => {
        // tag.name = tag.name.toLocaleLowerCase();
        dispatch({ type: 'ADD', tag })
        return null
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTagData = useCallback((data: Tag[]) => {
    data.map((tag) => {
      // tag.name = tag.name.toLocaleLowerCase();
      dispatch({ type: 'ADD', tag })
      return null
    })
  }, [])

  const addTag = (tag: Tag) => {
    dispatch({
      type: 'ADD',
      tag,
    })
    if (!tags.some((t) => t.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase())) {
      api.createItem && api.createItem(tag)
    }
  }

  const getItemTags = useCallback(
    (item: Item) => {
      const text = item.text
      const itemTagStrings = text?.match(hashTagRegex)
      const itemTags: Tag[] = []
      itemTagStrings?.map((tag) => {
        if (tags.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase())) {
          itemTags.push(
            tags.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase())!,
          )
        }
        return null
      })
      // Could be refactored as it occurs in multiple places
      item.offers?.forEach((o) => {
        const offer = tags.find((t) => t.id === o.tags_id)
        offer && itemTags.push(offer)
      })
      item.needs?.forEach((n) => {
        const need = tags.find((t) => t.id === n.tags_id)
        need && itemTags.push(need)
      })

      return itemTags
    },
    [tags],
  )

  return { tags, addTag, setTagApi, setTagData, getItemTags, allTagsLoaded }
}

export const TagsProvider: React.FunctionComponent<{
  initialTags: Tag[]
  children?: React.ReactNode
}> = ({ initialTags, children }) => (
  <TagContext.Provider value={useTagsManager(initialTags)}>{children}</TagContext.Provider>
)

export const useTags = (): Tag[] => {
  const { tags } = useContext(TagContext)
  return tags
}

export const useAddTag = (): UseTagManagerResult['addTag'] => {
  const { addTag } = useContext(TagContext)
  return addTag
}

export const useSetTagApi = (): UseTagManagerResult['setTagApi'] => {
  const { setTagApi } = useContext(TagContext)
  return setTagApi
}

export const useSetTagData = (): UseTagManagerResult['setTagData'] => {
  const { setTagData } = useContext(TagContext)
  return setTagData
}

export const useGetItemTags = (): UseTagManagerResult['getItemTags'] => {
  const { getItemTags } = useContext(TagContext)
  return getItemTags
}

export const useAllTagsLoaded = (): UseTagManagerResult['allTagsLoaded'] => {
  const { allTagsLoaded } = useContext(TagContext)
  return allTagsLoaded
}
