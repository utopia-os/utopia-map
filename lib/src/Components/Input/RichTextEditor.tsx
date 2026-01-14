import { Color } from '@tiptap/extension-color'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect, useMemo } from 'react'
import { Markdown } from 'tiptap-markdown'

import { useGetItemColor } from '#components/Map/hooks/useItemColor'
import { useItems } from '#components/Map/hooks/useItems'
import { useAddTag, useTags } from '#components/Map/hooks/useTags'
import { Hashtag, ItemMention, VideoEmbed } from '#components/TipTap/extensions'
import { createHashtagSuggestion, createItemMentionSuggestion } from '#components/TipTap/extensions'
import { preprocessMarkdown } from '#components/TipTap/utils/preprocessMarkdown'

import { InputLabel } from './InputLabel'
import { TextEditorMenu } from './TextEditorMenu'

import type { MarkdownStorage } from 'tiptap-markdown'

interface RichTextEditorProps {
  labelTitle?: string
  labelStyle?: string
  containerStyle?: string
  defaultValue: string
  placeholder?: string
  showMenu?: boolean
  updateFormValue?: (value: string) => void
}

declare module '@tiptap/core' {
  interface Storage {
    markdown: MarkdownStorage
  }
}

/**
 * @category Input
 */
export function RichTextEditor({
  labelTitle,
  containerStyle,
  defaultValue,
  placeholder,
  showMenu = true,
  updateFormValue,
}: RichTextEditorProps) {
  const tags = useTags()
  const addTag = useAddTag()
  const items = useItems()
  const getItemColor = useGetItemColor()

  // Memoize suggestion configurations to prevent unnecessary re-renders
  const hashtagSuggestion = useMemo(() => createHashtagSuggestion(tags, addTag), [tags, addTag])
  const itemMentionSuggestion = useMemo(
    () => createItemMentionSuggestion(items, getItemColor),
    [items, getItemColor],
  )

  const handleChange = () => {
    let newValue: string | undefined = editor.storage.markdown.getMarkdown()

    const regex = /!\[.*?\]\(.*?\)/g
    newValue = newValue.replace(regex, (match: string) => match + '\n\n')
    if (updateFormValue) {
      updateFormValue(newValue)
    }
  }

  const editor = useEditor({
    extensions: [
      Color.configure({ types: ['textStyle', 'listItem'] }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Markdown.configure({
        linkify: true,
        transformCopiedText: true,
        transformPastedText: true,
      }),
      Image,
      Link,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      VideoEmbed,
      Hashtag.configure({
        tags,
        suggestion: hashtagSuggestion,
      }),
      ItemMention.configure({
        suggestion: itemMentionSuggestion,
        items,
        getItemColor,
      }),
    ],
    content: preprocessMarkdown(defaultValue),
    onUpdate: handleChange,
    editorProps: {
      attributes: {
        class: `tw:h-full markdown tw:max-h-full tw:p-2 tw:overflow-y-auto`,
      },
    },
  })

  useEffect(() => {
    if (editor.storage.markdown.getMarkdown() === '' || !editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(preprocessMarkdown(defaultValue))
    }
  }, [defaultValue, editor])

  return (
    <div
      className={`tw:form-control tw:w-full tw:flex tw:flex-col tw:min-h-0 ${containerStyle ?? ''}`}
    >
      {labelTitle ? <InputLabel label={labelTitle} /> : null}
      <div
        className={`editor-wrapper tw:border-base-content/20 tw:rounded-box tw:border tw:flex tw:flex-col tw:flex-1 tw:min-h-0`}
      >
        <>
          {showMenu ? <TextEditorMenu editor={editor} /> : null}
          <EditorContent editor={editor} />
        </>
      </div>
    </div>
  )
}
