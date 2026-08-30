import { TextView } from '#components/Map/Subcomponents/ItemPopupComponents'

import type { Item } from '#types/Item'

export const SimpleView = ({ item }: { item: Item }) => {
  return (
    <div className='tw:mt-8 tw:h-full tw:overflow-y-auto fade tw:px-6'>
      <TextView text={item.text} />
    </div>
  )
}
