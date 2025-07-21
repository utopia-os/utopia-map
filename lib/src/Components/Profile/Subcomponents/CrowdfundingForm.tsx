import { TextInput, InputLabel } from '#components/Input'

import type { FormState } from '#types/FormState'

export const CrowdfundingForm = ({
  state,
  setState,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
}) => {
  return (
    <div className='tw:mt-4 tw:space-y-4'>
      <div>
        <InputLabel label='Open Collective Slug' />
        <TextInput
          placeholder='Open Collective Slug'
          type='text'
          required={false}
          defaultValue={state.openCollectiveSlug}
          updateFormValue={(v) =>
            setState((prevState) => ({
              ...prevState,
              openCollectiveSlug: v,
            }))
          }
        />
      </div>
    </div>
  )
}
