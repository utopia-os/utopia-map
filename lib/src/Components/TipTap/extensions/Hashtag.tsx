import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'

import { decodeTag } from '#utils/FormatTags'

import type { Tag } from '#types/Tag'
import type { NodeViewProps } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'

type AnySuggestionOptions = Partial<SuggestionOptions>

export interface HashtagOptions {
  tags: Tag[]
  onTagClick?: (tag: Tag) => void
  HTMLAttributes: Record<string, unknown>
  suggestion?: AnySuggestionOptions
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
      suggestion: undefined,
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

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (text: string) => void }, node: { attrs: { label: string } }) {
          // Write as plain hashtag
          state.write(`#${node.attrs.label}`)
        },
        parse: {
          // Parsing is handled by preprocessHashtags
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(HashtagComponent)
  },

  addProseMirrorPlugins() {
    // Only add suggestion plugin if suggestion options are provided
    if (!this.options.suggestion) {
      return []
    }

    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

function HashtagComponent({ node, extension, editor }: NodeViewProps) {
  const options = extension.options as HashtagOptions
  const tagName = node.attrs.label as string
  const tag = options.tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())
  const isEditable = editor.isEditable

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate when in edit mode
    if (isEditable) return

    e.preventDefault()
    e.stopPropagation()
    if (tag && options.onTagClick) {
      options.onTagClick(tag)
    }
  }

  return (
    <NodeViewWrapper as='span' className='hashtag-wrapper'>
      <span
        className='hashtag tw:font-bold'
        style={{
          color: tag?.color ?? 'inherit',
          cursor: isEditable ? 'text' : 'pointer',
        }}
        onClick={handleClick}
      >
        {decodeTag(`#${tagName}`)}
      </span>
    </NodeViewWrapper>
  )
}
