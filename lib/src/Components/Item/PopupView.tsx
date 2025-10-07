import { useContext, useMemo, useState } from 'react'
import { Marker, Tooltip } from 'react-leaflet'

import { useAppState } from '#components/AppShell/hooks/useAppState'
import {
  useFilterTags,
  useIsLayerVisible,
  useIsGroupTypeVisible,
  useVisibleGroupType,
} from '#components/Map/hooks/useFilter'
import { useItems, useAllItemsLoaded } from '#components/Map/hooks/useItems'
import { useAddMarker, useAddPopup, useLeafletRefs } from '#components/Map/hooks/useLeafletRefs'
import { useSetMarkerClicked, useSelectPosition } from '#components/Map/hooks/useSelectPosition'
import { useGetItemTags, useAllTagsLoaded, useTags } from '#components/Map/hooks/useTags'
import LayerContext from '#components/Map/LayerContext'
import { ItemViewPopup } from '#components/Map/Subcomponents/ItemViewPopup'
import { encodeTag } from '#utils/FormatTags'
import { hashTagRegex } from '#utils/HashTagRegex'
import MarkerIconFactory from '#utils/MarkerIconFactory'
import { randomColor } from '#utils/RandomColor'

import TemplateItemContext from './TemplateItemContext'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'
import type { Popup } from 'leaflet'

/**
 * @category Item
 */
export const PopupView = ({ children }: { children?: React.ReactNode }) => {
  const layerContext = useContext(LayerContext)
  const { name, markerDefaultColor, markerDefaultColor2, markerShape, markerIcon } = layerContext

  const filterTags = useFilterTags()

  const appState = useAppState()

  const items = useItems()

  const getItemTags = useGetItemTags()
  const addMarker = useAddMarker()
  const addPopup = useAddPopup()
  const leafletRefs = useLeafletRefs()

  const allTagsLoaded = useAllTagsLoaded()
  const allItemsLoaded = useAllItemsLoaded()

  const setMarkerClicked = useSetMarkerClicked()
  const selectPosition = useSelectPosition()

  const tags = useTags()
  const [newTagsToAdd, setNewTagsToAdd] = useState<Tag[]>([])
  const [tagsReady, setTagsReady] = useState<boolean>(false)

  const isLayerVisible = useIsLayerVisible()

  const isGroupTypeVisible = useIsGroupTypeVisible()

  const visibleGroupTypes = useVisibleGroupType()

  const visibleItems = useMemo(
    () =>
      items
        .filter((item) => item.layer?.name === name)
        .filter((item) =>
          filterTags.length === 0
            ? item
            : filterTags.some((tag) =>
                getItemTags(item).some(
                  (filterTag) =>
                    filterTag.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase(),
                ),
              ),
        )
        .filter((item) => item.layer && isLayerVisible(item.layer))
        .filter(
          (item) =>
            (item.group_type && isGroupTypeVisible(item.group_type)) ||
            visibleGroupTypes.length === 0,
        ),
    [
      filterTags,
      getItemTags,
      isGroupTypeVisible,
      isLayerVisible,
      items,
      name,
      visibleGroupTypes.length,
    ],
  )

  return visibleItems.map((item: Item) => {
    if (!(item.position?.coordinates[0] && item.position.coordinates[1])) return null

    if (item.tags) {
      item.text += '\n\n'
      item.tags.map((tag) => {
        if (!item.text?.includes(`#${encodeTag(tag)}`)) {
          item.text += `#${encodeTag(tag)}`
        }
        return item.text
      })
    }

    if (allTagsLoaded && allItemsLoaded) {
      item.text?.match(hashTagRegex)?.map((tag) => {
        if (
          !tags.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase()) &&
          !newTagsToAdd.find((t) => t.name.toLocaleLowerCase() === tag.slice(1).toLocaleLowerCase())
        ) {
          const newTag = {
            id: crypto.randomUUID(),
            name: tag.slice(1),
            color: randomColor(),
          }
          setNewTagsToAdd((current) => [...current, newTag])
        }
        return null
      })
      !tagsReady && setTagsReady(true)
    }

    const itemTags = getItemTags(item)

    const latitude = item.position.coordinates[1]
    const longitude = item.position.coordinates[0]

    let color1 = markerDefaultColor
    let color2 = markerDefaultColor2
    if (item.color) {
      color1 = item.color
    } else if (itemTags[0]) {
      color1 = itemTags[0].color
    }
    if (itemTags[0] && item.color) {
      color2 = itemTags[0].color
    } else if (itemTags[1]) {
      color2 = itemTags[1].color
    }

    return (
      <TemplateItemContext.Provider value={item} key={item.id}>
        <Marker
          ref={(r) => {
            if (!(item.id in leafletRefs && leafletRefs[item.id].marker === r)) {
              r && addMarker(item, r)
            }
          }}
          eventHandlers={{
            click: () => {
              selectPosition && setMarkerClicked(item)
            },
          }}
          icon={MarkerIconFactory(
            markerShape,
            color1,
            color2,
            item.markerIcon ?? markerIcon,
            appState.assetsApi.url,
          )}
          position={[latitude, longitude]}
        >
          <ItemViewPopup
            ref={(r: Popup | null) => {
              if (!(item.id in leafletRefs && leafletRefs[item.id].popup === r)) {
                r && addPopup(item, r)
              }
            }}
            item={item}
          >
            {children}
          </ItemViewPopup>

          <Tooltip offset={[0, -38]} direction='top'>
            {item.name ||
              (item.layer?.name.endsWith('s') ? item.layer.name.slice(0, -1) : item.layer?.name)}
          </Tooltip>
        </Marker>
      </TemplateItemContext.Provider>
    )
  })
}
