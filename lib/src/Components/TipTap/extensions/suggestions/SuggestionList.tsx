import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

type SuggestionItem = Tag | Item | { isNew: true; name: string }

export interface SuggestionListRef {
  onKeyDown: (event: KeyboardEvent) => boolean
}

interface SuggestionListProps {
  items: SuggestionItem[]
  command: (item: SuggestionItem) => void
  type: 'hashtag' | 'item'
  getItemColor?: (item: Item | undefined, fallback?: string) => string
}

export const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>(
  ({ items, command, type, getItemColor }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {
      setSelectedIndex(0)
    }, [items])

    useImperativeHandle(ref, () => ({
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length)
          return true
        }
        if (event.key === 'Enter') {
          const item = items[selectedIndex]
          if (item) command(item)
          return true
        }
        return false
      },
    }))

    if (items.length === 0) {
      return (
        <div className='tw:dropdown-content tw:menu tw:bg-base-100 tw:rounded-box tw:shadow-lg tw:p-2 tw:z-50'>
          <div className='tw:text-base-content/50 tw:px-2 tw:py-1 tw:text-sm'>Keine Ergebnisse</div>
        </div>
      )
    }

    return (
      <div className='tw:dropdown-content tw:menu tw:bg-base-100 tw:rounded-box tw:shadow-lg tw:max-h-64 tw:overflow-y-auto tw:z-50 tw:p-1'>
        {items.map((item, index) => {
          const isNewTag = 'isNew' in item && item.isNew
          const isTag = type === 'hashtag' && !isNewTag
          const isItem = type === 'item'
          const label = isNewTag ? item.name : 'name' in item ? item.name : ''

          // Calculate color based on type
          let color: string | undefined
          if (isTag && 'color' in item) {
            color = (item as Tag).color
          } else if (isItem && getItemColor) {
            color = getItemColor(item as Item)
          }

          const key = isNewTag ? `new-${item.name}` : 'id' in item ? item.id : `item-${index}`

          return (
            <button
              key={key}
              className={`tw:btn tw:btn-ghost tw:btn-sm tw:justify-start tw:font-bold ${
                index === selectedIndex ? 'tw:bg-base-200' : ''
              }`}
              style={color ? { color } : undefined}
              onClick={() => command(item)}
            >
              {isNewTag ? (
                <span className='tw:flex tw:items-center tw:gap-1'>
                  <span className='tw:text-base-content/50'>Neu:</span>
                  <span>#{label}</span>
                </span>
              ) : (
                <>
                  {type === 'hashtag' ? '#' : '@'}
                  {label}
                </>
              )}
            </button>
          )
        })}
      </div>
    )
  },
)

SuggestionList.displayName = 'SuggestionList'
