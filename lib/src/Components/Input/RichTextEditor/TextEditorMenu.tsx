import BoldIcon from '@heroicons/react/24/solid/BoldIcon'
import H1Icon from '@heroicons/react/24/solid/H1Icon'
import H2Icon from '@heroicons/react/24/solid/H2Icon'
import H3Icon from '@heroicons/react/24/solid/H3Icon'
import ItalicIcon from '@heroicons/react/24/solid/ItalicIcon'
import ListBulletIcon from '@heroicons/react/24/solid/ListBulletIcon'
import NumberedListIcon from '@heroicons/react/24/solid/NumberedListIcon'
import { useEditorState } from '@tiptap/react'
import { MdUndo, MdRedo, MdHorizontalRule } from 'react-icons/md'

import type { Editor } from '@tiptap/react'

export const TextEditorMenu = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isBold: ctx.editor.isActive('bold'),
        canBold: ctx.editor.can().chain().focus().toggleBold().run(),
        isItalic: ctx.editor.isActive('italic'),
        canItalic: ctx.editor.can().chain().focus().toggleItalic().run(),
        isStrike: ctx.editor.isActive('strike'),
        canStrike: ctx.editor.can().chain().focus().toggleStrike().run(),
        isCode: ctx.editor.isActive('code'),
        canCode: ctx.editor.can().chain().focus().toggleCode().run(),
        canClearMarks: ctx.editor.can().chain().focus().unsetAllMarks().run(),
        isParagraph: ctx.editor.isActive('paragraph'),
        isHeading1: ctx.editor.isActive('heading', { level: 1 }),
        isHeading2: ctx.editor.isActive('heading', { level: 2 }),
        isHeading3: ctx.editor.isActive('heading', { level: 3 }),
        isHeading4: ctx.editor.isActive('heading', { level: 4 }),
        isHeading5: ctx.editor.isActive('heading', { level: 5 }),
        isHeading6: ctx.editor.isActive('heading', { level: 6 }),
        isHeading: ctx.editor.isActive('heading'),
        isBulletList: ctx.editor.isActive('bulletList'),
        isOrderedList: ctx.editor.isActive('orderedList'),
        isCodeBlock: ctx.editor.isActive('codeBlock'),
        isBlockquote: ctx.editor.isActive('blockquote'),
        canUndo: ctx.editor.can().chain().focus().undo().run(),
        canRedo: ctx.editor.can().chain().focus().redo().run(),
      }
    },
  })

  return (
    <>
      <ul
        className={
          'tw:menu tw:overflow-x-hidden tw:@sm:overflow-visible tw:menu-horizontal tw:flex-nowrap tw:flex-none tw:bg-base-200 tw:rounded-box tw:w-full tw:rounded-b-none'
        }
      >
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isHeading1 ? 'tw:bg-base-content/10' : ''}`}
            data-tip='Heading 1'
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <H1Icon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isHeading2 ? 'tw:bg-base-content/10' : ''}`}
            data-tip='Heading 2'
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <H2Icon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isHeading3 ? 'tw:bg-base-content/10' : ''}`}
            data-tip='Heading 3'
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <H3Icon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div className='tw:w-[1px] tw:p-0 tw:mx-1 tw:bg-base-content/10 tw:my-1' />
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isBold ? 'tw:bg-base-content/10' : ''}`}
            data-tip='Bold'
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <BoldIcon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isItalic ? 'tw:bg-base-content/10' : ''}`}
            data-tip='Italic'
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div className='tw:w-[1px] tw:p-0 tw:mx-1 tw:bg-base-content/10 tw:my-1' />
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isBulletList ? 'tw:bg-base-content/10' : ''}`}
            data-tip='List'
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <ListBulletIcon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 ${editorState.isOrderedList ? 'tw:bg-base-content/10' : ''}`}
            data-tip='List'
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <NumberedListIcon className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div className='tw:w-[1px] tw:p-0 tw:mx-1 tw:bg-base-content/10 tw:my-1' />
        </li>
        {/* <li>
          <div className='tw:@sm:tooltip tw:px-1.5 tw:mx-0.5' data-tip='Image' onClick={addImage}>
            <PhotoIcon className='tw:w-5 tw:h-5' />
          </div>
        </li> */}
        <li>
          <div
            className='tw:@sm:tooltip tw:px-1'
            data-tip='Horizontal Line'
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <MdHorizontalRule className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <div className='tw:flex-grow'></div>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 tw:hidden tw:@sm:block ${editorState.canUndo ? '' : 'tw:opacity-50'}`}
            data-tip='Undo'
            onClick={() => editor.chain().focus().undo().run()}
          >
            <MdUndo className='tw:w-5 tw:h-5' />
          </div>
        </li>
        <li>
          <div
            className={`tw:@sm:tooltip tw:px-1.5 tw:mx-0.5 tw:hidden tw:@sm:block ${editorState.canRedo ? '' : 'tw:opacity-50'}`}
            data-tip='Redo'
            onClick={() => editor.chain().focus().redo().run()}
          >
            <MdRedo className='tw:w-5 tw:h-5' />
          </div>
        </li>
      </ul>
    </>
  )
}
