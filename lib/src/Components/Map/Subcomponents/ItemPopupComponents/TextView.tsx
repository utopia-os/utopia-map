/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Markdown from 'react-markdown'
import { Link as RouterLink } from 'react-router-dom'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

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
  text?: string
  truncate?: boolean
  rawText?: string
}) => {
  if (item) {
    text = item.text
    itemId = item.id
  }
  const tags = useTags()
  const addFilterTag = useAddFilterTag()

  const origin = window.location.origin

  let innerText = ''
  let replacedText = ''

  if (rawText) {
    innerText = replacedText = rawText
  } else if (text) {
    innerText = text
  }

  if (innerText && truncate) innerText = truncateText(removeMarkdownKeepParagraphs(innerText), 100)

  if (innerText) replacedText = fixUrls(innerText)

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

    // 4) Interne Links auf gleiche Base-URL
    if (href.startsWith(origin)) {
      const to = href.slice(origin.length) || '/'
      return <RouterLink to={to}>{children}</RouterLink>
    }

    if (href.startsWith('/')) {
      return <RouterLink to={href}>{children}</RouterLink>
    }

    return (
      <a href={href} target='_blank' rel='noreferrer'>
        {children}
      </a>
    )
  }

  return (
    <Markdown
      className={'markdown tw:text-map tw:leading-map tw:text-sm'}
      remarkPlugins={[remarkBreaks, remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeFilterYouTubeIframes, [rehypeSanitize, sanitizeSchema]]}
      components={{
        a: Link,
      }}
    >
      {replacedText}
    </Markdown>
  )
}

function removeMarkdownKeepParagraphs(text: string): string {
  return (
    text
      // 1) Bilder entfernen
      .replace(/!\[.*?\]\(.*?\)/g, '')
      // 2) Markdown-Links [Text](URL) → URL
      .replace(/\[.*?\]\(\s*(https?:\/\/[^\s)]+)\s*\)/g, '$1')
      // 3) Autolinks <http://…> → http://…
      .replace(/<\s*(https?:\/\/[^\s>]+)\s*>/g, '$1')
      // 4) Code-Fences und Inline-Code entfernen
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // 5) Fett/Italic löschen
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // 6) Überschriften-Hashes entfernen
      .replace(/^#{1,6}\s+(.*)$/gm, '$1')
      // 7) Listen-Marker entfernen (-, *, +, 1., 2., …)
      .replace(/^\s*([-+*]|\d+\.)\s+/gm, '')
      // 8) Tabellen-Pipes entfernen
      .replace(/^\|(.+)\|$/gm, '$1')
      .replace(/^\s*\|[-\s|]+\|$/gm, '')
      // 9) Blockquotes
      .replace(/^>\s+(.*)$/gm, '$1')
      // 10) Echte HTML-Tags (außer Absätze) entfernen
      .replace(/<(?!\s*\/?\s*p\s*>)[^>]+>/g, '')
      // 11) Zeilenumbrüche normalisieren
      .replace(/\r\n|\r/g, '\n')
      // 12) Mehrfache Leerzeilen auf max. 2 reduzieren
      .replace(/\n{3,}/g, '\n\n')
      // 13) Trim
      .trim()
  )
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

export const sanitizeSchema = {
  ...defaultSchema,

  tagNames: [...(defaultSchema.tagNames ?? []), 'div', 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), 'data-youtube-video'],
    iframe: [
      ...(defaultSchema.attributes?.iframe ?? []),
      'src',
      'width',
      'height',
      'allowfullscreen',
      'autoplay',
      'disablekbcontrols',
      'enableiframeapi',
      'endtime',
      'ivloadpolicy',
      'loop',
      'modestbranding',
      'origin',
      'playlist',
      'rel',
      'start',
    ],
    img: [...(defaultSchema.attributes?.img ?? []), 'style'],
  },

  protocols: {
    ...defaultSchema.protocols,
    src: [...(defaultSchema.protocols?.src ?? []), 'https'],
  },
}

export function rehypeFilterYouTubeIframes() {
  return (tree: any) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'iframe') {
        const src = String(node.properties?.src || '')
        // Nur echte YouTube-Embed-URLs zulassen
        if (
          !/^https:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/[A-Za-z0-9_-]+(?:\?.*)?$/.test(
            src,
          )
        ) {
          // ersetze es durch einen leeren div
          node.tagName = 'div'
          node.properties = {}
          node.children = []
        }
      }
    })
  }
}
