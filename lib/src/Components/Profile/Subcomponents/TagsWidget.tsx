/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useEffect, useState } from 'react'

import { Autocomplete } from '#components/Input/Autocomplete'
import { useTags } from '#components/Map/hooks/useTags'
import { decodeTag, encodeTag } from '#utils/FormatTags'
import { randomColor } from '#utils/RandomColor'

import type { Tag } from '#types/Tag'

// eslint-disable-next-line react/prop-types
export const TagsWidget = ({ placeholder, containerStyle, defaultTags, onUpdate }) => {
  const [input, setInput] = useState('')
  const [isKeyReleased, setIsKeyReleased] = useState(false)
  const tags = useTags()
  const [pushFilteredSuggestions, setPushFilteredSuggestions] = useState<any[]>([])

  const [focusInput, setFocusInput] = useState<boolean>(false)
  const [currentTags, setCurrentTags] = useState<Tag[]>(defaultTags)

  useEffect(() => {
    setCurrentTags(defaultTags)
  }, [defaultTags])

  const onChange = (e) => {
    const { value } = e.target
    setInput(value)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
    const { key } = e
    const trimmedInput = input.trim()

    if (
      (key === 'Enter' || key === ',') &&
      trimmedInput.length &&
      // eslint-disable-next-line react/prop-types
      !defaultTags.some((tag) => tag.name.toLocaleLowerCase() === trimmedInput.toLocaleLowerCase())
    ) {
      const newTag = tags.find((t) => t.name === trimmedInput.toLocaleLowerCase())
      newTag && onUpdate([...currentTags, newTag])
      !newTag &&
        onUpdate([
          ...currentTags,
          { id: crypto.randomUUID(), name: encodeTag(trimmedInput), color: randomColor() },
        ])
      setInput('')
      setPushFilteredSuggestions([])
    }

    // eslint-disable-next-line react/prop-types
    if (key === 'Backspace' && !input.length && defaultTags.length && isKeyReleased) {
      const defaultTagsCopy = [...defaultTags]
      const poppedTag = defaultTagsCopy.pop()
      e.preventDefault()
      onUpdate(defaultTagsCopy)
      poppedTag && setInput(poppedTag.name)
    }

    setIsKeyReleased(false)
  }

  const onKeyUp = () => {
    setIsKeyReleased(true)
  }

  const deleteTag = (tag) => {
    onUpdate(currentTags.filter((t) => t !== tag))
  }

  const onSelected = (tag) => {
    // eslint-disable-next-line react/prop-types
    if (!defaultTags.some((t) => t.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase())) {
      const newTag = tags.find((t) => t.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase())
      newTag && onUpdate([...currentTags, newTag])
      !newTag &&
        onUpdate([
          ...currentTags,
          { id: crypto.randomUUID(), name: tag.name.toLocaleLowerCase(), color: randomColor() },
        ])
      setInput('')
      setPushFilteredSuggestions([])
    }
  }

  const inputProps = {
    value: input,
    placeholder,
    onKeyDown,
    onKeyUp,
    onChange,
    className: 'tw:bg-transparent tw:w-fit tw:mt-5 tw:h-fit',
  }

  /* eslint-disable react/prop-types */
  return (
    <div
      onClick={() => {
        setFocusInput(true)
        setTimeout(() => {
          setFocusInput(false)
        }, 200)
      }}
      className={`tw:textarea tw:cursor-text ${containerStyle}`}
    >
      <div className='tw:flex tw:flex-wrap tw:h-fit'>
        {defaultTags.map((tag) => (
          <div
            key={tag.name}
            className='tw:rounded-2xl tw:text-white tw:p-2 tw:px-4 tw:shadow-xl tw:card tw:mt-3 tw:mr-4'
            style={{ backgroundColor: tag.color ? tag.color : '#666' }}
          >
            <div className='tw:card-actions tw:justify-end'>
              <label
                className='tw:btn tw:btn-xs tw:btn-circle tw:absolute tw:-right-2 tw:-top-2 tw:bg-white tw:text-gray-600'
                onClick={() => {
                  deleteTag(tag)
                }}
              >
                ✕
              </label>
            </div>
            <b>{decodeTag(tag.name)}</b>
          </div>
        ))}
        <Autocomplete
          suggestions={tags}
          pushFilteredSuggestions={pushFilteredSuggestions}
          setFocus={focusInput}
          inputProps={inputProps}
          onSelected={(tag) => {
            onSelected(tag)
          }}
        />
      </div>
    </div>
  )
  /* eslint-enable react/prop-types */
}
