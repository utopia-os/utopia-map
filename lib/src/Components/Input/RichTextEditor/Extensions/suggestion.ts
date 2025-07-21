import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import { MentionList } from './MentionList'

import type { MentionListHandle } from './MentionList'
import type { SuggestionProps, SuggestionOptions, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { Instance as TippyInstance } from 'tippy.js'

export const suggestion: Partial<SuggestionOptions> = {
  render() {
    let component: ReactRenderer<MentionListHandle>
    let popup: TippyInstance[]

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: () =>
            props.clientRect ? (props.clientRect() ?? new DOMRect()) : new DOMRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: SuggestionProps) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: () =>
            props.clientRect ? (props.clientRect() ?? new DOMRect()) : new DOMRect(),
        })
      },

      onKeyDown(props: SuggestionKeyDownProps): boolean {
        if (props.event.key === 'Escape') {
          popup[0].hide()
          return true
        }
        return (component.ref as MentionListHandle | undefined)?.onKeyDown(props) ?? false
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
