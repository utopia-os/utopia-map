import classNames from 'classnames'

import { Tag } from '#src/types'
import { decodeTag } from '#utils/FormatTags'

export const TagView = ({
  tag,
  heighlight,
  onClick,
  count,
}: {
  tag: Tag
  heighlight?: boolean
  onClick?: (/* e */) => void
  count?: number
}) => {
  return (
    // Use your imagination to render suggestions.

    <div
      key={tag.name}
      onClick={onClick}
      className={classNames(
        'tw-flex tw-items-center tw-flex-row tw-rounded-2xl tw-text-white tw-p-2 tw-px-4 tw-shadow-xl tw-card tw-mt-3 tw-mr-4 tw-cursor-pointer tw-w-fit',
        { 'tw-border-4 tw-border-base-200 tw-shadow-lg': heighlight },
      )}
      style={{ backgroundColor: tag.color ? tag.color : '#666' }}
    >
      <b>{decodeTag(tag.name)}</b>
      {count && <span className='tw-ml-2'>({count})</span>}
    </div>
  )
}
