/* eslint-disable @typescript-eslint/no-unsafe-call */
import truncate from 'markdown-truncate'
import Markdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useGetItemTags, useTags } from '#components/Map/hooks/useTags'
import { decodeTag } from '#utils/FormatTags'

import type { Item } from '#types/Item'

export const TextPreview = ({ item }: { item: Item }) => {
  const getItemTags = useGetItemTags()

  if (!item.text) return null
  // Text auf ~100 Zeichen stutzen (inkl. Ellipse „…“)
  const previewRaw = truncate(
    removeGfmTables(convertImgTagsToMarkdown(removeMentionSpans(removeHashtags(item.text)))),
    {
      limit: 150,
      ellipsis: true,
    },
  ) as string

  const withExtraHashes = previewRaw.replace(
    /^(#{1,6})\s/gm,
    (_match: string, hashes: string): string => `${hashes}## `,
  )

  return (
    <div className='markdown'>
      <Markdown remarkPlugins={[remarkBreaks, remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {withExtraHashes}
      </Markdown>
      {getItemTags(item).map((tag) => (
        <HashTag tag={tag} key={tag} />
      ))}
    </div>
  )
}

export const HashTag = ({ tag }: { tag: Tag }) => {
  const tags = useTags()
  const t = tags.find((t) => t.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase())
  const addFilterTag = useAddFilterTag()
  if (!t) return null
  return (
    <a
      className='hashtag'
      style={{ color: t.color }}
      key={`${t.name}`}
      onClick={(e) => {
        e.stopPropagation()
        addFilterTag(t)
      }}
    >
      {`#${decodeTag(tag.name)} `}
    </a>
  )
}

export function removeMentionSpans(html: string): string {
  const mentionSpanRegex =
    /<span\b(?=[^>]*\bdata-type="mention")(?=[^>]*\bclass="mention")[^>]*>[\s\S]*?<\/span>/gi
  return html.replace(mentionSpanRegex, '')
}

export function removeHashtags(input: string): string {
  const hashtagRegex = /(^|\s)(?!#{1,6}\s)(#[A-Za-z0-9_]+)\b/g
  return input.replace(hashtagRegex, '$1').trim()
}

export function convertImgTagsToMarkdown(input: string): string {
  return input.replace(/<img\s+[^>]*>/gi, (imgTag) => {
    const srcMatch = imgTag.match(/src\s*=\s*"([^"]+)"/i)
    if (!srcMatch) {
      return imgTag
    }
    const src = srcMatch[1]

    const altMatch = imgTag.match(/alt\s*=\s*"([^"]*)"/i)
    const alt = altMatch ? altMatch[1] : ''

    const titleMatch = imgTag.match(/title\s*=\s*"([^"]*)"/i)
    const title = titleMatch ? titleMatch[1] : ''

    return `![${alt}](${src}${title ? ` "${title}"` : ''})`
  })
}

export function removeGfmTables(input: string): string {
  const gfmTableRegex =
    // eslint-disable-next-line security/detect-unsafe-regex
    /^[ \t]*\|.*\|.*\r?\n^[ \t]*\|[ \t\-:|]+\r?\n(?:^[ \t]*\|.*\|.*(?:\r?\n|$))*/gm
  return input.replace(gfmTableRegex, '')
}
