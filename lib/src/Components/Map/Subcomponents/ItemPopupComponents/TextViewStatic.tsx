import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useGetItemColor } from '#components/Map/hooks/useItemColor'
import { useItems } from '#components/Map/hooks/useItems'
import { useTags } from '#components/Map/hooks/useTags'
import { preprocessMarkdown, truncateMarkdown } from '#components/TipTap/utils/preprocessMarkdown'
import { simpleMarkdownToHtml } from '#components/TipTap/utils/simpleMarkdownToHtml'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

/**
 * Lightweight static text renderer for popups and card previews.
 * Uses simple HTML rendering instead of TipTap for better performance
 * and compatibility with Leaflet popups (no contenteditable issues).
 *
 * @category Map
 */
export const TextViewStatic = ({
  item,
  text,
  truncate = false,
  rawText,
}: {
  item?: Item
  text?: string | null
  truncate?: boolean
  rawText?: string
}) => {
  if (item) {
    text = item.text
  }

  const tags = useTags()
  const items = useItems()
  const getItemColor = useGetItemColor()
  const addFilterTag = useAddFilterTag()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  // Prepare the text content
  let innerText = ''

  if (rawText) {
    innerText = rawText
  } else if (text === undefined) {
    // Field was omitted by backend (no permission)
    innerText = `[Login](/login) to see this ${item?.layer?.item_default_name ?? 'item'}`
  } else if (text === null || text === '') {
    // Field is not set or empty - show nothing
    innerText = ''
  } else {
    // Field has a value
    innerText = text
  }

  // Pre-process markdown first (converts naked URLs to links, etc.)
  // Then truncate the processed markdown
  // Finally convert to HTML
  const html = useMemo(() => {
    if (!innerText) return ''

    // First preprocess to normalize all URLs/mentions/hashtags
    let processed = preprocessMarkdown(innerText)

    // Then truncate if needed (works on normalized markdown)
    if (truncate) {
      processed = truncateMarkdown(processed, 100)
    }

    return simpleMarkdownToHtml(processed, tags, { items, getItemColor })
  }, [innerText, truncate, tags, items, getItemColor])

  // Handle clicks for internal navigation and hashtags
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // Handle hashtag clicks
      const hashtag = target.closest('[data-hashtag]')
      if (hashtag) {
        e.preventDefault()
        e.stopPropagation()
        const label = hashtag.getAttribute('data-label')
        if (label) {
          const tag = tags.find((t: Tag) => t.name.toLowerCase() === label.toLowerCase())
          if (tag) {
            addFilterTag(tag)
          }
        }
        return
      }

      // Handle link clicks
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href) return

      // Internal links → React Router navigation
      if (href.startsWith('/')) {
        e.preventDefault()
        e.stopPropagation()
        void navigate(href)
      }
      // External links are handled by target="_blank"
    }

    container.addEventListener('click', handleClick)
    return () => {
      container.removeEventListener('click', handleClick)
    }
  }, [navigate, tags, addFilterTag])

  if (!innerText) {
    return null
  }

  return (
    <div
      translate='no'
      ref={containerRef}
      className='markdown tw:text-map tw:leading-map tw:text-sm'
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
