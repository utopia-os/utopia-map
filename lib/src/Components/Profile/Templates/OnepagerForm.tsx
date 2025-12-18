import { TextAreaInput } from '#components/Input'
import { ContactInfoForm } from '#components/Profile/Subcomponents/ContactInfoForm'
import { GroupSubheaderForm } from '#components/Profile/Subcomponents/GroupSubheaderForm'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

export const OnepagerForm = ({
  item,
  state,
  setState,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  item: Item
}) => {
  return (
    <div className='tw:space-y-6 tw:mt-6'>
      <GroupSubheaderForm state={state} setState={setState} item={item}></GroupSubheaderForm>
      <ContactInfoForm state={state} setState={setState}></ContactInfoForm>

      <div>
        <label
          htmlFor='description'
          className='tw:block tw:text-sm tw:font-medium tw:text-gray-500 tw:mb-1'
        >
          Gruppenbeschreibung:
        </label>
        <TextAreaInput
          placeholder='Beschreibung'
          defaultValue={state.text || ''}
          updateFormValue={(v) => {
            setState((prevState) => ({
              ...prevState,
              text: v,
            }))
          }}
          inputStyle='tw:h-48'
        />
      </div>
    </div>
  )
}
