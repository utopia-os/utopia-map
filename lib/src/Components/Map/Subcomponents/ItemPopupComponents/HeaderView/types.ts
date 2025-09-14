import type { Item } from '#types/Item'
import type { ItemsApi } from '#types/ItemsApi'

export interface HeaderViewProps {
  item?: Item
  api?: ItemsApi<unknown>
  editCallback?: (e: React.MouseEvent) => void
  deleteCallback?: (e: React.MouseEvent) => void
  setPositionCallback?: () => void
  loading?: boolean
  hideMenu?: boolean
  big?: boolean
  truncateSubname?: boolean
  showAddress?: boolean
}

export interface PlatformConfig {
  shareUrl: string
  icon: JSX.Element
  label: string
  bgColor: string
}

export interface SharePlatformConfigs {
  facebook: PlatformConfig
  twitter: PlatformConfig
  linkedin: PlatformConfig
  whatsapp: PlatformConfig
  telegram: PlatformConfig
  xing: PlatformConfig
}
