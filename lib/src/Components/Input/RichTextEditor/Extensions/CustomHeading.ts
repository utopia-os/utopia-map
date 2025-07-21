/* eslint-disable security/detect-non-literal-regexp */
import { textblockTypeInputRule } from '@tiptap/core'
import { Heading } from '@tiptap/extension-heading'

export const CustomHeading = Heading.extend({
  addInputRules() {
    return this.options.levels.map((level) => {
      return textblockTypeInputRule({
        find: new RegExp(`^(#{${Math.min(...this.options.levels)},${level}}) $`),
        type: this.type,
        getAttributes: {
          level,
        },
      })
    })
  },
})
