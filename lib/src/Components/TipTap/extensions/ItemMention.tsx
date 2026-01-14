import { mergeAttributes, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import { useNavigate } from 'react-router-dom'

import type { Item } from '#types/Item'
import type { NodeViewProps } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'

type AnySuggestionOptions = Partial<SuggestionOptions>

export interface ItemMentionOptions {
  HTMLAttributes: Record<string, unknown>
  suggestion?: AnySuggestionOptions
  items?: Item[]
  getItemColor?: (item: Item | undefined, fallback?: string) => string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    itemMention: {
      insertItemMention: (attributes: { id: string; label: string }) => ReturnType
    }
  }
}

export const ItemMention = Node.create<ItemMentionOptions>({
  name: 'itemMention',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: undefined,
      items: [],
      getItemColor: undefined,
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
    return [{ tag: 'span[data-item-mention]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-item-mention': '',
        class: 'item-mention',
      }),
      `@${node.attrs.label as string}`,
    ]
  },

  addCommands() {
    return {
      insertItemMention:
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
        serialize(
          state: { write: (text: string) => void },
          node: { attrs: { id: string; label: string } },
        ) {
          // Write as markdown link: [@Label](/item/id)
          const { id, label } = node.attrs
          state.write(`[@${label}](/item/${id})`)
        },
        parse: {
          // Parsing is handled by preprocessItemMentions
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ItemMentionComponent)
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

function ItemMentionComponent({ node, editor, extension }: NodeViewProps) {
  const navigate = useNavigate()
  const options = extension.options as ItemMentionOptions
  const label = node.attrs.label as string
  const id = node.attrs.id as string
  const isEditable = editor.isEditable

  // Find the item to get its color
  const item = options.items?.find((i) => i.id === id)
  const color = options.getItemColor
    ? options.getItemColor(item, 'var(--color-primary)')
    : (item?.color ?? 'var(--color-primary)')

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate when in edit mode
    if (isEditable) return

    e.preventDefault()
    e.stopPropagation()
    // Navigate to /item/[uuid] - use absolute path to avoid double /item/item/
    void navigate(`/item/${id}`, { replace: false })
  }

  return (
    <NodeViewWrapper as='span' className='item-mention-wrapper'>
      <span
        className='item-mention tw:font-bold'
        style={{
          color,
          cursor: isEditable ? 'text' : 'pointer',
        }}
        onClick={handleClick}
      >
        @{label}
      </span>
    </NodeViewWrapper>
  )
}
