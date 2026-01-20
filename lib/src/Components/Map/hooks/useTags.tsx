/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback, useReducer, createContext, useContext, useState, useRef } from 'react'

import { hashTagRegex } from '#utils/HashTagRegex'
import { randomColor } from '#utils/RandomColor'

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
  processItemsTags: () => {},
  allTagsLoaded: false,
})

function useTagsManager(initialTags: Tag[]): {
  tags: Tag[]
  addTag: (tag: Tag) => void
  setTagApi: (api: ItemsApi<Tag>) => void
  setTagData: (data: Tag[]) => void
  getItemTags: (item: Item) => Tag[]
  processItemsTags: (items: Item[]) => void
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

  const apiRef = useRef<ItemsApi<Tag>>({} as ItemsApi<Tag>)
  const tagsRef = useRef<Tag[]>(initialTags)

  // Keep tagsRef in sync with tags state
  tagsRef.current = tags

  const setTagApi = useCallback(async (api: ItemsApi<Tag>) => {
    apiRef.current = api
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

  const addTag = useCallback((tag: Tag) => {
    // Check against current tags using ref to avoid stale closure
    const tagExists = tagsRef.current.some(
      (t) => t.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase(),
    )

    dispatch({
      type: 'ADD',
      tag,
    })

    // Only create in API if tag doesn't already exist
    if (!tagExists && apiRef.current.createItem) {
      apiRef.current.createItem(tag)
    }
  }, [])

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

  // Process all items and create missing tags
  const processItemsTags = useCallback(
    (items: Item[]) => {
      const currentTags = tagsRef.current
      const newTags: Tag[] = []

      items.forEach((item) => {
        const text = item.text
        text?.match(hashTagRegex)?.forEach((tag) => {
          const tagName = tag.slice(1)
          const tagNameLower = tagName.toLocaleLowerCase()

          // Check if tag exists in current tags or already queued
          const existsInTags = currentTags.some(
            (t) => t.name.toLocaleLowerCase() === tagNameLower,
          )
          const existsInNew = newTags.some(
            (t) => t.name.toLocaleLowerCase() === tagNameLower,
          )

          if (!existsInTags && !existsInNew) {
            newTags.push({
              id: crypto.randomUUID(),
              name: tagName,
              color: randomColor(),
            })
          }
        })
      })

      // Add all new tags
      newTags.forEach((tag) => {
        dispatch({ type: 'ADD', tag })
        if (apiRef.current.createItem) {
          apiRef.current.createItem(tag)
        }
      })
    },
    [],
  )

  return { tags, addTag, setTagApi, setTagData, getItemTags, processItemsTags, allTagsLoaded }
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

export const useProcessItemsTags = (): UseTagManagerResult['processItemsTags'] => {
  const { processItemsTags } = useContext(TagContext)
  return processItemsTags
}
