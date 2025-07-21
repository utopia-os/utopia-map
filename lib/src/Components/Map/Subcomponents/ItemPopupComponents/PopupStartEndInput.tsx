/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { TextInput } from '#components/Input'

import type { Item } from '#types/Item'

export interface StartEndInputProps {
  item?: Item
  showLabels?: boolean
  updateStartValue?: (value: string) => void
  updateEndValue?: (value: string) => void
  containerStyle?: string
}

/**
 * @category Map
 */
export const PopupStartEndInput = ({
  item,
  showLabels = true,
  updateStartValue,
  updateEndValue,
  containerStyle,
}: StartEndInputProps) => {
  return (
    <div className={`tw:grid tw:grid-cols-2 tw:gap-2 ${containerStyle ?? ''}`}>
      <TextInput
        type='date'
        placeholder='start'
        dataField='start'
        inputStyle='tw:text-sm tw:px-2'
        labelTitle={showLabels ? 'Start' : ''}
        defaultValue={item && item.start ? item.start.substring(0, 10) : ''}
        autocomplete='one-time-code'
        updateFormValue={updateStartValue}
      ></TextInput>
      <TextInput
        type='date'
        placeholder='end'
        dataField='end'
        inputStyle='tw:text-sm tw:px-2'
        labelTitle={showLabels ? 'End' : ''}
        defaultValue={item && item.end ? item.end.substring(0, 10) : ''}
        autocomplete='one-time-code'
        updateFormValue={updateEndValue}
      ></TextInput>
    </div>
  )
}
