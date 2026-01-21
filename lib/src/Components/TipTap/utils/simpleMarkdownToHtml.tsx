import { decodeTag } from '#utils/FormatTags'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

/**
 * Checks if a string contains potentially dangerous attributes (XSS prevention).
 * Returns true if the string contains event handlers or javascript: URLs.
 */
function containsDangerousAttributes(str: string): boolean {
  // Check for event handlers (onclick, onload, onerror, onmouseover, etc.)
  const eventHandlerPattern = /\bon\w+\s*=/i
  // Check for javascript: or data: URLs in attributes
  const dangerousUrlPattern = /(?:javascript|data|vbscript):/i

  return eventHandlerPattern.test(str) || dangerousUrlPattern.test(str)
}

/**
 * Sanitizes a URL for safe use in href attributes.
 * Returns '#' for dangerous URLs like javascript:, data:, vbscript:
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase()
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:')
  ) {
    return '#'
  }
  return url
}

/**
 * Simple markdown to HTML converter for static rendering.
 * Handles basic markdown syntax without requiring TipTap.
 * Used for lightweight popup/card previews.
 */
export function simpleMarkdownToHtml(
  text: string,
  tags: Tag[],
  options?: {
    items?: Item[]
    getItemColor?: (item: Item | undefined, fallback?: string) => string
  },
): string {
  if (!text) return ''

  let html = text

  // Escape HTML first (but preserve our preprocessed tags)
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Restore our preprocessed tags with STRICT patterns to prevent XSS
  // Only restore tags that match exact expected format (no extra attributes allowed)
  // After escaping: < becomes &lt;, > becomes &gt;, but " stays as "
  html = html
    // video-embed: only allow provider and video-id attributes
    .replace(
      /&lt;video-embed provider="(youtube|rumble)" video-id="([^"]+)"&gt;&lt;\/video-embed&gt;/g,
      (match, provider, videoId) => {
        // Validate videoId contains only safe characters
        if (!/^[\w-]+$/.test(videoId)) return match
        return `<video-embed provider="${provider}" video-id="${videoId}"></video-embed>`
      },
    )
    // hashtag span: only allow data-hashtag and data-label attributes
    .replace(
      /&lt;span data-hashtag data-label="([^"]+)"&gt;(#[^&]+)&lt;\/span&gt;/g,
      (match, label, tagText) => {
        // Ensure no dangerous content in label
        if (containsDangerousAttributes(label)) return match
        return `<span data-hashtag data-label="${label}">${tagText}</span>`
      },
    )
    // item-mention span: only allow data-item-mention, data-label, and data-id attributes
    .replace(
      /&lt;span data-item-mention data-label="([^"]+)" data-id="([^"]+)"&gt;(@[^&]+)&lt;\/span&gt;/g,
      (match, label, id, mentionText) => {
        // Ensure no dangerous content
        if (containsDangerousAttributes(label) || containsDangerousAttributes(id)) return match
        return `<span data-item-mention data-label="${label}" data-id="${id}">${mentionText}</span>`
      },
    )

  // Convert video-embed tags to iframes
  html = html.replace(
    /<video-embed provider="(youtube|rumble)" video-id="([^"]+)"><\/video-embed>/g,
    (_, provider: string, videoId: string) => {
      const src =
        provider === 'youtube'
          ? `https://www.youtube-nocookie.com/embed/${videoId}`
          : `https://rumble.com/embed/${videoId}`
      return `<div class="video-embed-wrapper"><iframe src="${src}" allowfullscreen allow="fullscreen; picture-in-picture" class="video-embed"></iframe></div>`
    },
  )

  // Convert hashtag spans to styled spans with tag colors
  html = html.replace(
    /<span data-hashtag data-label="([^"]+)">#([^<]+)<\/span>/g,
    (_, label: string, tagText: string) => {
      const tag = tags.find((t) => t.name.toLowerCase() === label.toLowerCase())
      const color = tag?.color ?? 'inherit'
      const decoded = decodeTag(`#${tagText}`)
      return `<span data-hashtag data-label="${label}" class="hashtag" style="color: ${color}; cursor: pointer; font-weight: bold;">${decoded}</span>`
    },
  )

  // Convert item-mention spans to styled links with correct colors
  html = html.replace(
    /<span data-item-mention data-label="([^"]+)" data-id="([^"]+)">@([^<]+)<\/span>/g,
    (_, label: string, id: string) => {
      // Find item and get its color
      const item = options?.items?.find((i) => i.id === id)
      const color = options?.getItemColor
        ? options.getItemColor(item, 'var(--color-primary, #3b82f6)')
        : (item?.color ?? 'var(--color-primary, #3b82f6)')
      return `<a href="/item/${id}" class="item-mention" style="color: ${color}; cursor: pointer; font-weight: bold;">@${label}</a>`
    },
  )

  // Bold: **text** or __text__
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')

  // Italic: *text* or _text_ (but not inside words)
  html = html.replace(/(?<!\w)(\*|_)(?!\s)(.*?)(?<!\s)\1(?!\w)/g, '<em>$2</em>')

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links: [text](url) - with URL sanitization for XSS prevention
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText: string, url: string) => {
    const safeUrl = sanitizeUrl(url)
    const isExternal = safeUrl.startsWith('http')
    const attrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${safeUrl}" ${attrs}>${linkText}</a>`
  })

  // Headers: # text, ## text, etc.
  html = html.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes: string, content: string) => {
    const level = String(hashes.length)
    return `<h${level}>${content}</h${level}>`
  })

  // Blockquotes: > text
  html = html.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>')

  // Line breaks: convert newlines to <br> or <p>
  // Double newline = paragraph break
  html = html.replace(/\n\n+/g, '</p><p>')
  // Single newline = line break
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph if not already
  if (!html.startsWith('<h') && !html.startsWith('<p>')) {
    html = `<p>${html}</p>`
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '')
  html = html.replace(/<p>(<br>)+<\/p>/g, '')

  return html
}
