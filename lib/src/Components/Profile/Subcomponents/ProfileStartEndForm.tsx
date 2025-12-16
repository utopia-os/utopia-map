import { PopupStartEndInput } from '#components/Map/Subcomponents/ItemPopupComponents'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

export const ProfileStartEndForm = ({
  item,
  setState,
}: {
  item: Item
  setState: React.Dispatch<React.SetStateAction<FormState>>
}) => {
  return (
    <PopupStartEndInput
      item={item}
      showLabels={false}
      updateEndValue={(e) => {
        setState((prevState) => ({
          ...prevState,
          end: e,
        }))
      }}
      updateStartValue={(s) => {
        setState((prevState) => ({
          ...prevState,
          start: s,
        }))
      }}
    ></PopupStartEndInput>
  )
}
