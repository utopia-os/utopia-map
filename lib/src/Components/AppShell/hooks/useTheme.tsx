import { useEffect } from 'react'

import { safeLocalStorage } from '#utils/localStorage'

export const useTheme = (defaultTheme = 'default') => {
  useEffect(() => {
    const savedTheme = safeLocalStorage.getItem('theme')
    const initialTheme = savedTheme ? (JSON.parse(savedTheme) as string) : defaultTheme
    if (initialTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', defaultTheme)
      safeLocalStorage.setItem('theme', JSON.stringify(initialTheme))
    }
  }, [defaultTheme])
}
