import { fixUrls, mailRegex } from '#utils/ReplaceURLs'

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
  // Match URLs that are NOT already inside markdown link syntax
  result = result.replace(
    /(?<!\]?\()(?<!<)https?:\/\/[^\s)]+(?!\))(?!>)/g,
    (url) => `[${url.replace(/https?:\/\/w{3}\./gi, '')}](${url})`,
  )

  // 3. Convert email addresses to mailto links
  result = result.replace(mailRegex, (email) => `[${email}](mailto:${email})`)

  // 4. Convert video links to video-embed tags
  result = preprocessVideoLinks(result)

  // 5. Convert hashtags to hashtag tags
  result = preprocessHashtags(result)

  return result
}

/**
 * Converts YouTube and Rumble markdown links to video-embed HTML tags.
 */
export function preprocessVideoLinks(text: string): string {
  let result = text

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
 * Removes markdown syntax for plain text display (used for truncation calculation).
 */
export function removeMarkdownSyntax(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/(`{1,3})(.*?)\1/g, '$2') // Remove inline code
    .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2') // Remove bold and italic
    .replace(/(#+)\s+(.*)/g, '$2') // Remove headers
    .replace(/>\s+(.*)/g, '$1') // Remove blockquotes
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
}

/**
 * Truncates text to a character limit, respecting paragraph boundaries.
 */
export function truncateMarkdown(text: string, limit: number): string {
  const plainText = removeMarkdownSyntax(text)

  if (plainText.length <= limit) {
    return text
  }

  let truncated = ''
  let length = 0

  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    const plainParagraph = removeMarkdownSyntax(paragraph)

    if (length + plainParagraph.length > limit) {
      // Calculate how many chars we can take from this paragraph
      const remaining = limit - length
      if (remaining > 0) {
        truncated += paragraph.slice(0, remaining) + '...'
      }
      break
    } else {
      truncated += paragraph + '\n'
      length += plainParagraph.length
    }
  }

  return truncated.trim()
}
