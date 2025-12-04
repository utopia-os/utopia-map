import { useAuth } from '#components/Auth/useAuth'

import { useItems, useAddItem } from './useItems'
import { useLayers } from './useLayers'

export const useMyProfile = () => {
  const items = useItems()
  const { user } = useAuth()
  const layers = useLayers()
  const addItem = useAddItem()

  // Find the user's profile item
  const myProfile = items.find(
    (item) => item.layer?.userProfileLayer && item.user_created?.id === user?.id,
  )

  const isUserProfileLayerLoaded = !!items.find((item) => item.layer?.userProfileLayer)

  // allItemsLoaded is not reliable
  const isMyProfileLoaded = isUserProfileLayerLoaded && !!user

  const createEmptyProfile = async () => {
    if (!user) return

    const userLayer = layers.find((l) => l.userProfileLayer === true)
    if (!userLayer?.api?.createItem) {
      throw new Error('User profile layer or create API not available')
    }

    const newProfile = {
      id: crypto.randomUUID(),
      name: user.first_name ?? 'User',
    }

    const result = await userLayer.api.createItem(newProfile)

    // Use server response for local state update
    addItem({
      ...result,
      user_created: user,
      layer: userLayer,
      public_edit: false,
    })

    return result
  }

  return { myProfile, isMyProfileLoaded, isUserProfileLayerLoaded, createEmptyProfile }
}
