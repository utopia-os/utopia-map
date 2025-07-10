import { useCallback, useEffect, useState } from 'react'

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
  data,
  children,
  name = 'places',
  menuIcon = 'MapPinIcon',
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

  const initializeWithData = useCallback(() => {
    if (!data) return
    setItemsData({
      data,
      children,
      name,
      menuIcon,
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
  }, [
    api,
    children,
    customEditLink,
    customEditParameter,
    data,
    itemType,
    listed,
    markerDefaultColor,
    markerDefaultColor2,
    markerIcon,
    markerShape,
    menuColor,
    menuIcon,
    menuText,
    name,
    // eslint-disable-next-line camelcase
    public_edit_items,
    setItemsData,
    userProfileLayer,
  ])

  const initializeWithApi = useCallback(() => {
    if (!api) return
    setItemsApi({
      data,
      children,
      name,
      menuIcon,
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
  }, [
    api,
    children,
    customEditLink,
    customEditParameter,
    data,
    itemType,
    listed,
    markerDefaultColor,
    markerDefaultColor2,
    markerIcon,
    markerShape,
    menuColor,
    menuIcon,
    menuText,
    name,
    // eslint-disable-next-line camelcase
    public_edit_items,
    setItemsApi,
    userProfileLayer,
  ])

  useEffect(() => {
    if (data) initializeWithData()
    if (api) initializeWithApi()
  }, [data, api, initializeWithData, initializeWithApi])

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
