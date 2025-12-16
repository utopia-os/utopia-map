/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { TextAreaInput } from '#components/Input'

// eslint-disable-next-line react/prop-types
export const SimpleForm = ({ state, setState }) => {
  return (
    <TextAreaInput
      placeholder='About me ...'
      // eslint-disable-next-line react/prop-types
      defaultValue={state?.text || ''}
      updateFormValue={(v) =>
        setState((prevState) => ({
          ...prevState,
          text: v,
        }))
      }
      containerStyle='tw:mt-8 tw:h-full'
      inputStyle='tw:h-full'
    />
  )
}
