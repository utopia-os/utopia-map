import { Editor } from '@tiptap/core'

import { fixUrls, mailRegex } from '#utils/ReplaceURLs'

import type { JSONContent, Extensions } from '@tiptap/core'

/**
 * Converts naked URLs to markdown links, but skips URLs that are already
 * inside markdown link syntax [text](url) or autolinks <url>.
 */
function convertNakedUrls(text: string): string {
  // Find all existing markdown links and autolinks to know which ranges to skip
  const skipRanges: { start: number; end: number }[] = []

  // Find markdown links: [text](url)
  const linkRegex = /\[[^\]]*\]\([^)]+\)/g
  let linkMatch: RegExpExecArray | null
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    skipRanges.push({ start: linkMatch.index, end: linkMatch.index + linkMatch[0].length })
  }

  // Find autolinks: <url>
  const autolinkRegex = /<https?:\/\/[^>]+>/g
  let autolinkMatch: RegExpExecArray | null
  while ((autolinkMatch = autolinkRegex.exec(text)) !== null) {
    skipRanges.push({
      start: autolinkMatch.index,
      end: autolinkMatch.index + autolinkMatch[0].length,
    })
  }

  // Now find naked URLs and convert only those not in skip ranges
  const urlRegex = /https?:\/\/[^\s)<>\]]+/g
  let result = ''
  let lastIndex = 0
  let urlMatch: RegExpExecArray | null

  while ((urlMatch = urlRegex.exec(text)) !== null) {
    const urlStart = urlMatch.index
    const urlEnd = urlMatch.index + urlMatch[0].length
    const url = urlMatch[0]

    // Check if this URL is inside a skip range
    const isInsideSkipRange = skipRanges.some(
      (range) => urlStart >= range.start && urlEnd <= range.end,
    )

    if (isInsideSkipRange) {
      // Keep the URL as-is (it's already part of a link)
      continue
    }

    // Add text before this URL
    result += text.slice(lastIndex, urlStart)

    // Convert naked URL to markdown link
    const displayText = url.replace(/^https?:\/\/(www\.)?/, '')
    result += `[${displayText}](${url})`

    lastIndex = urlEnd
  }

  // Add remaining text
  result += text.slice(lastIndex)

  return result
}

/**
 * Converts pre-processed markdown/HTML to TipTap JSON format.
 * Creates a temporary editor instance to parse the content.
 */
export function markdownToTiptapJson(content: string, extensions: Extensions): JSONContent {
  // Create a temporary editor to parse HTML/markdown
  const editor = new Editor({
    extensions,
    content,
    // We immediately destroy this, so no need for DOM attachment
  })

  const json = editor.getJSON()
  editor.destroy()

  return json
}

/**
 * Pre-processes markdown text before passing to TipTap.
 * - Converts naked URLs to markdown links
 * - Converts email addresses to mailto links
 * - Converts video links (YouTube/Rumble) to video-embed HTML tags
 * - Converts hashtags to hashtag HTML tags
 */
export function preprocessMarkdown(text: string): string {
  if (!text) return ''

  let result = text

  // 1. Fix URLs (add https:// if missing)
  result = fixUrls(result)

  // 2. Convert naked URLs to markdown links
  // Skip URLs that are already inside markdown link syntax [text](url) or autolinks <url>
  // Process the text in segments to avoid matching URLs inside existing links
  result = convertNakedUrls(result)

  // 3. Convert email addresses to mailto links
  result = result.replace(mailRegex, (email) => `[${email}](mailto:${email})`)

  // 4. Convert video links to video-embed tags
  result = preprocessVideoLinks(result)

  // 5. Convert hashtags to hashtag tags
  result = preprocessHashtags(result)

  // 6. Convert item mentions to item-mention tags
  result = preprocessItemMentions(result)

  return result
}

/**
 * Converts YouTube and Rumble markdown links to video-embed HTML tags.
 * Handles both standard markdown links [Text](url) and autolinks <url>
 */
export function preprocessVideoLinks(text: string): string {
  let result = text

  // YouTube autolinks: <https://www.youtube.com/watch?v=VIDEO_ID>
  result = result.replace(
    /<https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^>&]+)[^>]*>/g,
    '<video-embed provider="youtube" video-id="$1"></video-embed>',
  )

  // YouTube short autolinks: <https://youtu.be/VIDEO_ID>
  result = result.replace(
    /<https?:\/\/youtu\.be\/([^>?]+)[^>]*>/g,
    '<video-embed provider="youtube" video-id="$1"></video-embed>',
  )

  // YouTube: [Text](https://www.youtube.com/watch?v=VIDEO_ID)
  result = result.replace(
    /\[([^\]]*)\]\(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^)&]+)[^)]*\)/g,
    '<video-embed provider="youtube" video-id="$2"></video-embed>',
  )

  // YouTube short URLs: [Text](https://youtu.be/VIDEO_ID)
  result = result.replace(
    /\[([^\]]*)\]\(https?:\/\/youtu\.be\/([^?)]+)[^)]*\)/g,
    '<video-embed provider="youtube" video-id="$2"></video-embed>',
  )

  // Rumble autolinks: <https://rumble.com/embed/VIDEO_ID>
  result = result.replace(
    /<https?:\/\/rumble\.com\/embed\/([^>]+)>/g,
    '<video-embed provider="rumble" video-id="$1"></video-embed>',
  )

  // Rumble embed URLs: [Text](https://rumble.com/embed/VIDEO_ID)
  result = result.replace(
    /\[([^\]]*)\]\(https?:\/\/rumble\.com\/embed\/([^)]+)\)/g,
    '<video-embed provider="rumble" video-id="$2"></video-embed>',
  )

  return result
}

/**
 * Converts #hashtag syntax to span tags that TipTap can parse.
 * Only converts hashtags that are NOT already inside markdown links.
 */
export function preprocessHashtags(text: string): string {
  // Don't convert hashtags that are already inside link syntax [#tag](#tag)
  // Use a negative lookbehind for [ and (
  return text.replace(
    /(?<!\[)(?<!\()#([a-zA-Z0-9À-ÖØ-öø-ʸ_-]+)(?!\]|\))/g,
    '<span data-hashtag data-label="$1">#$1</span>',
  )
}

/**
 * Converts [@Label](/item/id) to item-mention HTML tags.
 * Supports multiple formats:
 * - [@Label](/item/id) - absolute path
 * - [@Label](item/id) - relative path (legacy)
 * - [@Label](/item/layer/id) - with layer (legacy)
 */
export function preprocessItemMentions(text: string): string {
  let result = text

  // Format with layer: [@Label](/item/layer/id) or [@Label](item/layer/id)
  // Use non-greedy matching for label to handle consecutive mentions
  // Use case-insensitive flag for UUID hex characters
  result = result.replace(
    /\[@([^\]]+?)\]\(\/?item\/[^/]+\/([a-fA-F0-9-]+)\)/g,
    '<span data-item-mention data-label="$1" data-id="$2">@$1</span>',
  )

  // Format without layer: [@Label](/item/id) or [@Label](item/id)
  // UUID pattern: hex characters (case-insensitive) with dashes
  result = result.replace(
    /\[@([^\]]+?)\]\(\/?item\/([a-fA-F0-9-]+)\)/g,
    '<span data-item-mention data-label="$1" data-id="$2">@$1</span>',
  )

  return result
}

/**
 * Removes markdown syntax for plain text display (used for truncation calculation).
 * Preserves @mentions ([@Label](/item/id)) and #hashtags for rendering.
 */
export function removeMarkdownSyntax(text: string): string {
  return (
    text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/(`{1,3})(.*?)\1/g, '$2') // Remove inline code
      .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2') // Remove bold and italic
      .replace(/(#+)\s+(.*)/g, '$2') // Remove headers
      .replace(/>\s+(.*)/g, '$1') // Remove blockquotes
      // Remove regular links but preserve @mentions ([@Label](/item/...))
      .replace(/\[([^\]]+)\]\((?!\/item\/)[^)]+\)/g, '$1')
      .replace(/<[^>]+>/g, '')
  ) // Remove HTML tags
}

/**
 * Truncates text to a character limit based on visible/plain text length.
 * Preserves complete tokens - won't cut in the middle of:
 * - @mentions: [@Label](/item/id)
 * - #hashtags: #tagname
 * - Links: [text](url)
 *
 * The limit applies to the rendered/visible text, not the raw markdown.
 */
export function truncateMarkdown(text: string, limit: number): string {
  const plainText = removeMarkdownSyntax(text)

  if (plainText.length <= limit) {
    return text
  }

  // Tokenize the text into segments: either special tokens or plain text
  // This allows us to count visible characters correctly
  // Order matters: more specific patterns first
  const tokenPatterns = [
    { pattern: /\[@([^\]]+?)\]\(\/?item\/[^)]+\)/g, type: 'mention' }, // @mentions - visible: @label
    { pattern: /<https?:\/\/[^>]+>/g, type: 'autolink' }, // <url> autolinks - visible: the whole thing (for videos etc)
    { pattern: /\[([^\]]*)\]\([^)]+\)/g, type: 'link' }, // [text](url) - visible: text
    { pattern: /(?<!\(|<)https?:\/\/[^\s)<>]+/g, type: 'nakedurl' }, // naked URLs - visible: URL without protocol
    { pattern: /(?<!\[)#([a-zA-Z0-9À-ÖØ-öø-ʸ_-]+)/g, type: 'hashtag' }, // #tag - visible: #tag (not inside links)
  ]

  // Find all tokens with their positions
  interface Token {
    start: number
    end: number
    raw: string
    visible: string
    type: string
  }

  const tokens: Token[] = []

  for (const { pattern, type } of tokenPatterns) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const matchIndex = match.index
      const matchFull = match[0]
      const matchGroup = match[1] || ''

      let visible: string
      if (type === 'mention') {
        visible = '@' + matchGroup
      } else if (type === 'link') {
        visible = matchGroup
      } else if (type === 'autolink') {
        // Autolinks like <https://youtube.com/...> - for truncation, count as short placeholder
        // since they'll be rendered as embeds or converted
        visible = '[video]'
      } else if (type === 'nakedurl') {
        // Naked URLs will be converted to links by preprocessMarkdown
        // The visible text will be the URL without https://www.
        visible = matchFull.replace(/^https?:\/\/(www\.)?/, '')
      } else {
        visible = matchFull // hashtag includes the #
      }

      // Check if this position overlaps with existing tokens (avoid duplicates)
      const overlaps = tokens.some(
        (t) =>
          (matchIndex >= t.start && matchIndex < t.end) ||
          (matchIndex + matchFull.length > t.start && matchIndex + matchFull.length <= t.end),
      )

      if (!overlaps) {
        tokens.push({
          start: matchIndex,
          end: matchIndex + matchFull.length,
          raw: matchFull,
          visible,
          type,
        })
      }
    }
  }

  // Sort tokens by position
  tokens.sort((a, b) => a.start - b.start)

  // Build truncated output by walking through text
  let result = ''
  let visibleLength = 0
  let pos = 0

  while (pos < text.length && visibleLength < limit) {
    // Check if we're at a token
    const token = tokens.find((t) => t.start === pos)

    if (token) {
      // Would this token exceed the limit?
      if (visibleLength + token.visible.length > limit) {
        // Don't include partial token - stop here
        break
      }
      result += token.raw
      visibleLength += token.visible.length
      pos = token.end
    } else {
      // Check if next position is inside a token (shouldn't happen, but safety check)
      const insideToken = tokens.find((t) => pos > t.start && pos < t.end)
      if (insideToken) {
        pos = insideToken.end
        continue
      }

      // Regular character - check for newline
      // eslint-disable-next-line security/detect-object-injection
      const char = text[pos]
      if (char === '\n') {
        result += char
        pos++
        // Don't count newlines toward visible limit
      } else {
        // Would this char exceed limit?
        if (visibleLength + 1 > limit) {
          break
        }
        result += char
        visibleLength++
        pos++
      }
    }
  }

  // Add ellipsis if we truncated
  if (pos < text.length) {
    result = result.trimEnd() + '...'
  }

  return result.trim()
}
