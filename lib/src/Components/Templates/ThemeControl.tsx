import { useState, useEffect } from 'react'

import { safeLocalStorage } from '#utils/localStorage'

const themes = [
  'default',
  'light',
  'dark',
  'valentine',
  'retro',
  'aqua',
  'cyberpunk',
  'caramellatte',
  'abyss',
  'silk',
]

export const ThemeControl = () => {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = safeLocalStorage.getItem('theme')
    return savedTheme ? (JSON.parse(savedTheme) as string) : 'default'
  })

  useEffect(() => {
    if (theme !== 'default') {
      safeLocalStorage.setItem('theme', JSON.stringify(theme))
    } else {
      safeLocalStorage.removeItem('theme')
    }
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className='tw:dropdown tw:mr-2'>
      <div tabIndex={0} role='button' className='tw:btn tw:m-1'>
        Theme
        <svg
          width='12px'
          height='12px'
          className='tw:inline-block tw:h-2 tw:w-2 tw:fill-current tw:opacity-60'
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 2048 2048'
        >
          <path d='M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z'></path>
        </svg>
      </div>
      <ul
        tabIndex={0}
        className='tw:dropdown-content tw:bg-base-200 tw:rounded-box tw:z-1 tw:w-36 tw:p-2 tw:shadow-2xl'
      >
        {themes.map((t) => (
          <li key={t}>
            <input
              className={`tw:btn ${theme === t ? 'tw:bg-base-300' : ''} tw:btn-sm tw:btn-block tw:btn-ghost tw:justify-start`}
              type='radio'
              name='theme'
              value={t}
              checked={theme === t}
              onChange={() => setTheme(t)}
              aria-label={t.toLowerCase()}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
