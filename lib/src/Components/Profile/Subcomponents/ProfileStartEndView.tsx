import { StartEndView } from '#components/Map/Subcomponents/ItemPopupComponents'

import type { Item } from '#types/Item'

export const ProfileStartEndView = ({ item }: { item: Item }) => {
  return (
    <div className='tw:mt-2 tw:px-6'>
      <StartEndView item={item}></StartEndView>
    </div>
  )
}
