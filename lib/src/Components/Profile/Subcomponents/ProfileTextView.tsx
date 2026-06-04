import { get } from 'radash'

import { TextView } from '#components/Map/Subcomponents/ItemPopupComponents'

import type { Item } from '#types/Item'

export const ProfileTextView = ({
  item,
  dataField = 'text',
  heading,
  hideWhenEmpty,
}: {
  item: Item
  dataField: string
  heading: string
  hideWhenEmpty: boolean
}) => {
  const text = get(item, dataField)

  // undefined = no permission, null = not set, string = value exists
  const shouldShowHeading = !(hideWhenEmpty && (text === '' || text === null))

  return (
    <div>
      {shouldShowHeading && <h2 className='tw:text-lg tw:font-semibold'>{heading}</h2>}
      <div className='tw:mt-2 tw:text-sm'>
        <TextView item={item} text={text as string | null | undefined} itemId={item.id} />
      </div>
    </div>
  )
}
