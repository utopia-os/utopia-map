import { useEffect, useState } from 'react'

import { useSetItemsApi, useSetItemsData } from './hooks/useItems'
import { useAddTag } from './hooks/useTags'
import LayerContext from './LayerContext'

import type { LayerProps } from '#types/LayerProps'
import type { Tag } from '#types/Tag'

export type { Point } from 'geojson'
export type { Item } from '#types/Item'
export type { LayerProps } from '#types/LayerProps'
export type { Tag } from '#types/Tag'
export type { Popup } from 'leaflet'

/**
 * @category Map
 */
export const Layer = ({
  id,
  data,
  children,
  name = 'places',
  menuText = 'add new place',
  menuColor = '#2E7D32',
  markerIcon,
  markerShape = 'circle',
  markerDefaultColor = '#777',
  markerDefaultColor2 = 'RGBA(35, 31, 32, 0.2)',
  api,
  itemType,
  userProfileLayer = false,
  customEditLink,
  customEditParameter,
  // eslint-disable-next-line camelcase
  public_edit_items,
  listed = true,
}: LayerProps) => {
  const setItemsApi = useSetItemsApi()
  const setItemsData = useSetItemsData()

  const addTag = useAddTag()
  const [newTagsToAdd] = useState<Tag[]>([])
  const [tagsReady] = useState<boolean>(false)

  useEffect(() => {
    data &&
      setItemsData({
        id,
        data,
        children,
        name,
        menuText,
        menuColor,
        markerIcon,
        markerShape,
        markerDefaultColor,
        markerDefaultColor2,
        api,
        itemType,
        userProfileLayer,
        // Can we just use editCallback for all cases?
        customEditLink,
        customEditParameter,
        // eslint-disable-next-line camelcase
        public_edit_items,
        listed,
      })
    api &&
      setItemsApi({
        id,
        data,
        children,
        name,
        menuText,
        menuColor,
        markerIcon,
        markerShape,
        markerDefaultColor,
        markerDefaultColor2,
        api,
        itemType,
        userProfileLayer,
        customEditLink,
        customEditParameter,
        // eslint-disable-next-line camelcase
        public_edit_items,
        listed,
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, api])

  useEffect(() => {
    if (tagsReady) {
      const processedTags = {}
      newTagsToAdd.map((newtag) => {
        if (!processedTags[newtag.name]) {
          processedTags[newtag.name] = true
          addTag(newtag)
        }
        return null
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsReady])

  return (
    <LayerContext.Provider
      value={{
        name,
        markerDefaultColor,
        markerDefaultColor2,
        markerShape,
        markerIcon,
        menuText,
      }}
    >
      {children}
    </LayerContext.Provider>
  )
}
