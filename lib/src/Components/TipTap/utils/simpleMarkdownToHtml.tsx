import { decodeTag } from '#utils/FormatTags'

import type { Tag } from '#types/Tag'

/**
 * Simple markdown to HTML converter for static rendering.
 * Handles basic markdown syntax without requiring TipTap.
 * Used for lightweight popup/card previews.
 */
export function simpleMarkdownToHtml(text: string, tags: Tag[]): string {
  if (!text) return ''

  let html = text

  // Escape HTML first (but preserve our preprocessed tags)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Restore our preprocessed tags
  html = html
    .replace(/&lt;video-embed/g, '<video-embed')
    .replace(/&lt;\/video-embed&gt;/g, '</video-embed>')
    .replace(/&lt;span data-hashtag/g, '<span data-hashtag')
    .replace(/&lt;\/span&gt;/g, '</span>')
    .replace(/&gt;&lt;/g, '><')
    .replace(/"&gt;/g, '">')

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
      return `<span data-hashtag data-label="${label}" class="hashtag" style="color: ${color}; cursor: pointer;">${decoded}</span>`
    },
  )

  // Bold: **text** or __text__
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')

  // Italic: *text* or _text_ (but not inside words)
  html = html.replace(/(?<!\w)(\*|_)(?!\s)(.*?)(?<!\s)\1(?!\w)/g, '<em>$2</em>')

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, linkText: string, url: string) => {
      const isExternal = url.startsWith('http')
      const attrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${url}" ${attrs}>${linkText}</a>`
    },
  )

  // Headers: # text, ## text, etc.
  html = html.replace(/^(#{1,6})\s+(.*)$/gm, (_, hashes: string, content: string) => {
    const level = hashes.length
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
