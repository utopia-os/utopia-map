import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

import { useAddFilterTag, useResetFilterTags } from './useFilter'

import type { Tag } from '#types/Tag'

const readUrlTags = (search: string): string => {
  const urlTags = new URLSearchParams(search).get('tags')
  return urlTags ? decodeURIComponent(urlTags) : ''
}

/**
 * Keeps the active filter tags in step with the `tags` query parameter.
 *
 * Only a change of the URL may drive the filter state. Reacting to the filter
 * state as well would undo every removal: `removeFilterTag` updates the state
 * and the address bar in one go, but the router location still carries the old
 * `tags` value for one render. Reconciling against that stale value puts the
 * tag the user just removed straight back.
 */
export const useSyncFilterTagsWithUrl = (tags: Tag[]) => {
  const location = useLocation()
  const addFilterTag = useAddFilterTag()
  const resetFilterTags = useResetFilterTags()
  const appliedUrlTags = useRef<string | null>(null)

  useEffect(() => {
    // Without the available tags nothing can be matched yet. Returning without
    // recording keeps a deep link working once the tags have loaded.
    if (tags.length === 0) return

    const urlTags = readUrlTags(location.search)
    if (appliedUrlTags.current === urlTags) return
    appliedUrlTags.current = urlTags

    resetFilterTags()
    urlTags
      .split(';')
      .filter(Boolean)
      .forEach((urlTag) => {
        const match = tags.find((t) => t.name.toLowerCase() === urlTag.toLowerCase())
        if (match) addFilterTag(match)
      })
  }, [location.search, tags, addFilterTag, resetFilterTags])
}
