import { TagsWidget } from '#components/Profile/Subcomponents/TagsWidget'

import type { FormState } from '#types/FormState'
import type { Item } from '#types/Item'

interface Props {
  item: Item
  state: FormState
  setState: React.Dispatch<React.SetStateAction<FormState>>
  dataField: 'offers' | 'needs'
  heading?: string
  placeholder?: string
}

export const ProfileTagsForm = ({ state, setState, dataField, heading, placeholder }: Props) => {
  const defaultHeading = dataField === 'offers' ? 'Offers' : 'Needs'
  const defaultPlaceholder = dataField === 'offers' ? 'enter your offers' : 'enter your needs'

  // Validate that defaultTags is an array
  // eslint-disable-next-line security/detect-object-injection
  const rawTags = state[dataField]
  const defaultTags = Array.isArray(rawTags) ? rawTags : []

  return (
    <div className='tw:flex-1 tw:flex tw:flex-col tw:min-h-0'>
      <h3 className='tw:text-base tw:font-semibold tw:mt-4 tw:mb-2 tw:flex-none'>
        {heading ?? defaultHeading}
      </h3>
      <TagsWidget
        defaultTags={defaultTags}
        onUpdate={(tags) => {
          setState((prevState) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const updated = { ...prevState, [dataField]: tags }
            return updated
          })
        }}
        placeholder={placeholder ?? defaultPlaceholder}
        containerStyle='tw:bg-transparent tw:w-full tw:flex-1 tw:text-xs tw:pb-2 tw:overflow-auto'
      />
    </div>
  )
}
