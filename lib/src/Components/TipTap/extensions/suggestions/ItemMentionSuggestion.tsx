import { PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import { SuggestionList } from './SuggestionList'

import type { Item } from '#types/Item'
import type { SuggestionListRef } from './SuggestionList'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { Instance as TippyInstance } from 'tippy.js'

export const ItemMentionSuggestionPluginKey = new PluginKey('itemMentionSuggestion')

/**
 * Creates an item mention suggestion configuration for TipTap.
 * Allows users to mention items with @ syntax.
 */
export function createItemMentionSuggestion(
  items: Item[],
  getItemColor?: (item: Item | undefined, fallback?: string) => string,
): Partial<SuggestionOptions<Item>> {
  return {
    pluginKey: ItemMentionSuggestionPluginKey,
    char: '@',
    allowedPrefixes: null, // null = any prefix allowed (including start of line)

    items: ({ query }): Item[] => {
      if (!query) {
        return items.filter((item) => item.name).slice(0, 8)
      }

      return items
        .filter((item) => item.name?.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    },

    render: () => {
      let component: ReactRenderer<SuggestionListRef>
      let popup: TippyInstance[]

      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionList, {
            props: {
              items: props.items,
              command: props.command,
              type: 'item',
              getItemColor,
            },
            editor: props.editor,
          })

          if (!props.clientRect) return

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          })
        },

        onUpdate: (props) => {
          component.updateProps({
            items: props.items,
            command: props.command,
            type: 'item',
            getItemColor,
          })

          if (!props.clientRect) return

          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          })
        },

        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup[0].hide()
            return true
          }
          return component.ref?.onKeyDown(props.event) ?? false
        },

        onExit: () => {
          popup[0].destroy()
          component.destroy()
        },
      }
    },

    command: ({ editor, range, props }) => {
      // Insert item mention and a space after it
      // Using a single insertContent call with an array ensures atomic insertion
      const item = props as Item
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([
          {
            type: 'itemMention',
            attrs: {
              id: item.id,
              label: item.name,
            },
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run()
    },
  }
}
