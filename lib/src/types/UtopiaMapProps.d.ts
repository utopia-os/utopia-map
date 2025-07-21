import type { Tag } from './Tag'
import type { GeoJsonObject } from 'geojson'

export interface UtopiaMapProps {
  height?: string
  width?: string
  center?: [number, number]
  zoom?: number
  tags?: Tag[]
  children?: React.ReactNode
  geo?: GeoJsonObject
  showFilterControl?: boolean
  showLayerControl?: boolean
  showGratitudeControl?: boolean
  showThemeControl?: boolean
  showZoomControl?: boolean
  infoText?: string
  donationWidget?: boolean
  defaultTheme?: string
  expandLayerControl?: boolean
  tileServerUrl?: string
  tileServerAttribution?: string
}
