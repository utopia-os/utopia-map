/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Markdown from 'react-markdown'
import { Link as RouterLink } from 'react-router-dom'
import remarkBreaks from 'remark-breaks'

import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useTags } from '#components/Map/hooks/useTags'
import { decodeTag } from '#utils/FormatTags'
import { hashTagRegex } from '#utils/HashTagRegex'
import { fixUrls, mailRegex } from '#utils/ReplaceURLs'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

/**
 * @category Map
 */
export const TextView = ({
  item,
  itemId,
  text,
  truncate = false,
  rawText,
}: {
  item?: Item
  itemId?: string
  text?: string | null
  truncate?: boolean
  rawText?: string
}) => {
  if (item) {
    text = item.text
    itemId = item.id
  }
  const tags = useTags()
  const addFilterTag = useAddFilterTag()

  let innerText = ''
  let replacedText = ''

  if (rawText) {
    innerText = replacedText = rawText
  } else if (text === undefined) {
    // Field was omitted by backend (no permission)
    innerText = replacedText = `[Login](/login) to see this ${
      item?.layer?.item_default_name ?? 'item'
    }`
  } else if (text === null || text === '') {
    // Field is not set or empty - show nothing
    innerText = ''
  } else {
    // Field has a value
    innerText = text
  }

  if (innerText && truncate)
    innerText = truncateText(removeMarkdownKeepLinksAndParagraphs(innerText), 100)

  if (innerText) replacedText = fixUrls(innerText)

  if (replacedText) {
    replacedText = replacedText.replace(
      /(?<!\]?\()(?<!<)https?:\/\/[^\s)]+(?!\))(?!>)/g,
      (url) => `[${url.replace(/https?:\/\/w{3}\./gi, '')}](${url})`,
    )
  }

  if (replacedText) {
    replacedText = replacedText.replace(mailRegex, (url) => {
      return `[${url}](mailto:${url})`
    })
  }

  if (replacedText) {
    replacedText = replacedText.replace(hashTagRegex, (match) => {
      return `[${match}](${match})`
    })
  }

  const HashTag = ({ children, tag, itemId }: { children: string; tag: Tag; itemId?: string }) => {
    return (
      <a
        className='hashtag'
        style={
          tag && {
            color: tag.color,
          }
        }
        key={tag ? tag.name + itemId : itemId}
        onClick={(e) => {
          e.stopPropagation()
          addFilterTag(tag)
        }}
      >
        {decodeTag(children)}
      </a>
    )
  }

  const Link = ({ href, children }: { href: string; children: string }) => {
    // Youtube
    if (href.startsWith('https://www.youtube.com/watch?v=')) {
      const videoId = href?.split('v=')[1].split('&')[0]
      const youtubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`

      return (
        <iframe src={youtubeEmbedUrl} allow='fullscreen;  picture-in-picture' allowFullScreen />
      )
    }

    // Rumble
    if (href.startsWith('https://rumble.com/embed/')) {
      return <iframe src={href} allow='fullscreen;  picture-in-picture' allowFullScreen />
    }

    // HashTag
    if (href.startsWith('#')) {
      const tag = tags.find((t) => t.name.toLowerCase() === decodeURI(href).slice(1).toLowerCase())
      if (tag)
        return (
          <HashTag tag={tag} itemId={itemId}>
            {children}
          </HashTag>
        )
      else return children
    }

    // Internal Link (React Router)
    if (href.startsWith('/')) {
      return <RouterLink to={href}>{children}</RouterLink>
    }

    // External Link
    return (
      <a href={href} target='_blank' rel='noreferrer'>
        {children}
      </a>
    )
  }

  return (
    <div translate='no'>
      <Markdown
        className={'markdown tw:text-map tw:leading-map tw:text-sm'}
        remarkPlugins={[remarkBreaks]}
        components={{
          a: Link,
        }}
      >
        {replacedText}
      </Markdown>
    </div>
  )
}

function removeMarkdownKeepLinksAndParagraphs(text) {
  // Remove Markdown syntax using regular expressions but keep links and paragraphs
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/(`{1,3})(.*?)\1/g, '$2') // Remove inline code
    .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2') // Remove bold and italic
    .replace(/(#+)\s+(.*)/g, '$2') // Remove headers
    .replace(/>\s+(.*)/g, '$1') // Remove blockquotes
    .replace(/^\s*\n/gm, '\n') // Preserve empty lines
    .replace(/(\r\n|\n|\r)/gm, '\n') // Preserve line breaks
}

function truncateText(text, limit) {
  if (text.length <= limit) {
    return text
  }

  let truncated = ''
  let length = 0

  // Split the text by paragraphs
  const paragraphs = text.split('\n')

  for (const paragraph of paragraphs) {
    if (length + paragraph.length > limit) {
      truncated += paragraph.slice(0, limit - length) + '...'
      break
    } else {
      truncated += paragraph + '\n'
      length += paragraph.length
    }
  }

  return truncated.trim()
}
