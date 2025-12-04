/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import type { markerIcon } from '#utils/MarkerIconFactory'
import type { GalleryItem, Item } from './Item'
import type { Tag } from './Tag'

export interface FormState {
  color: string
  id: string
  group_type: string
  status: string
  name: string
  subname: string
  text: string
  contact: string
  telephone: string
  next_appointment: string
  image: string
  marker_icon: markerIcon | undefined
  offers: Tag[]
  needs: Tag[]
  relations: Item[]
  start: string
  end: string
  openCollectiveSlug: string
  gallery: GalleryItem[]
  uploadingImages: File[]
}
