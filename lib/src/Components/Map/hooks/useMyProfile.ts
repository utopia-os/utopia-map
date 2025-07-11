import { useAuth } from '#components/Auth/useAuth'

import { useItems, useAllItemsLoaded } from './useItems'

export const useMyProfile = () => {
  const items = useItems()
  const allItemsLoaded = useAllItemsLoaded()

  const user = useAuth().user

  // allItemsLoaded is not reliable, so we check if items.length > 0
  const isMyProfileLoaded = allItemsLoaded && items.length > 0 && !!user

  // Find the user's profile item
  const myProfile = items.find(
    (item) => item.layer?.userProfileLayer && item.user_created?.id === user?.id,
  )

  return { myProfile, isMyProfileLoaded }
}
