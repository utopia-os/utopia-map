import { PluginKey } from '@tiptap/pm/state'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import { SuggestionList } from './SuggestionList'

import type { Instance as TippyInstance } from 'tippy.js'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { Tag } from '#types/Tag'
import type { SuggestionListRef } from './SuggestionList'

export const HashtagSuggestionPluginKey = new PluginKey('hashtagSuggestion')

type HashtagSuggestionItem = Tag | { isNew: true; name: string }

/**
 * Creates a hashtag suggestion configuration for TipTap.
 * Supports creating new tags if they don't exist.
 */
export function createHashtagSuggestion(
  tags: Tag[],
  addTag?: (tag: Tag) => void,
): Partial<SuggestionOptions<HashtagSuggestionItem>> {
  return {
    pluginKey: HashtagSuggestionPluginKey,
    char: '#',
    allowedPrefixes: null, // null = any prefix allowed (including start of line)

    items: ({ query }): HashtagSuggestionItem[] => {
      if (!query) {
        return tags.slice(0, 8)
      }

      const filtered = tags
        .filter((tag) => tag.name.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 7)

      // Check if there's an exact match
      const exactMatch = tags.some((tag) => tag.name.toLowerCase() === query.toLowerCase())

      // If no exact match and addTag is provided, offer to create new tag
      if (!exactMatch && addTag && query.length > 0) {
        return [...filtered, { isNew: true, name: query }]
      }

      return filtered
    },

    render: () => {
      let component: ReactRenderer<SuggestionListRef>
      let popup: TippyInstance[]
      let currentItems: HashtagSuggestionItem[] = []
      let currentCommand: ((item: HashtagSuggestionItem) => void) | null = null

      return {
        onStart: (props) => {
          currentItems = props.items
          currentCommand = props.command

          component = new ReactRenderer(SuggestionList, {
            props: {
              items: props.items,
              command: props.command,
              type: 'hashtag',
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
          currentItems = props.items
          currentCommand = props.command

          component.updateProps({
            items: props.items,
            command: props.command,
            type: 'hashtag',
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
          // Space key triggers selection of the first item (or creates new tag)
          if (props.event.key === ' ') {
            const firstItem = currentItems[0]
            if (firstItem && currentCommand) {
              currentCommand(firstItem)
              return true
            }
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
      let tagToInsert: Tag

      // Create new tag if needed
      if ('isNew' in props && props.isNew) {
        const newTag: Tag = {
          id: crypto.randomUUID(),
          name: props.name,
          color: '#888888', // Default color
        }
        if (addTag) {
          addTag(newTag)
        }
        tagToInsert = newTag
      } else {
        tagToInsert = props as Tag
      }

      // Insert hashtag node and a space after it
      // Using a single insertContent call with an array ensures atomic insertion
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent([
          {
            type: 'hashtag',
            attrs: { id: tagToInsert.id, label: tagToInsert.name },
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
