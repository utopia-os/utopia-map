import { StartEndView } from '#components/Map/Subcomponents/ItemPopupComponents'

import type { Item } from '#types/Item'

export const ProfileStartEndView = ({ item }: { item: Item }) => {
  return (
    <div>
      <StartEndView item={item}></StartEndView>
    </div>
  )
}
