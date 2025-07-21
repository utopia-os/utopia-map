import { InputLabel, TextInput } from '#components/Input'

import type { FormState } from '#types/FormState'

export const ContactInfoForm = ({
  state,
  setState,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
}) => {
  return (
    <div className='tw:mt-2 tw:space-y-2'>
      <div>
        <InputLabel label='Email-Adresse (Kontakt)' />
        <TextInput
          placeholder='Email'
          type='email'
          required={false}
          defaultValue={state.contact}
          updateFormValue={(v) =>
            setState((prevState) => ({
              ...prevState,
              contact: v,
            }))
          }
        />
      </div>

      <div>
        <InputLabel label='Telefonnummer (Kontakt)' />
        <TextInput
          placeholder='Telefonnummer'
          type='tel'
          required={false}
          pattern='^\+?[0-9\s\-]{7,15}$'
          defaultValue={state.telephone}
          updateFormValue={(v) =>
            setState((prevState) => ({
              ...prevState,
              telephone: v,
            }))
          }
        />
      </div>
    </div>
  )
}
