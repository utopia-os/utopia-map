import { useEffect } from 'react'

export const useTheme = (defaultTheme = 'default') => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const initialTheme = savedTheme ? (JSON.parse(savedTheme) as string) : defaultTheme
    if (initialTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', initialTheme)
      localStorage.setItem('theme', JSON.stringify(initialTheme))
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.removeItem('theme')
    }
  }, [defaultTheme])
}
