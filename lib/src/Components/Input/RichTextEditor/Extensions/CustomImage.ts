import { Image } from '@tiptap/extension-image'

import type { Attribute } from '@tiptap/core'

export const CustomImage = Image.extend({
  addAttributes() {
    const parentAttrs = (this.parent?.() ?? {}) as Record<string, Attribute>

    return {
      ...parentAttrs,

      style: {
        default: null,
        parseHTML: (element: Element): string | null => {
          return element.getAttribute('style')
        },
        renderHTML: (attrs: { style: string | null }) => {
          if (!attrs.style) {
            return {}
          }
          return { style: attrs.style }
        },
      },

      width: {
        default: null,
        parseHTML: (element: Element): string | null => {
          return element.getAttribute('width')
        },
        renderHTML: (attrs: { width: string | null }) => {
          return attrs.width ? { width: attrs.width } : {}
        },
      },

      height: {
        default: null,
        parseHTML: (element: Element): string | null => {
          return element.getAttribute('height')
        },
        renderHTML: (attrs: { height: string | null }) => {
          return attrs.height ? { height: attrs.height } : {}
        },
      },
    }
  },
})
