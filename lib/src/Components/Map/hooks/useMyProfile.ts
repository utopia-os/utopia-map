import { useAuth } from '#components/Auth/useAuth'

import { useItems } from './useItems'

export const useMyProfile = () => {
  const items = useItems()
  const { user } = useAuth()

  // Find the user's profile item
  const myProfile = items.find(
    (item) => item.layer?.userProfileLayer && item.user_created?.id === user?.id,
  )

  const isAnyUserProfileLoaded = !!items.find((item) => item.layer?.userProfileLayer)

  // allItemsLoaded is not reliable
  const isMyProfileLoaded = isAnyUserProfileLoaded && !!user

  return { myProfile, isMyProfileLoaded }
}
