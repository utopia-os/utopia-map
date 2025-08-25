/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { TextInput } from '#components/Input'

import { AvatarWidget } from './AvatarWidget'
import { ColorPicker } from './ColorPicker'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

interface Props {
  item: Item
  state: Partial<FormState>
  setState: React.Dispatch<React.SetStateAction<Partial<FormState>>>
}

export const FormHeader = ({ item, state, setState }: Props) => {
  return (
    <div className='tw:flex-none'>
      <div className='tw:flex'>
        <AvatarWidget
          avatar={state.image}
          setAvatar={(i) =>
            setState((prevState) => ({
              ...prevState,
              image: i,
            }))
          }
          item={item}
        />
        <ColorPicker
          color={state.color}
          onChange={(c) =>
            setState((prevState) => ({
              ...prevState,
              color: c,
            }))
          }
          className={'tw:-left-6 tw:top-14 tw:-mr-6'}
        />
        <div className='tw:grow tw:mr-4 tw:pt-1'>
          <TextInput
            placeholder='Name'
            defaultValue={item.name ? item.name : ''}
            updateFormValue={(v) =>
              setState((prevState) => ({
                ...prevState,
                name: v,
              }))
            }
            containerStyle='tw:grow tw:px-4'
            inputStyle='tw:input-md'
          />
          <TextInput
            placeholder='Subtitle'
            required={false}
            defaultValue={item.subname ? item.subname : ''}
            updateFormValue={(v) =>
              setState((prevState) => ({
                ...prevState,
                subname: v,
              }))
            }
            containerStyle='tw:grow tw:px-4 tw:mt-1'
            inputStyle='tw:input-sm'
          />
        </div>
      </div>
    </div>
  )
}
