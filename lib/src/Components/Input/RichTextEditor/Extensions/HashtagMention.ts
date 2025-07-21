import { Mention } from '@tiptap/extension-mention'
import { ReactNodeViewRenderer } from '@tiptap/react'

import { Hashtag } from './Hashtag'

export const HashtagMention = Mention.extend({
  name: 'mention',
  addNodeView() {
    return ReactNodeViewRenderer(Hashtag)
  },
})
