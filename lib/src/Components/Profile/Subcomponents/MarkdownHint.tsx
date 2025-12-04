import { useState } from 'react'

import MarkdownSVG from '#assets/markdown.svg'

export const MarkdownHint = () => {
  const [expended, setExpended] = useState<boolean>(false)
  return (
    <div
      onClick={() => {
        setExpended(true)
      }}
      title='Markdown is supported'
      className='flex tw:flex-row tw:text-gray-400 tw:cursor-pointer tw:items-center'
    >
      <img src={MarkdownSVG} alt='Markdown' className='octicon octicon-markdown tw:gray-400' />
      {expended && (
        <a
          href='https://www.markdownguide.org/cheat-sheet/#basic-syntax'
          target='_blank'
          rel='noreferrer'
        >
          <span className='Button-label tw:ml-1'>Markdown is support</span>{' '}
        </a>
      )}
    </div>
  )
}
