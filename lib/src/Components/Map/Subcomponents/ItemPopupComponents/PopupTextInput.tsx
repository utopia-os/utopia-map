/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { TextInput } from '#components/Input'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const PopupTextInput = ({
  dataField,
  placeholder,
  style,
  item,
}: {
  dataField: string
  placeholder: string
  style?: string
  item?: Item
}) => {
  return (
    <TextInput
      defaultValue={item?.name ? item.name : ''}
      dataField={dataField}
      placeholder={placeholder}
      inputStyle={style}
      type='text'
      containerStyle={'tw:mt-4 tw:mb-2'}
    ></TextInput>
  )
}
