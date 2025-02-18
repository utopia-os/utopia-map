import type { Item } from './Item'
import type { ItemFormPopupProps } from './ItemFormPopupProps'
import type { ItemsApi } from './ItemsApi'
import type { ItemType } from './ItemType'

/**
 * @category Types
 */
export interface LayerProps {
  id?: string
  data?: Item[]
  children?: React.ReactNode
  name: string
  menuIcon: string
  menuColor: string
  menuText: string
  markerIcon: string
  markerShape: string
  markerDefaultColor: string
  markerDefaultColor2?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  api?: ItemsApi<any>
  itemType: ItemType
  onlyOnePerOwner?: boolean
  customEditLink?: string
  customEditParameter?: string
  public_edit_items?: boolean
  listed?: boolean
  item_presets?: Record<string, unknown>
  setItemFormPopup?: React.Dispatch<React.SetStateAction<ItemFormPopupProps | null>>
  itemFormPopup?: ItemFormPopupProps | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clusterRef?: any
}
