import { useState } from 'react'

interface Props {
  selectedEmoji: string
  selectedColor: string
  selectedShape: string
  setSelectedEmoji: (emoji: string) => void
  setSelectedColor: (color: string) => void
  setSelectedShape: (shape: string) => void
}

export const EmojiPicker = ({
  selectedEmoji,
  selectedColor,
  selectedShape,
  setSelectedEmoji,
  setSelectedColor,
  setSelectedShape,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  const emojis = [
    '❤️',
    '🙏',
    '👍',
    '🌻',
    '✨',
    '☀️',
    '🔥',
    '🪵',
    '💧',
    '🎶',
    '🎨',
    '🍄',
    '📝',
    '✉️',
    '🧩',
    '💡',
    '🎓',
    '💬',
    '🛠',
    '💻',
    '🕹',
    '🖨',
    '🚐',
    '🛒',
    '⚽️',
    '🧵',
    '👀',
    '🌱',
    '🏕',
    '💪',
    '🎁',
    '🏹',
    '🥕',
    '🥇',
    '🥈',
    '🥉',
  ]
  const shapes = ['squircle', 'circle', 'hexagon-2']

  const colors = [
    '#FF99C8',
    '#fff0d6',
    '#FCF6BD',
    '#D0F4DE',
    '#A9DEF9',
    '#E4C1F9',
    '#de324c',
    '#f4895f',
    '#f8e16f',
    '#95cf92',
    '#369acc',
    '#9656a2',
  ]

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const selectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji)
    setIsOpen(false)
  }

  const selectShape = (shape: string) => {
    setSelectedShape(shape)
    setIsOpen(false)
  }

  const selectColor = (color: string) => {
    setSelectedColor(color)
    setIsOpen(false)
  }

  return (
    <>
      <div
        onClick={toggleDropdown}
        className={`tw:cursor-pointer ${selectedEmoji === 'select badge' ? 'tw:text-sm tw:p-9! tw:text-center ' : 'tw:text-6xl'} tw:mask tw:mask-${selectedShape} tw:p-6`}
        style={{ backgroundColor: selectedColor }}
      >
        {selectedEmoji}
      </div>

      {isOpen && (
        <div className='tw:absolute tw:z-3000 tw:top-0 tw:left-1/2 tw:transform tw:-translate-x-1/2 tw:mt-12 tw:bg-base-100 tw:rounded-2xl tw:shadow-lg tw:p-2 tw:w-full'>
          <div className='tw:grid tw:grid-cols-6 tw:gap-2 tw:pb-2'>
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  selectEmoji(emoji)
                }}
                className={`tw:cursor-pointer  tw:text-2xl tw:p-2 tw:hover:bg-base-200 tw:rounded-md ${emoji === selectedEmoji ? 'tw:bg-base-300' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <hr />
          <div className='tw:grid tw:grid-cols-3 tw:gap-2 tw:py-2'>
            {shapes.map((shape) => (
              <div
                key={shape}
                className={`tw:cursor-pointer tw:hover:bg-base-200 tw:rounded-md tw:p-2 ${shape === selectedShape ? 'tw:bg-base-300' : ''}`}
                onClick={() => {
                  selectShape(shape)
                }}
              >
                <div
                  className={`tw:h-12 tw:w-full tw:mask ${shape === 'squircle' ? 'tw:mask-squircle' : shape === 'circle' ? 'tw:mask-circle' : 'tw:mask-hexagon-2'}  tw:bg-neutral-content`}
                ></div>
              </div>
            ))}
          </div>
          <hr />
          <div className='tw:grid tw:grid-cols-6 tw:gap-2 tw:py-2 tw:px-6'>
            {colors.map((color) => (
              <div
                key={color}
                className={`tw:cursor-pointer tw:hover:bg-base-200 tw:rounded-md tw:p-2 tw:flex tw:justify-center tw:items-center  ${color === selectedColor ? 'tw:bg-base-300' : ''}`}
                onClick={() => {
                  selectColor(color)
                }}
              >
                <div
                  className={`tw:h-8 tw:w-8 tw:rounded-full`}
                  style={{ backgroundColor: color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
