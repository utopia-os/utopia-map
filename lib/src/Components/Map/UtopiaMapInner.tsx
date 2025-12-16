/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useRef } from 'react'
import { TileLayer, useMapEvents, GeoJSON, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Outlet, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

import { useSetAppState } from '#components/AppShell/hooks/useAppState'
import { useTheme } from '#components/AppShell/hooks/useTheme'
import { containsUUID } from '#utils/ContainsUUID'
import {
  removeItemFromUrl,
  resetMetaTags as resetMetaTagsUtil,
  setItemInUrl,
  updateMetaTags,
} from '#utils/UrlHelper'

import { useClusterRef, useSetClusterRef } from './hooks/useClusterRef'
import {
  useAddFilterTag,
  useAddVisibleLayer,
  useFilterTags,
  useResetFilterTags,
  useToggleVisibleLayer,
} from './hooks/useFilter'
import { useLayers } from './hooks/useLayers'
import { useLeafletRefs } from './hooks/useLeafletRefs'
import { usePopupForm } from './hooks/usePopupForm'
import {
  useSelectPosition,
  useSetMapClicked,
  useSetSelectPosition,
} from './hooks/useSelectPosition'
import { useTags } from './hooks/useTags'
import AddButton from './Subcomponents/AddButton'
import { Control } from './Subcomponents/Controls/Control'
import { FilterControl } from './Subcomponents/Controls/FilterControl'
import { FullscreenControl } from './Subcomponents/Controls/FullscreenControl'
import { GratitudeControl } from './Subcomponents/Controls/GratitudeControl'
import { LayerControl } from './Subcomponents/Controls/LayerControl'
import { SearchControl } from './Subcomponents/Controls/SearchControl'
import { TagsControl } from './Subcomponents/Controls/TagsControl'
import { TextView } from './Subcomponents/ItemPopupComponents/TextView'
import { MapLibreLayer } from './Subcomponents/MapLibreLayer'
import { SelectPositionToast } from './Subcomponents/SelectPositionToast'

import type { Feature, Geometry as GeoJSONGeometry, GeoJsonObject } from 'geojson'

export function UtopiaMapInner({
  children,
  geo,
  showFilterControl = false,
  showGratitudeControl = false,
  showLayerControl = true,
  showFullscreenControl = false,
  showThemeControl = false,
  defaultTheme = '',
  donationWidget,
  expandLayerControl,
  tileServerUrl,
  tileServerAttribution,
  tilesType,
  maplibreStyle,
  zoomOffset = 0,
  tileSize = 256,
  showZoomControl,
}: {
  children?: React.ReactNode
  geo?: GeoJsonObject
  showFilterControl?: boolean
  showLayerControl?: boolean
  showGratitudeControl?: boolean
  showFullscreenControl?: boolean
  donationWidget?: boolean
  showThemeControl?: boolean
  defaultTheme?: string
  expandLayerControl?: boolean
  tileServerUrl?: string
  tileServerAttribution?: string
  tilesType?: 'raster' | 'maplibre'
  maplibreStyle?: string
  zoomOffset?: number
  tileSize?: number
  showZoomControl?: boolean
}) {
  const selectNewItemPosition = useSelectPosition()
  const setSelectNewItemPosition = useSetSelectPosition()
  const setClusterRef = useSetClusterRef()
  const clusterRef = useClusterRef()
  const setMapClicked = useSetMapClicked()
  const { setPopupForm } = usePopupForm()
  const layers = useLayers()
  const addVisibleLayer = useAddVisibleLayer()
  const leafletRefs = useLeafletRefs()
  const location = useLocation()
  const map = useMap()

  useTheme(defaultTheme)

  useEffect(() => {
    layers.forEach((layer) => {
      addVisibleLayer(layer)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers])

  const setAppState = useSetAppState()

  useEffect(() => {
    setAppState({ showThemeControl })
  }, [setAppState, showThemeControl])

  const init = useRef(false)
  useEffect(() => {
    if (!init.current) {
      donationWidget &&
        setTimeout(() => {
          toast(
            <>
              <TextView itemId='' rawText={'## Do you like this Map?'} />
              <div>
                <TextView
                  itemId=''
                  rawText={
                    'Support us building free opensource maps for communities and help us grow 🌱☀️'
                  }
                />
                <a href='https://opencollective.com/utopia-project'>
                  <div className='tw:btn  tw:btn-sm tw:float-right tw:btn-primary'>Donate</div>
                </a>
              </div>
            </>,
            { autoClose: false },
          )
        }, 600000)
      init.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function MapEventListener() {
    useMapEvents({
      click: (e) => {
        resetMetaTags()
        // eslint-disable-next-line no-console
        console.log(e.latlng.lat + ',' + e.latlng.lng)
        if (selectNewItemPosition) {
          setMapClicked({ position: e.latlng, setItemFormPopup: setPopupForm })
        }
      },
      moveend: () => {},
    })
    return null
  }

  // Track if we're currently switching popups to prevent URL cleanup
  const popupCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useMapEvents({
    popupopen: (e) => {
      const item = Object.entries(leafletRefs).find((r) => r[1].popup === e.popup)?.[1].item

      // Cancel any pending popup close URL cleanup - we're opening a new popup
      if (popupCloseTimeoutRef.current) {
        clearTimeout(popupCloseTimeoutRef.current)
        popupCloseTimeoutRef.current = null
      }

      // Only update URL if no profile is open
      if (!location.pathname.includes('/item/')) {
        if (window.location.pathname.split('/')[1] !== item?.id && item?.id) {
          setItemInUrl(item.id)
        }
        if (item?.name) {
          updateMetaTags(item.name, item.text)
        }
      }
      // If profile is open, don't change URL but still update meta tags
      else if (item?.name) {
        updateMetaTags(item.name, item.text)
      }
    },
    popupclose: () => {
      // Only remove UUID from URL if no profile is open
      if (!location.pathname.includes('/item/')) {
        // Wait briefly to see if another popup is being opened
        // If so, the popupopen handler will cancel this timeout
        popupCloseTimeoutRef.current = setTimeout(() => {
          if (containsUUID(window.location.pathname)) {
            removeItemFromUrl()
            resetMetaTagsUtil()
          }
          popupCloseTimeoutRef.current = null
        }, 50)
      }
    },
  })

  const openPopup = () => {
    if (!containsUUID(window.location.pathname)) {
      map.closePopup()
    } else {
      if (window.location.pathname.split('/')[1]) {
        const id = window.location.pathname.split('/')[1]
        // eslint-disable-next-line security/detect-object-injection
        const ref = leafletRefs[id]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (ref) {
          clusterRef.hasLayer(ref.marker) &&
            clusterRef?.zoomToShowLayer(ref.marker, () => {
              ref.marker.openPopup()
            })
          if (ref.item.name) {
            updateMetaTags(ref.item.name, ref.item.text)
          }
        }
      }
    }
  }

  useEffect(() => {
    openPopup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletRefs, location])

  const resetMetaTags = () => {
    if (containsUUID(window.location.pathname)) {
      removeItemFromUrl()
    }
    resetMetaTagsUtil()
  }

  const onEachFeature = (feature: Feature<GeoJSONGeometry, any>, layer: L.Layer) => {
    if (feature.properties) {
      layer.bindPopup(feature.properties.name)
    }
  }

  const addFilterTag = useAddFilterTag()
  const resetFilterTags = useResetFilterTags()
  const tags = useTags()
  const filterTags = useFilterTags()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const urlTags = params.get('tags')
    const decodedTags = urlTags ? decodeURIComponent(urlTags) : ''
    const decodedTagsArray = decodedTags.split(';').filter(Boolean)

    const urlDiffersFromState =
      decodedTagsArray.some(
        (ut) => !filterTags.find((ft) => ut.toLowerCase() === ft.name.toLowerCase()),
      ) ||
      filterTags.some(
        (ft) => !decodedTagsArray.find((ut) => ut.toLowerCase() === ft.name.toLowerCase()),
      )

    if (urlDiffersFromState) {
      resetFilterTags()
      decodedTagsArray.forEach((urlTag) => {
        const match = tags.find((t) => t.name.toLowerCase() === urlTag.toLowerCase())
        if (match) addFilterTag(match)
      })
    }
  }, [location, tags, filterTags, addFilterTag, resetFilterTags])

  const toggleVisibleLayer = useToggleVisibleLayer()
  const allLayers = useLayers()

  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current || allLayers.length === 0) return

    const params = new URLSearchParams(location.search)
    const urlLayersParam = params.get('layers')
    if (!urlLayersParam) {
      initializedRef.current = true
      return
    }

    const urlLayerNames = urlLayersParam.split(',').filter(Boolean)

    const layerNamesToHide = allLayers
      .map((l) => l.name)
      .filter((name) => !urlLayerNames.includes(name))

    layerNamesToHide.forEach((name) => {
      const match = allLayers.find((l) => l.name === name)
      if (match) toggleVisibleLayer(match)
    })

    initializedRef.current = true
  }, [location, allLayers, toggleVisibleLayer])

  return (
    <div className={`tw:h-full ${selectNewItemPosition != null ? 'crosshair-cursor-enabled' : ''}`}>
      <Outlet />
      <Control position='topLeft' zIndex='1000' absolute>
        <SearchControl />
        <div className={showZoomControl ? 'tw:pl-14' : ''}>
          <TagsControl />
        </div>
      </Control>
      <Control position='bottomLeft' zIndex='999' absolute>
        {showFullscreenControl && <FullscreenControl />}
        {showFilterControl && <FilterControl />}
        {showLayerControl && <LayerControl expandLayerControl={expandLayerControl ?? false} />}
        {showGratitudeControl && <GratitudeControl />}
      </Control>
      {tilesType === 'raster' ? (
        <TileLayer
          maxZoom={19}
          tileSize={tileSize}
          zoomOffset={zoomOffset}
          attribution={
            tileServerAttribution ??
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
          url={tileServerUrl ?? 'https://tile.osmand.net/hd/{z}/{x}/{y}.png'}
        />
      ) : (
        <MapLibreLayer styleUrl={maplibreStyle} attribution={tileServerAttribution} />
      )}
      <MarkerClusterGroup
        ref={(r) => {
          setClusterRef(r as any)
        }}
        showCoverageOnHover
        chunkedLoading
        maxClusterRadius={50}
        removeOutsideVisibleBounds={false}
      >
        {children}
      </MarkerClusterGroup>
      {geo && (
        <GeoJSON
          data={geo}
          onEachFeature={onEachFeature}
          eventHandlers={{
            click: (e) => {
              if (selectNewItemPosition) {
                e.propagatedFrom.closePopup()
                setMapClicked({ position: e.latlng, setItemFormPopup: setPopupForm })
              }
            },
          }}
        />
      )}
      <MapEventListener />
      <AddButton triggerAction={setSelectNewItemPosition} />
      <SelectPositionToast
        selectNewItemPosition={selectNewItemPosition}
        setSelectNewItemPosition={setSelectNewItemPosition}
      />
    </div>
  )
}
