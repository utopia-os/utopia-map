/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useRef, useState } from 'react'

import { TagView } from '#components/Templates/TagView'

export const Autocomplete = ({
  inputProps,
  suggestions,
  onSelected,
  pushFilteredSuggestions,
  setFocus,
}: {
  inputProps: any
  suggestions: any[]
  onSelected: (suggestion) => void
  pushFilteredSuggestions?: any[]
  setFocus?: boolean
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([])
  const [heighlightedSuggestion, setHeighlightedSuggestion] = useState<number>(0)

  useEffect(() => {
    pushFilteredSuggestions && setFilteredSuggestions(pushFilteredSuggestions)
  }, [pushFilteredSuggestions])

  useEffect(() => {
    setFocus && inputRef.current?.focus()
  }, [setFocus])

  const inputRef = useRef<HTMLInputElement>()

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase()
    const inputLength = inputValue.length

    return inputLength === 0
      ? []
      : suggestions.filter((tag) => tag.name.toLowerCase().slice(0, inputLength) === inputValue)
  }

  const handleChange = (e) => {
    setFilteredSuggestions(getSuggestions(e.target.value))

    // Call the parent's onChange handler, if it exists
    if (inputProps.onChange) {
      inputProps.onChange(e)
    }
  }

  function handleSuggestionClick(suggestion) {
    onSelected(suggestion)
  }

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowDown':
        heighlightedSuggestion < filteredSuggestions.length - 1 &&
          setHeighlightedSuggestion((current) => current + 1)
        break
      case 'ArrowUp':
        heighlightedSuggestion > 0 && setHeighlightedSuggestion((current) => current - 1)
        break
      case 'Enter':
        if (filteredSuggestions.length > 0) {
          // eslint-disable-next-line security/detect-object-injection
          onSelected(filteredSuggestions[heighlightedSuggestion])
          setHeighlightedSuggestion(0)
        }
        filteredSuggestions.length === 0 && inputProps.onKeyDown(event)
        break
      default:
        inputProps.onKeyDown(event)
        break
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        {...inputProps}
        type='text'
        onChange={(e) => handleChange(e)}
        tabIndex='-1'
        onKeyDown={handleKeyDown}
        className='tw:border-none tw:focus:outline-none tw:focus:ring-0 tw:mt-5'
      />
      <ul
        className={`tw:absolute tw:z-4000 ${filteredSuggestions.length > 0 && 'tw:bg-base-100 tw:rounded-xl tw:p-2'}`}
      >
        {filteredSuggestions.map((suggestion, index) => (
          <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
            <TagView heighlight={index === heighlightedSuggestion} tag={suggestion}></TagView>
          </li>
        ))}
      </ul>
    </div>
  )
}
