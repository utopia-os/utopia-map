import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { useEffect } from 'react'

import { InputLabel } from './InputLabel'
import { TextEditorMenu } from './TextEditorMenu'

interface RichTextEditorProps {
  labelTitle?: string
  labelStyle?: string
  containerStyle?: string
  defaultValue: string
  placeholder?: string
  showMenu?: boolean
  updateFormValue?: (value: string) => void
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
  const handleChange = () => {
    let newValue: string | undefined = editor.getMarkdown()

    const regex = /!\[.*?\]\(.*?\)/g
    newValue = newValue.replace(regex, (match: string) => match + '\n\n')
    if (updateFormValue) {
      updateFormValue(newValue)
    }
  }

  const editor = useEditor({
    extensions: [
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
      Markdown,
      Image,
      Link,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: defaultValue,
    contentType: 'markdown',
    onUpdate: handleChange,
    editorProps: {
      attributes: {
        class: `tw:h-full markdown tw:max-h-full tw:p-2 tw:overflow-y-auto`,
      },
    },
  })

  useEffect(() => {
    if (editor.getMarkdown() === '' || !editor.getMarkdown()) {
      editor.commands.setContent(defaultValue, { contentType: 'markdown' })
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
