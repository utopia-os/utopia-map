/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/prop-types */
import { TextInput } from '#components/Input'

import { AvatarWidget } from './AvatarWidget'
import { ColorPicker } from './ColorPicker'

export const FormHeader = ({ item, state, setState }) => {
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
            defaultValue={item?.name ? item.name : ''}
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
            defaultValue={item?.subname ? item.subname : ''}
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
