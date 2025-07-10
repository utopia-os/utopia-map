/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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

import { useClusterRef, useSetClusterRef } from './hooks/useClusterRef'
import {
  useAddFilterTag,
  useAddVisibleLayer,
  useFilterTags,
  useResetFilterTags,
  useToggleVisibleLayer,
} from './hooks/useFilter'
import { useLayers } from './hooks/useItems'
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
import { GratitudeControl } from './Subcomponents/Controls/GratitudeControl'
import { LayerControl } from './Subcomponents/Controls/LayerControl'
import { SearchControl } from './Subcomponents/Controls/SearchControl'
import { TagsControl } from './Subcomponents/Controls/TagsControl'
import { TextView } from './Subcomponents/ItemPopupComponents/TextView'
import { SelectPosition } from './Subcomponents/SelectPosition'

import type { Feature, Geometry as GeoJSONGeometry, GeoJsonObject } from 'geojson'
import { LayerProps } from '#types/LayerProps'

export function UtopiaMapInner({
  children,
  geo,
  showFilterControl = false,
  showGratitudeControl = false,
  showLayerControl = true,
  showThemeControl = false,
  defaultTheme = '',
  donationWidget,
  expandLayerControl,
  tileServerUrl,
  tileServerAttribution,
}: {
  children?: React.ReactNode
  geo?: GeoJsonObject
  showFilterControl?: boolean
  showLayerControl?: boolean
  showGratitudeControl?: boolean
  donationWidget?: boolean
  showThemeControl?: boolean
  defaultTheme?: string
  expandLayerControl?: boolean
  tileServerUrl?: string
  tileServerAttribution?: string
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
    layers.forEach((layer: LayerProps) => addVisibleLayer(layer))
  }, [addVisibleLayer, layers])

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

  useMapEvents({
    popupopen: (e) => {
      const item = Object.entries(leafletRefs).find((r) => r[1].popup === e.popup)?.[1].item
      if (window.location.pathname.split('/')[1] !== item?.id) {
        const params = new URLSearchParams(window.location.search)
        if (!location.pathname.includes('/item/')) {
          window.history.pushState(
            {},
            '',
            `/${item?.id}` + `${params.toString() !== '' ? `?${params}` : ''}`,
          )
        }
        let title = ''
        if (item?.name) title = item.name
        document.title = `${document.title.split('-')[0]} - ${title}`
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
          let title = ''
          if (ref.item.name) title = ref.item.name
          document.title = `${document.title.split('-')[0]} - ${title}`
          document
            .querySelector('meta[property="og:title"]')
            ?.setAttribute('content', ref.item.name)
          document
            .querySelector('meta[property="og:description"]')
            ?.setAttribute('content', ref.item.text ?? '')
        }
      }
    }
  }

  useEffect(() => {
    openPopup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletRefs, location])

  const resetMetaTags = () => {
    const params = new URLSearchParams(window.location.search)
    if (!containsUUID(window.location.pathname)) {
      window.history.pushState({}, '', '/' + `${params.toString() !== '' ? `?${params}` : ''}`)
    }
    document.title = document.title.split('-')[0]
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute(
        'content',
        `${document.querySelector('meta[name="description"]')?.getAttribute('content')}`,
      )
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
        <TagsControl />
      </Control>
      <Control position='bottomLeft' zIndex='999' absolute>
        {showFilterControl && <FilterControl />}
        {showLayerControl && <LayerControl expandLayerControl={expandLayerControl ?? false} />}
        {showGratitudeControl && <GratitudeControl />}
      </Control>
      <TileLayer
        maxZoom={19}
        attribution={
          tileServerAttribution ??
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
        url={tileServerUrl ?? 'https://tile.osmand.net/hd/{z}/{x}/{y}.png'}
      />
      <MarkerClusterGroup
        ref={(r) => setClusterRef(r as any)}
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
                e.layer.closePopup()
                setMapClicked({ position: e.latlng, setItemFormPopup: setPopupForm })
              }
            },
          }}
        />
      )}
      <MapEventListener />
      <AddButton triggerAction={setSelectNewItemPosition} />
      {selectNewItemPosition != null && (
        <SelectPosition
          selectNewItemPosition={selectNewItemPosition}
          setSelectNewItemPosition={setSelectNewItemPosition}
        />
      )}
    </div>
  )
}
