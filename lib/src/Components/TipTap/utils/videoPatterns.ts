/**
 * Shared video URL patterns for YouTube and Rumble.
 * Used by both VideoEmbed extension and preprocessMarkdown utility.
 */

export type VideoProvider = 'youtube' | 'rumble'

export interface VideoInfo {
  provider: VideoProvider
  videoId: string
}

// YouTube video ID pattern: 11 characters (alphanumeric, dash, underscore)
// We allow 10-12 for flexibility
const YOUTUBE_VIDEO_ID_PATTERN = '[a-zA-Z0-9_-]{10,12}'

// Rumble video ID pattern: alphanumeric only
const RUMBLE_VIDEO_ID_PATTERN = '[a-zA-Z0-9]+'

/**
 * Regex patterns for parsing video URLs (used for paste handling)
 */
export const VIDEO_URL_PATTERNS = {
  youtube: new RegExp(
    `^https?:\\/\\/(?:www\\.)?youtube\\.com\\/watch\\?v=(${YOUTUBE_VIDEO_ID_PATTERN})(?:&|$)`,
  ),
  youtubeShort: new RegExp(`^https?:\\/\\/youtu\\.be\\/(${YOUTUBE_VIDEO_ID_PATTERN})(?:\\?|$)`),
  rumble: new RegExp(`^https?:\\/\\/rumble\\.com\\/embed\\/(${RUMBLE_VIDEO_ID_PATTERN})(?:\\/|$)`),
} as const

/**
 * Regex patterns for markdown tokenizer (used in TipTap extension)
 * These match autolinks: <https://...>
 */
export const VIDEO_AUTOLINK_PATTERNS = {
  youtube: new RegExp(
    `^<https?:\\/\\/(?:www\\.)?youtube\\.com\\/watch\\?v=(${YOUTUBE_VIDEO_ID_PATTERN})[^>]*>`,
  ),
  youtubeShort: new RegExp(`^<https?:\\/\\/youtu\\.be\\/(${YOUTUBE_VIDEO_ID_PATTERN})[^>]*>`),
  rumble: new RegExp(`^<https?:\\/\\/rumble\\.com\\/embed\\/(${RUMBLE_VIDEO_ID_PATTERN})[^>]*>`),
} as const

/**
 * Regex patterns for preprocessing markdown (global replacement)
 * These match both autolinks <url> and markdown links [text](url)
 */
export const VIDEO_PREPROCESS_PATTERNS = {
  // Autolinks: <https://...>
  youtubeAutolink: /<https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^>&]+)[^>]*>/g,
  youtubeShortAutolink: /<https?:\/\/youtu\.be\/([^>?]+)[^>]*>/g,
  rumbleAutolink: /<https?:\/\/rumble\.com\/embed\/([^>]+)>/g,

  // Markdown links: [text](url)
  youtubeLink: /\[([^\]]*)\]\(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^)&]+)[^)]*\)/g,
  youtubeShortLink: /\[([^\]]*)\]\(https?:\/\/youtu\.be\/([^?)]+)[^)]*\)/g,
  rumbleLink: /\[([^\]]*)\]\(https?:\/\/rumble\.com\/embed\/([^)]+)\)/g,
} as const

/**
 * Generates embed URLs for video providers
 */
export function getVideoEmbedUrl(provider: VideoProvider, videoId: string): string {
  // Sanitize videoId to only allow safe characters
  const safeVideoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '')

  switch (provider) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${safeVideoId}`
    case 'rumble':
      return `https://rumble.com/embed/${safeVideoId}`
  }
}

/**
 * Generates the canonical URL for a video (used in markdown serialization)
 */
export function getVideoCanonicalUrl(provider: VideoProvider, videoId: string): string {
  switch (provider) {
    case 'youtube':
      return `https://www.youtube.com/watch?v=${videoId}`
    case 'rumble':
      return `https://rumble.com/embed/${videoId}`
  }
}

/**
 * Extracts video provider and ID from a URL
 */
export function parseVideoUrl(url: string): VideoInfo | null {
  let match = VIDEO_URL_PATTERNS.youtube.exec(url)
  if (match) {
    return { provider: 'youtube', videoId: match[1] }
  }

  match = VIDEO_URL_PATTERNS.youtubeShort.exec(url)
  if (match) {
    return { provider: 'youtube', videoId: match[1] }
  }

  match = VIDEO_URL_PATTERNS.rumble.exec(url)
  if (match) {
    return { provider: 'rumble', videoId: match[1] }
  }

  return null
}

/**
 * Generates a video-embed HTML tag for preprocessing
 */
export function createVideoEmbedTag(provider: VideoProvider, videoId: string): string {
  return `<video-embed provider="${provider}" video-id="${videoId}"></video-embed>`
}
