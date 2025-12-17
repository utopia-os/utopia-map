import { useEffect, useRef } from 'react'

import { useAuth } from '#components/Auth/useAuth'

import { useItems, useAddItem, useUpdateItem } from './useItems'
import { useLayers } from './useLayers'

import type { Item } from '#types/Item'
import type { LayerProps } from '#types/LayerProps'

export const useMyProfile = () => {
  const items = useItems()
  const { user } = useAuth()
  const layers = useLayers()
  const addItem = useAddItem()
  const updateItem = useUpdateItem()
  const isReloadingSecretRef = useRef(false)

  // Find the user's profile item
  const myProfile = items.find(
    (item) => item.layer?.userProfileLayer && item.user_created?.id === user?.id,
  )

  const isUserProfileLayerLoaded = !!items.find((item) => item.layer?.userProfileLayer)

  // allItemsLoaded is not reliable
  const isMyProfileLoaded = isUserProfileLayerLoaded && !!user

  // Helper function for background reload with retry
  const reloadItemWithSecret = async (itemId: string, layer: LayerProps, baseItem: Item) => {
    const maxRetries = 3
    const retryDelay = 500 // ms

    for (let i = 0; i < maxRetries; i++) {
      // eslint-disable-next-line promise/avoid-new
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
      const reloaded = await layer.api?.getItem?.(itemId)
      if (reloaded?.secrets && reloaded.secrets.length > 0) {
        updateItem({
          ...baseItem,
          ...reloaded,
        })
        break
      }
    }
  }

  // Automatically reload profile if secrets are missing (e.g., after signup)
  const hasSecrets = myProfile?.secrets && myProfile.secrets.length > 0
  useEffect(() => {
    if (myProfile?.layer?.api?.getItem && !hasSecrets && !isReloadingSecretRef.current) {
      isReloadingSecretRef.current = true
      void reloadItemWithSecret(myProfile.id, myProfile.layer, myProfile).finally(() => {
        isReloadingSecretRef.current = false
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myProfile?.id, hasSecrets])

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

    const serverResponse = await userLayer.api.createItem(newProfile)

    const newItem = {
      ...serverResponse,
      user_created: user, // eslint-disable-line camelcase
      layer: userLayer,
      public_edit: false, // eslint-disable-line camelcase
    }

    // Add item immediately (without secret)
    addItem(newItem)

    // Reload in background to get server-generated fields (like secrets)
    if (userLayer.api.getItem) {
      void reloadItemWithSecret(serverResponse.id, userLayer, newItem)
    }

    return newItem
  }

  return { myProfile, isMyProfileLoaded, isUserProfileLayerLoaded, createEmptyProfile }
}
