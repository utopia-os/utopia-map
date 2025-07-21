/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Color } from '@tiptap/extension-color'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Youtube } from '@tiptap/extension-youtube'
import { EditorContent, mergeAttributes, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { MarkdownSerializer } from 'prosemirror-markdown'
import { useEffect } from 'react'
import { Markdown } from 'tiptap-markdown'

import { useTags } from '#components/Map/hooks/useTags'

import { CustomHeading } from './Extensions/CustomHeading'
import { CustomImage } from './Extensions/CustomImage'
import { HashtagMention } from './Extensions/HashtagMention'
import { suggestion } from './Extensions/suggestion'
import { TextEditorMenu } from './TextEditorMenu'

import type { Editor } from '@tiptap/react'
import type { MarkdownSerializerState } from 'prosemirror-markdown'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

interface RichTextEditorProps {
  labelTitle?: string
  labelStyle?: string
  containerStyle?: string
  defaultValue: string
  placeholder?: string
  showMenu?: boolean
  readOnly?: boolean
  updateFormValue?: (value: string) => void
}

interface ImageAttrs {
  src: string
  alt?: string
  title?: string
  style?: string
}

type NodeSerializerFn = (
  state: MarkdownSerializerState,
  node: ProseMirrorNode,
  parent: ProseMirrorNode,
  index: number,
) => void

/**
 * @category Input
 */
export function RichTextEditor({
  labelTitle,
  labelStyle,
  containerStyle,
  defaultValue,
  placeholder,
  showMenu = true,
  readOnly = false,
  updateFormValue,
}: RichTextEditorProps) {
  const handleChange = () => {
    if (updateFormValue) {
      if (editor) {
        updateFormValue(getStyledMarkdown(editor))
      }
    }
  }

  const tags = useTags()

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      Color.configure({ types: ['textStyle', 'listItem'] }),
      Youtube.configure({
        nocookie: true,
        allowFullscreen: true,
        addPasteHandler: true,
        height: undefined,
        width: undefined,
        modestBranding: true,
      }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: false,
      }),
      HashtagMention.configure({
        HTMLAttributes: { class: 'mention' },
        renderHTML: ({ node, options }) => {
          return [
            'span',
            mergeAttributes(options.HTMLAttributes, {
              'data-id': node.attrs.id,
            }),
            `#${node.attrs.id}`,
          ]
        },
        suggestion: {
          char: '#',
          items: ({ query }) => {
            return tags
              .map((tag) => tag.name)
              .filter((tag) => tag.toLowerCase().startsWith(query.toLowerCase()))
              .slice(0, 5)
          },
          ...suggestion,
        },
      }),
      Markdown.configure({
        html: true,
        linkify: true,
        transformCopiedText: true,
        transformPastedText: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableCell,
      TableHeader,
      TableRow,
      TaskList,
      TaskItem,
      CustomImage,
      Link,
      CustomHeading,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: defaultValue,
    onUpdate: handleChange,
    editorProps: {
      attributes: {
        class: `tw:h-full markdown tw:max-h-full ${readOnly ? `` : `tw:p-2`} tw:overflow-y-auto tw:overflow-x-hidden`,
      },
    },
  })

  useEffect(() => {
    if (editor?.storage.markdown.getMarkdown() === '' || !editor?.storage.markdown.getMarkdown()) {
      editor?.commands.setContent(defaultValue)
    }
  }, [defaultValue, editor])

  return (
    <div
      className={`tw:form-control tw:w-full tw:flex tw:flex-col tw:min-h-0 ${containerStyle ?? ''}`}
    >
      {labelTitle ? (
        <label className='tw:label tw:pb-1'>
          <span className={`tw:label-text tw:text-base-content ${labelStyle ?? ''}`}>
            {labelTitle}
          </span>
        </label>
      ) : null}
      <div
        className={`${readOnly ? `` : `editor-wrapper tw:border-base-content/20 tw:rounded-box tw:border`} tw:flex tw:flex-col tw:flex-1 tw:min-h-0`}
      >
        {editor ? (
          <>
            {showMenu && !readOnly ? <TextEditorMenu editor={editor} /> : null}
            <EditorContent editor={editor} />
          </>
        ) : null}
      </div>
    </div>
  )
}

export function getStyledMarkdown(editor: Editor): string {
  const { serializer } = editor.storage.markdown as { serializer: MarkdownSerializer }
  const baseNodes = serializer.nodes as Record<string, NodeSerializerFn>
  const marks = serializer.marks
  const customImage: NodeSerializerFn = (state, node) => {
    const { src, alt, title, style } = node.attrs as ImageAttrs
    let tag = '<img src="' + src + '"'
    if (alt) tag += ' alt="' + alt + '"'
    if (title) tag += ' title="' + title + '"'
    if (style) tag += ' style="' + style + '"'
    tag += ' />'
    tag += '\n\n'
    state.write(tag)
  }

  const customSerializer = new MarkdownSerializer(
    {
      ...baseNodes,
      image: customImage,
    },
    marks,
  )

  return customSerializer.serialize(editor.state.doc)
}
