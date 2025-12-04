/* eslint-disable import-x/no-unassigned-import */
import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'

declare module 'leaflet' {
  interface MapLibreGLOptions {
    style: string
    attribution?: string
  }

  interface MapLibreGLLayer extends Layer {
    addTo(map: Map): this
  }

  function maplibreGL(options: MapLibreGLOptions): MapLibreGLLayer
}

/**
 * MapLibreLayer component for rendering vector tiles with MapLibre GL
 * Integrates MapLibre GL with Leaflet using the maplibre-gl-leaflet bridge
 *
 * @param styleUrl - URL to the MapLibre style JSON (default: OpenFreeMap Liberty style)
 * @param attribution - Attribution text for the map tiles
 */
export function MapLibreLayer({
  styleUrl = 'https://tiles.openfreemap.org/styles/liberty',
  attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}: {
  styleUrl?: string
  attribution?: string
}) {
  const map = useMap()

  useEffect(() => {
    const mapLibreLayer = L.maplibreGL({
      style: styleUrl,
      attribution,
    })

    mapLibreLayer.addTo(map)

    // Cleanup function to remove layer when component unmounts
    return () => {
      map.removeLayer(mapLibreLayer)
    }
  }, [map, styleUrl, attribution])

  return null
}
