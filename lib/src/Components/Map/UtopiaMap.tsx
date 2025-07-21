import { LatLng } from 'leaflet'
import { MapContainer } from 'react-leaflet'

import { ContextWrapper } from '#components/AppShell/ContextWrapper'

import { UtopiaMapInner } from './UtopiaMapInner'

import type { GeoJsonObject } from 'geojson'

/**
 * This component creates the map.
 * ```tsx
 *   <UtopiaMap center={[50.6, 9.5]} zoom={5} height="100dvh" width="100dvw" />
 *  ```
 * You can define its {@link Layer | `Layers`}  as supcomponents.
 * ```tsx
 *     <UtopiaMap center={[50.6, 15.5]} zoom={5} height="100dvh" width="100dvw">
 *       <Layer
 *         name="events"
 *         markerIcon="calendar"
 *         markerShape="square"
 *         markerDefaultColor="#700"
 *         data={events}
 *       />
 *       <Layer
 *         name="places"
 *         markerIcon="point"
 *         markerShape="circle"
 *         markerDefaultColor="#007"
 *         data={places}
 *       />
 *     </UtopiaMap>
 *  ```
 * You can also pass {@link Tags | `Tags`}  or {@link Permissions | `Permissions`}  as subcomponents.
 * ```tsx
 *     <UtopiaMap center={[50.6, 15.5]} zoom={5} height="100dvh" width="100dvw">
 *       ...
 *       <Tags data={tags} />
 *       <Permissions data={permissions} />
 *     </UtopiaMap>
 * ```
 * @category Map
 */
function UtopiaMap({
  height = '500px',
  width = '100%',
  center = [50.6, 9.5],
  zoom = 10,
  children,
  geo,
  showFilterControl = false,
  showGratitudeControl = false,
  showLayerControl = true,
  showZoomControl = false,
  showThemeControl = false,
  defaultTheme,
  donationWidget,
  expandLayerControl,
  tileServerUrl,
  tileServerAttribution,
}: {
  /** height of the map (default '500px') */
  height?: string
  /** width of the map (default '100%') */
  width?: string
  /** initial centered position of the map (default [50.6, 9.5]) */
  center?: [number, number]
  /** initial zoom level of the map (default 10) */
  zoom?: number
  /** React child-components */
  children?: React.ReactNode
  /** GeoJSON to display on the map */
  geo?: GeoJsonObject
  /** show the filter control widget (default false) */
  showFilterControl?: boolean
  /** show the gratitude control widget (default false) */
  showLayerControl?: boolean
  /** show the layer control widget (default true) */
  showGratitudeControl?: boolean
  /** show zoom control widget (default false) */
  showZoomControl?: boolean
  /** show a widget to switch the theme */
  showThemeControl?: boolean
  /** the defaut theme */
  defaultTheme?: string
  /** ask to donate to the Utopia Project OpenCollective campaign (default false) */
  donationWidget?: boolean
  /** open layer control on map initialisation */
  expandLayerControl?: boolean
  /** configure a custom tile server */
  tileServerUrl?: string
  /** configure a custom tile server attribution */
  tileServerAttribution?: string
}) {
  return (
    <ContextWrapper>
      <MapContainer
        style={{ height, width }}
        center={new LatLng(center[0], center[1])}
        zoom={zoom}
        zoomControl={showZoomControl}
        maxZoom={19}
      >
        <UtopiaMapInner
          geo={geo}
          showFilterControl={showFilterControl}
          showGratitudeControl={showGratitudeControl}
          showLayerControl={showLayerControl}
          donationWidget={donationWidget}
          showThemeControl={showThemeControl}
          defaultTheme={defaultTheme}
          expandLayerControl={expandLayerControl}
          tileServerUrl={tileServerUrl}
          tileServerAttribution={tileServerAttribution}
        >
          {children}
        </UtopiaMapInner>
      </MapContainer>
    </ContextWrapper>
  )
}

export { UtopiaMap }
