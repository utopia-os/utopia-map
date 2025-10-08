import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import type { Map as MapboxMap } from 'mapbox-gl'
import 'mapbox-gl-leaflet'

type MapboxGLLayer = L.Layer & {
  getMapboxMap: () => MapboxMap | undefined
}

interface MapboxGLLayerOptions {
  accessToken: string
  style: string
  attribution?: string
}

type LeafletWithMapbox = typeof L & {
  mapboxGL: (options: MapboxGLLayerOptions) => MapboxGLLayer
}

type MapboxMapWithProjection = MapboxMap & {
  setProjection?: (projectionName: string) => void
}

interface MapboxVectorTileLayerProps {
  mapboxStyle: string
  mapboxToken: string
  attribution: string
}

/**
 * Component to render Mapbox Vector Tiles using mapbox-gl-leaflet
 * @category Map
 */
export const MapboxVectorTileLayer = ({
  mapboxStyle,
  mapboxToken,
  attribution,
}: MapboxVectorTileLayerProps) => {
  const map = useMap()

  useEffect(() => {
    if (!mapboxStyle || !mapboxToken) return

    // Create Mapbox GL layer
    const leafletWithMapbox = L as LeafletWithMapbox
    const gl = leafletWithMapbox.mapboxGL({
      accessToken: mapboxToken,
      style: mapboxStyle,
      attribution,
    })

    gl.addTo(map)

    // Access the Mapbox GL map instance and disable globe projection
    const mapboxMap = gl.getMapboxMap() as MapboxMapWithProjection | undefined
    mapboxMap?.setProjection('mercator')

    // Cleanup on unmount
    return () => {
      if (map.hasLayer(gl)) {
        map.removeLayer(gl)
      }
    }
  }, [attribution, map, mapboxStyle, mapboxToken])

  return null
}
