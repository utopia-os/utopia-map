import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

import { decodeTag } from '#utils/FormatTags'

import type { Tag } from '#types/Tag'
import type { NodeViewProps } from '@tiptap/react'

export interface HashtagOptions {
  tags: Tag[]
  onTagClick?: (tag: Tag) => void
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hashtag: {
      insertHashtag: (attributes: { label: string; id?: string }) => ReturnType
    }
  }
}

export const Hashtag = Node.create<HashtagOptions>({
  name: 'hashtag',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      tags: [],
      onTagClick: undefined,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.id) return {}
          return { 'data-id': attributes.id }
        },
      },
      label: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-label'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.label) return {}
          return { 'data-label': attributes.label }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-hashtag]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-hashtag': '',
        class: 'hashtag',
      }),
      `#${node.attrs.label as string}`,
    ]
  },

  addCommands() {
    return {
      insertHashtag:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(HashtagComponent)
  },
})

function HashtagComponent({ node, extension }: NodeViewProps) {
  const options = extension.options as HashtagOptions
  const tagName = node.attrs.label as string
  const tag = options.tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (tag && options.onTagClick) {
      options.onTagClick(tag)
    }
  }

  return (
    <NodeViewWrapper as='span' className='hashtag-wrapper'>
      <span
        className='hashtag'
        style={tag ? { color: tag.color, cursor: 'pointer' } : { cursor: 'default' }}
        onClick={handleClick}
      >
        {decodeTag(`#${tagName}`)}
      </span>
    </NodeViewWrapper>
  )
}
