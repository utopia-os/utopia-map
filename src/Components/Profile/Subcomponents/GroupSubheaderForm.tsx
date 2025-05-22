/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { useEffect } from 'react'

import ComboBoxInput from '#components/Input/ComboBoxInput'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

interface groupType {
  groupTypes_id: {
    name: string
    color: string
    image: { id: string }
    markerIcon: string
  }
}

export const GroupSubheaderForm = ({
  state,
  setState,
  groupStates,
  groupTypes,
}: {
  state: FormState
  setState: React.Dispatch<React.SetStateAction<any>>
  item: Item
  groupStates?: string[]
  groupTypes?: groupType[]
}) => {
  useEffect(() => {
    if (groupTypes && groupStates && state.name !== '') {
      const groupType = groupTypes.find((gt) => gt.groupTypes_id.name === state.group_type)
      const customImage = !groupTypes.some(
        (gt) => gt.groupTypes_id.image.id === state.image || !state.image,
      )
      setState((prevState) => ({
        ...prevState,
        color: groupType?.groupTypes_id.color || groupTypes[0].groupTypes_id.color,
        marker_icon: groupType?.groupTypes_id.markerIcon || groupTypes[0].groupTypes_id.markerIcon,
        image: customImage
          ? state.image
          : groupType?.groupTypes_id.image.id || groupTypes[0].groupTypes_id.image.id,
        status: state.status || groupStates[0],
        group_type: state.group_type || groupTypes[0].groupTypes_id.name,
      }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.group_type, groupTypes])

  return (
    <div className='tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6'>
      <div>
        <label
          htmlFor='status'
          className='tw:block tw:text-sm tw:font-medium tw:text-gray-500 tw:mb-1'
        >
          Gruppenstatus:
        </label>
        <ComboBoxInput
          id='status'
          options={groupStates || []}
          value={state.status}
          onValueChange={(v) =>
            setState((prevState) => ({
              ...prevState,
              status: v,
            }))
          }
        />
      </div>
      <div>
        <label
          htmlFor='groupType'
          className='tw:block tw:text-sm tw:font-medium tw:text-gray-500 tw:mb-1'
        >
          Gruppenart:
        </label>
        <ComboBoxInput
          id='groupType'
          options={groupTypes?.map((gt) => gt.groupTypes_id.name) || []}
          value={state.group_type}
          onValueChange={(v) =>
            setState((prevState) => ({
              ...prevState,
              group_type: v,
            }))
          }
        />
      </div>
    </div>
  )
}
