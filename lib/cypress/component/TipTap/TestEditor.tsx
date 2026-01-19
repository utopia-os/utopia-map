import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useMemo } from 'react'
import { MemoryRouter } from 'react-router-dom'

import {
  Hashtag,
  ItemMention,
  VideoEmbed,
  createHashtagSuggestion,
  createItemMentionSuggestion,
} from '#components/TipTap/extensions'
import { createConfiguredMarked } from '#components/TipTap/utils/configureMarked'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'
import type { Editor } from '@tiptap/core'

const configuredMarked = createConfiguredMarked()

export interface TestEditorProps {
  content: string
  editable?: boolean
  tags?: Tag[]
  onTagClick?: (tag: Tag) => void
  onAddTag?: (tag: Tag) => void
  items?: Item[]
  getItemColor?: (item: Item | undefined, fallback?: string) => string
  onReady?: (editor: Editor) => void
  testId?: string
  enableSuggestions?: boolean
}

export function TestEditor({
  content,
  editable = false,
  tags = [],
  onTagClick,
  onAddTag,
  items = [],
  getItemColor,
  onReady,
  testId = 'test-editor',
  enableSuggestions = false,
}: TestEditorProps) {
  const hashtagSuggestion = useMemo(
    () => (enableSuggestions ? createHashtagSuggestion(tags, onAddTag) : undefined),
    [tags, onAddTag, enableSuggestions],
  )

  const itemMentionSuggestion = useMemo(
    () => (enableSuggestions ? createItemMentionSuggestion(items, getItemColor) : undefined),
    [items, getItemColor, enableSuggestions],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Markdown.configure({
        marked: configuredMarked,
      }),
      Image,
      Link,
      VideoEmbed,
      Hashtag.configure({
        tags,
        onTagClick,
        suggestion: hashtagSuggestion,
      }),
      ItemMention.configure({
        items,
        getItemColor,
        suggestion: itemMentionSuggestion,
      }),
    ],
    content,
    contentType: 'markdown',
    editable,
  })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- editor can be null initially
    if (editor && onReady) {
      onReady(editor)
    }
  }, [editor, onReady])

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- editor can be null initially
  if (!editor) {
    return null
  }

  return (
    <div data-testid={testId} className='test-editor-wrapper'>
      <EditorContent editor={editor} />
    </div>
  )
}

export function TestEditorWithRouter(props: TestEditorProps) {
  return (
    <MemoryRouter>
      <TestEditor {...props} />
    </MemoryRouter>
  )
}

export function createTestTag(name: string, color = '#3B82F6'): Tag {
  return {
    id: `tag-${name}`,
    name,
    color,
  } as Tag
}

export function createTestItem(id: string, name: string, color = '#10B981'): Item {
  return {
    id,
    name,
    color,
  } as Item
}
