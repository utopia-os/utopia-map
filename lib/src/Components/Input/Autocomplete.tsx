import { useEffect, useRef, useState } from 'react'

import { TagView } from '#components/Templates/TagView'

import type { Tag } from '#types/Tag'
import type { ChangeEvent, KeyboardEvent } from 'react'

interface InputProps {
  value: string
  placeholder?: string
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onKeyUp: () => void
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
}

interface AutocompleteProps {
  inputProps: InputProps
  suggestions: Tag[]
  onSelected: (suggestion: Tag) => void
  pushFilteredSuggestions?: Tag[]
  setFocus?: boolean
}

export const Autocomplete = ({
  inputProps,
  suggestions,
  onSelected,
  pushFilteredSuggestions,
  setFocus,
}: AutocompleteProps) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<Tag[]>([])
  const [highlightedSuggestion, setHighlightedSuggestion] = useState<number>(0)

  useEffect(() => {
    if (pushFilteredSuggestions) {
      setFilteredSuggestions(pushFilteredSuggestions)
    }
  }, [pushFilteredSuggestions])

  useEffect(() => {
    if (setFocus) {
      inputRef.current?.focus()
    }
  }, [setFocus])

  const inputRef = useRef<HTMLInputElement>(null)

  const getSuggestions = (value: string): Tag[] => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0
      ? []
      : suggestions.filter((tag) => tag.name.toLowerCase().startsWith(inputValue))
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilteredSuggestions(getSuggestions(e.target.value))

    // Call the parent's onChange handler
    inputProps.onChange(e)
  }

  function handleSuggestionClick(suggestion: Tag) {
    onSelected(suggestion)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        if (highlightedSuggestion < filteredSuggestions.length - 1) {
          setHighlightedSuggestion((current) => current + 1)
        }
        break
      case 'ArrowUp':
        if (highlightedSuggestion > 0) {
          setHighlightedSuggestion((current) => current - 1)
        }
        break
      case 'Enter':
        event.preventDefault()
        if (filteredSuggestions.length > 0) {
          // eslint-disable-next-line security/detect-object-injection
          onSelected(filteredSuggestions[highlightedSuggestion])
          setHighlightedSuggestion(0)
        }
        if (filteredSuggestions.length === 0) {
          inputProps.onKeyDown(event)
        }
        break
      default:
        inputProps.onKeyDown(event)
        break
    }
  }

  return (
    <div className='tw:flex-1'>
      <input
        ref={inputRef}
        {...inputProps}
        type='text'
<<<<<<< refactor-tab-layout
        onChange={(e) => handleChange(e)}
        tabIndex={-1}
=======
        onChange={(e) => {
          handleChange(e)
        }}
        tabIndex='-1'
>>>>>>> main
        onKeyDown={handleKeyDown}
        className='tw:border-none tw:focus:outline-none tw:focus:ring-0 tw:mt-5 tw:w-full'
      />
      <ul
        className={`tw:absolute tw:z-4000 ${filteredSuggestions.length > 0 ? 'tw:bg-base-100 tw:rounded-xl tw:p-2' : ''}`}
      >
        {filteredSuggestions.map((suggestion, index) => (
          <li
<<<<<<< refactor-tab-layout
            key={suggestion.id}
            role='option'
            tabIndex={0}
            aria-selected={index === highlightedSuggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }
            }}
          >
            <TagView heighlight={index === highlightedSuggestion} tag={suggestion}></TagView>
=======
            key={index}
            onClick={() => {
              handleSuggestionClick(suggestion)
            }}
          >
            <TagView heighlight={index === heighlightedSuggestion} tag={suggestion}></TagView>
>>>>>>> main
          </li>
        ))}
      </ul>
    </div>
  )
}
