import { NodeViewWrapper } from '@tiptap/react'

import { useAddFilterTag } from '#components/Map/hooks/useFilter'
import { useTags } from '#components/Map/hooks/useTags'

import type { NodeViewProps } from '@tiptap/core'

export const Hashtag = ({ node }: NodeViewProps) => {
  const { id } = node.attrs as { id: string }
  const tags = useTags()
  const addFilterTag = useAddFilterTag()

  const tag = tags.find((t) => t.name === id)

  return (
    <NodeViewWrapper className='react-component'>
      <a
        className='hashtag'
        style={{ color: tag?.color ?? 'var(--color-base-content)' }}
        onClick={(e) => {
          e.stopPropagation()
          tag && addFilterTag(tag)
        }}
      >
        #{tag?.name}
      </a>
    </NodeViewWrapper>
  )
}
