/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { log } from 'node:console'

import { Color } from '@tiptap/extension-color'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { Youtube } from '@tiptap/extension-youtube'
import {
  EditorContent,
  useEditor,
  nodePasteRule,
  nodeInputRule,
  mergeAttributes,
} from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { MarkdownSerializer } from 'prosemirror-markdown'
import { useEffect } from 'react'
import { Markdown } from 'tiptap-markdown'

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
  updateFormValue,
}: RichTextEditorProps) {
  const handleChange = () => {
    if (!editor) return

    let newValue = getStyledMarkdown(editor)
    // matcht entweder Markdown-Images *oder* HTML-<img>–Tags
    const regex = /(!\[.*?\]\(.*?\)|<img\b[^>]*?\/?>)/gi

    newValue = newValue.replace(regex, (match) => match + '\n\n')

    if (updateFormValue && newValue) {
      updateFormValue(newValue)
    }
  }

  const editor = useEditor({
    extensions: [
      Color.configure({ types: ['textStyle', 'listItem'] }),
      CustomYoutube.configure({
        nocookie: true,
        allowFullscreen: true,
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
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: defaultValue,
    onUpdate: handleChange,
    editorProps: {
      attributes: {
        class: `tw:h-full markdown tw:max-h-full tw:p-2 tw:overflow-y-auto`,
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
        className={`editor-wrapper tw:border-base-content/20 tw:rounded-box tw:border tw:flex tw:flex-col tw:flex-1 tw:min-h-0`}
      >
        {editor ? (
          <>
            {showMenu ? <TextEditorMenu editor={editor} /> : null}
            <EditorContent editor={editor} />
          </>
        ) : null}
      </div>
    </div>
  )
}

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute('style'),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {}
          }
          return { style: attributes.style }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width } : {}),
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attrs) => (attrs.height ? { height: attrs.height } : {}),
      },
    }
  },
})

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
    state.write(tag)
  }

  const customYoutube: NodeSerializerFn = (state, node) => {
    const { src } = node.attrs as { src: string }

    const match = src.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    )
    const videoId = match?.[1]
    const nocookieUrl = `https://www.youtube-nocookie.com/embed/${videoId}`

    let tag = '<div class="tw:w-full tw:aspect-video tw:overflow-hidden">'
    tag += `<iframe src="${nocookieUrl}" allowfullscreen class="tw-w-full tw-h-full" loading="lazy"></iframe>`
    tag += '</div>'
    state.write(tag)
  }

  const customSerializer = new MarkdownSerializer(
    {
      ...baseNodes,
      image: customImage,
      youtube: customYoutube,
    },
    marks,
  )

  return customSerializer.serialize(editor.state.doc)
}

const CustomYoutube = Youtube.extend({
  addPasteRules() {
    return [
      nodePasteRule({
        find: youtubePasteRegex,
        type: this.type,
        getAttributes: (match) => {
          return { src: match[1] }
        },
      }),
    ]
  },
  addInputRules() {
    return [
      nodeInputRule({
        find: youtubeInputRegex,
        type: this.type,
        getAttributes: (match) => {
          return { src: match[1] }
        },
      }),
    ]
  },
  renderHTML({ HTMLAttributes }) {
    const otherAttrs = { ...HTMLAttributes } as Record<string, string | number>
    const originalSrc = otherAttrs.src as string
    const match = originalSrc.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    )
    const videoId = match?.[1]
    const nocookieUrl = `https://www.youtube-nocookie.com/embed/${videoId}`

    delete otherAttrs.width
    delete otherAttrs.height

    const iframeAttrs = {
      ...otherAttrs,
      src: nocookieUrl,
      allowfullscreen: '',
      class: 'tw-w-full tw-h-full',
      loading: 'lazy',
    }

    return [
      'div',
      { class: 'tw:w-full tw:aspect-video tw:overflow-hidden' },
      ['iframe', iframeAttrs],
    ]
  },
})

const youtubePasteRegex =
  /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+)/g

const youtubeInputRegex =
  /(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+|https?:\/\/youtu\.be\/[\w-]+)$/
