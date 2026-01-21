import { useCallback } from 'react'

import { useGetItemTags } from './useTags'

import type { Item } from '#types/Item'

/**
 * Returns a function that calculates the color for an item.
 * Priority: item.color > first tag color > layer default color > fallback
 */
export const useGetItemColor = (): ((item: Item | undefined, fallback?: string) => string) => {
  const getItemTags = useGetItemTags()

  return useCallback(
    (item: Item | undefined, fallback = '#000') => {
      if (!item) return fallback

      // 1. Item's own color takes highest priority
      if (item.color) return item.color

      // 2. First tag's color
      const itemTags = getItemTags(item)
      if (itemTags[0]?.color) return itemTags[0].color

      // 3. Layer's default marker color
      if (item.layer?.markerDefaultColor) return item.layer.markerDefaultColor

      // 4. Fallback
      return fallback
    },
    [getItemTags],
  )
}

/**
 * Hook that returns the calculated color for a specific item.
 * Priority: item.color > first tag color > layer default color > fallback
 */
export const useItemColor = (item: Item | undefined, fallback = '#000'): string => {
  const getItemColor = useGetItemColor()
  return getItemColor(item, fallback)
}
