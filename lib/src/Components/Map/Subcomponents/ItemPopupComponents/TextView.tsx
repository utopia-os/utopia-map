import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Markdown } from 'tiptap-markdown'

import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useGetItemColor } from '#components/Map/hooks/useItemColor'
import { useItems } from '#components/Map/hooks/useItems'
import { useTags } from '#components/Map/hooks/useTags'
import { Hashtag, ItemMention, VideoEmbed } from '#components/TipTap/extensions'
import {
  preprocessMarkdown,
  removeMarkdownSyntax,
  truncateMarkdown,
} from '#components/TipTap/utils/preprocessMarkdown'

import type { Item } from '#types/Item'

/**
 * @category Map
 */
export const TextView = ({
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
  const addFilterTag = useAddFilterTag()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useItems()
  const getItemColor = useGetItemColor()

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

  // Apply truncation if needed
  if (innerText && truncate) {
    innerText = truncateMarkdown(removeMarkdownSyntax(innerText), 100)
  }

  // Pre-process the markdown
  const processedText = innerText ? preprocessMarkdown(innerText) : ''

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Markdown.configure({
          html: true, // Allow HTML in markdown (for our preprocessed tags)
          transformPastedText: true,
          linkify: true,
        }),
        Hashtag.configure({
          tags,
          onTagClick: (tag) => {
            addFilterTag(tag)
          },
        }),
        ItemMention.configure({
          items,
          getItemColor,
        }),
        VideoEmbed,
      ],
      content: processedText,
      editable: false,
      editorProps: {
        attributes: {
          class: 'markdown tw:text-map tw:leading-map tw:text-sm',
        },
      },
    },
    [processedText, tags],
  )

  // Update content when text changes
  useEffect(() => {
    editor.commands.setContent(processedText)
  }, [editor, processedText])

  // Handle link clicks for internal navigation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
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
      // External links are handled by the Link extension (target="_blank")
    }

    container.addEventListener('click', handleClick)
    return () => {
      container.removeEventListener('click', handleClick)
    }
  }, [navigate])

  if (!innerText) {
    return null
  }

  return (
    <div translate='no' ref={containerRef}>
      <EditorContent editor={editor} />
    </div>
  )
}
