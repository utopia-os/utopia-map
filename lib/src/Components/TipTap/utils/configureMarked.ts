/**
 * Configure marked.js with emStrongMask hook to prevent underscores
 * in hashtags from being interpreted as emphasis delimiters.
 */
import { Marked } from 'marked'

import type { marked } from 'marked'

const HASHTAG_REGEX = /#[a-zA-Z0-9À-ÖØ-öø-ʸ_-]+/g

function emStrongMask(src: string): string {
  return src.replace(HASHTAG_REGEX, (match) => match.replace(/_/g, 'a'))
}

export function createConfiguredMarked(): typeof marked {
  const instance = new Marked()
  instance.use({ hooks: { emStrongMask } })
  return instance as unknown as typeof marked
}
