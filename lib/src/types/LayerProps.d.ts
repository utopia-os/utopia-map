import type { Item } from './Item'
import type { ItemsApi } from './ItemsApi'
import type { ItemType } from './ItemType'
import type { MarkerIcon } from './MarkerIcon'

/**
 * @category Types
 */
export interface LayerProps {
  id: string
  data?: Item[]
  children?: React.ReactNode
  name: string
  menuColor: string
  menuText: string
  markerIcon: MarkerIcon
  markerShape: string
  markerDefaultColor: string
  markerDefaultColor2?: string
  api?: ItemsApi<Item>
  itemType: ItemType
  userProfileLayer?: boolean
  customEditLink?: string
  customEditParameter?: string
  public_edit_items?: boolean
  listed?: boolean
  item_presets?: Record<string, unknown>
}
