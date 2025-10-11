/* eslint-disable import/no-unassigned-import */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import L from 'leaflet'
import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'

// Augment Leaflet namespace with MapLibre GL types
declare module 'leaflet' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function maplibreGL(options: { style: string; attribution?: string }): any
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
    // Create MapLibre GL layer
    const mapLibreLayer = L.maplibreGL({
      style: styleUrl,
      attribution,
    })

    // Add layer to map
    mapLibreLayer.addTo(map)

    // Cleanup function to remove layer when component unmounts
    return () => {
      map.removeLayer(mapLibreLayer)
    }
  }, [map, styleUrl, attribution])

  return null
}
