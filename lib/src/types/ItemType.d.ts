import type { Key } from 'react'

export interface ItemType {
  name: string
  show_name_input: boolean
  show_profile_button: boolean
  show_start_end: boolean
  show_start_end_input: boolean
  show_text: boolean
  show_text_input: boolean
  custom_text: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profileTemplate: { collection: string | number; id: Key | null | undefined; item: any }[]
  offers_and_needs: boolean
  icon_as_labels: unknown
  relations: boolean
  template: string
  questlog: boolean
  small_form_edit?: boolean
}
