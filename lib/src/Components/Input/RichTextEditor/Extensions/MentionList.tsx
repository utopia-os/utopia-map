import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'

export interface MentionListHandle {
  onKeyDown: (args: { event: KeyboardEvent }) => boolean
}

interface MentionListProps {
  items: string[]
  command: (payload: { id: string }) => void
}

export const MentionList = forwardRef<MentionListHandle, MentionListProps>(function MentionList(
  { items, command },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0)

  const selectItem = (index: number) => {
    // eslint-disable-next-line security/detect-object-injection
    const item = items[index]
    if (item) {
      command({ id: item })
    }
  }

  const upHandler = () => {
    setSelectedIndex((prev) => (items.length > 0 ? (prev + items.length - 1) % items.length : 0))
  }

  const downHandler = () => {
    setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0))
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      switch (event.key) {
        case 'ArrowUp':
          upHandler()
          return true
        case 'ArrowDown':
          downHandler()
          return true
        case 'Enter':
          enterHandler()
          return true
        default:
          return false
      }
    },
  }))

  return (
    <div className='dropdown-menu'>
      {items.length > 0 ? (
        items.map((item, index) => (
          <button
            key={index}
            className={index === selectedIndex ? 'is-selected' : ''}
            onClick={() => selectItem(index)}
          >
            {item}
          </button>
        ))
      ) : (
        <div className='item'>No result</div>
      )}
    </div>
  )
})
