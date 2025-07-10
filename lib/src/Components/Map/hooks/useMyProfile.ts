import { useAuth } from '#components/Auth/useAuth'

import { useItems, useLayerState } from './useItems'

export const useMyProfile = () => {
  const items = useItems()
  const layers = useLayerState()

  const user = useAuth().user

  const isUserProfileLayerLoaded = layers.some(
    (layer) => layer.props.userProfileLayer && layer.isInitialized,
  )

  const isMyProfileLoaded = isUserProfileLayerLoaded && !!user

  // Find the user's profile item
  const myProfile = items.find(
    (item) => item.layer?.userProfileLayer && item.user_created?.id === user?.id,
  )

  return { myProfile, isMyProfileLoaded }
}
